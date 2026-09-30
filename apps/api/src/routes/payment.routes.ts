import { Router } from "express";
import bodyParser from "body-parser";
import { PaymentService, IPaymentProvider } from "../services/PaymentService";
import { Payment, Order } from "../models";
import { PaystackProvider } from "../services/providers/PaystackProvider";
import { FlutterwaveProvider } from "../services/providers/FlutterwaveProvider";
import { OrangeMoneyProvider } from "../services/providers/OrangeMoneyProvider";
import { InventoryService } from "../services/InventoryService";
import { NotificationService } from "../services/NotificationService";

// Configure supported providers
const providers: Record<string, IPaymentProvider> = {
  paystack: new PaystackProvider(),
  flutterwave: new FlutterwaveProvider(),
  orange_money: new OrangeMoneyProvider(),
} as any;
const service = new PaymentService(providers as any);
const inventoryService = new InventoryService();
const notificationService = new NotificationService();

const router = Router();

router.post("/init", async (req: any, res: any, next: any) => {
  try {
    const { orderId, provider, amount, currency, customer, returnUrl, metadata } = req.body || {};
    const result = await service.initialize({ orderId, provider, amount, currency, customer, returnUrl, metadata });
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
});

router.get("/verify", async (req: any, res: any, next: any) => {
  try {
    const provider = String(req.query.provider);
    const reference = String(req.query.reference);
    const orderId = req.query.orderId ? String(req.query.orderId) : undefined;
    const result = await service.verify(provider as any, reference);
    // Reflect on Order immediately as well (in addition to webhooks)
    try {
      let payment = await Payment.findOne({ reference });
      // Attach orderId if provided and missing
      if (payment && orderId && !payment.orderId) {
        payment.orderId = orderId as any;
        await payment.save();
      }
      // If still missing payment record (edge case), bail gracefully
      if (!payment && orderId) {
        // Create minimal payment record linked to order for traceability
        payment = await Payment.create({
          orderId: orderId as any,
          provider: provider as any,
          reference,
          amount: 0,
          currency: "NGN",
          status: result.ok ? "paid" : "failed",
        } as any);
      }
      if (payment?.orderId && (typeof payment.orderId !== 'string' || !payment.orderId.startsWith('WALLET_TOPUP_'))) {
        if (payment.status === "paid" || result.ok) {
          // DISABLED FOR SINGLE-VENDOR PLATFORM - Uncomment to re-enable payout functionality
          await Order.updateOne({ _id: payment.orderId }, { $set: { paymentStatus: "completed" /* , payoutStatus: "pending" */ } });

          // Confirm stock deduction for completed payment
          try {
            const order = await Order.findById(payment.orderId).select('lineItems').lean();
            if (order?.lineItems && order.lineItems.length > 0) {
              for (const item of order.lineItems) {
                await inventoryService.confirmStockDeduction(
                  item.productId.toString(),
                  item.qty,
                  payment.orderId.toString()
                );
              }
            }
          } catch (inventoryError) {
            console.error('Failed to confirm stock deduction:', inventoryError);
            // Continue with payment processing even if inventory update fails
          }

          // Trigger "Order Placed" notification for card/external payments
          try {
            const fullOrder = await Order.findById(payment.orderId).lean();
            if (fullOrder && fullOrder.buyer) {
              await notificationService.createOrderNotification('order_placed', {
                orderId: fullOrder._id.toString(),
                orderNumber: fullOrder._id.toString().slice(-6),
                totalAmount: fullOrder.totalPrice,
                currency: fullOrder.currency || "NGN",
                buyerId: fullOrder.buyer.toString(),
                sellerId: fullOrder.lineItems?.[0]?.vendorId?.toString() || "",
                productTitle: fullOrder.lineItems?.[0]?.productTitle || "Order",
                quantity: fullOrder.lineItems?.[0]?.qty || 1
              });
            }
          } catch (notifError) {
            console.error('Failed to send order placed notification after verification:', notifError);
          }
        } else if (payment.status === "failed") {
          await Order.updateOne({ _id: payment.orderId }, { $set: { paymentStatus: "failed" } });

          // Release reserved stock if payment fails
          try {
            const order = await Order.findById(payment.orderId).select('lineItems').lean();
            if (order?.lineItems && order.lineItems.length > 0) {
              for (const item of order.lineItems) {
                await inventoryService.releaseStock(
                  item.productId.toString(),
                  item.qty,
                  payment.orderId.toString(),
                  "Payment failed"
                );
              }
            }
          } catch (inventoryError) {
            console.error('Failed to release stock for failed payment:', inventoryError);
            // Continue with payment processing even if inventory update fails
          }
        }
      } else if (payment?.orderId && typeof payment.orderId === 'string' && payment.orderId.startsWith('WALLET_TOPUP_')) {
        // Handle wallet topup payments
        console.log('Processing wallet top-up payment:', { orderId: payment.orderId, status: payment.status, amount: payment.amount, currency: payment.currency });

        // Check if already settled to prevent replay attacks
        if (payment.settled) {
          console.log('Payment already settled, skipping wallet credit:', payment.reference);
          return res.json({ status: "success", data: result });
        }

        if (payment.status === "paid" || result.ok) {
          try {
            // Extract userId from orderId (format: WALLET_TOPUP_userId_timestamp)
            const parts = payment.orderId.split('_');
            if (parts.length >= 3) {
              const userId = parts[2];
              console.log('Extracted userId from orderId:', userId);
              const { WalletService } = require('../services/WalletService');
              const walletService = new WalletService();

              // Update wallet balance
              const transaction = await walletService.addFunds(
                userId,
                payment.currency === "NGN" ? payment.amount / 100 : payment.amount,
                payment.currency,
                "user",
                `Wallet top-up via ${payment.provider}`,
                {
                  paymentId: payment._id,
                  reference: payment.reference,
                  // Use deterministic idempotency key based on payment ID to prevent duplicates
                  idempotencyKey: `topup_${payment._id}`
                }
              );

              // Mark payment as settled
              payment.settled = true;
              await payment.save();

              console.log(`Wallet top-up successful: ${payment.amount} ${payment.currency} added to user ${userId}, transaction ID: ${transaction._id}`);
            }
          } catch (walletError) {
            console.error('Failed to update wallet balance for top-up:', walletError);
          }
        }
      }
    } catch { }
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
});

// Webhook endpoints: use raw body for signature verification when providers are added
router.post("/webhook/paystack", bodyParser.raw({ type: "*/*" }), async (req: any, res: any) => {
  const sig = (req.headers["x-paystack-signature"] as string) || "";
  const raw = req.body as Buffer;
  const valid = PaystackProvider.verifyWebhookSignature(raw, sig);
  if (!valid) return res.status(400).send("invalid signature");

  try {
    const payload = JSON.parse(raw.toString("utf8"));
    const evt = String(payload?.event || "");
    const data = payload?.data || {};
    const reference = String(data?.reference || "");
    if (!reference) return res.status(200).send("ok");

    // Handle Bazaar payment webhooks
    if (data?.metadata?.type === "bazaar" || reference.startsWith("BZ-")) {
      const { default: BazaarBooking } = await import("../models/BazaarBooking");
      const booking = await BazaarBooking.findOne({
        $or: [{ reference }, { paystackReference: reference }],
      });
      if (booking) {
        booking.rawWebhook = payload;
        if (evt === "charge.success" || data?.status === "success") {
          booking.paymentStatus = "paid";
          const { default: emailService } = await import("../services/EmailService");
          emailService.sendBazaarConfirmationEmail(booking as any).catch((err) => {
            console.error("Failed to send bazaar webhook confirmation email:", err);
          });
          const { BazaarController } = await import("../controllers/bazaar.controller");
          await BazaarController.creditPromoterIfApplicable(booking);
        } else if (evt === "charge.failed") {
          booking.paymentStatus = "failed";
        }
        await booking.save();
        return res.status(200).send("ok");
      }
    }

    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(200).send("ok");

    payment.rawWebhook = payload;
    if (evt === "charge.success" || data?.status === "success") {
      payment.status = "paid";
      if (typeof data.amount === "number") payment.amount = data.amount;
      if (typeof data.currency === "string") payment.currency = data.currency;
    } else if (evt === "charge.failed") {
      payment.status = "failed";
    }
    await payment.save();

    // Reflect on Order: mark paymentStatus when paid (only for actual orders, not wallet topups)
    if (payment.orderId && (typeof payment.orderId !== 'string' || !payment.orderId.startsWith('WALLET_TOPUP_'))) {
      if (payment.status === "paid") {
        // DISABLED FOR SINGLE-VENDOR PLATFORM - Uncomment to re-enable payout functionality
        await Order.updateOne({ _id: payment.orderId }, { $set: { paymentStatus: "completed" /* , payoutStatus: "pending" */ } });

        // Confirm stock deduction for completed payment
        try {
          const order = await Order.findById(payment.orderId).select('lineItems').lean();
          if (order?.lineItems && order.lineItems.length > 0) {
            for (const item of order.lineItems) {
              await inventoryService.confirmStockDeduction(
                item.productId.toString(),
                item.qty,
                payment.orderId.toString()
              );
            }
          }
        } catch (inventoryError) {
          console.error('Failed to confirm stock deduction in webhook:', inventoryError);
        }

        // Trigger "Order Placed" notification for card/external payments via webhook
        try {
          const fullOrder = await Order.findById(payment.orderId).lean();
          if (fullOrder && fullOrder.buyer) {
            await notificationService.createOrderNotification('order_placed', {
              orderId: fullOrder._id.toString(),
              orderNumber: fullOrder._id.toString().slice(-6),
              totalAmount: fullOrder.totalPrice,
              currency: fullOrder.currency || "NGN",
              buyerId: fullOrder.buyer.toString(),
              sellerId: fullOrder.lineItems?.[0]?.vendorId?.toString() || "",
              productTitle: fullOrder.lineItems?.[0]?.productTitle || "Order",
              quantity: fullOrder.lineItems?.[0]?.qty || 1
            });
          }
        } catch (notifError) {
          console.error('Failed to send order placed notification after webhook:', notifError);
        }
      } else if (payment.status === "failed") {
        await Order.updateOne({ _id: payment.orderId }, { $set: { paymentStatus: "failed" } });

        // Release reserved stock if payment fails
        try {
          const order = await Order.findById(payment.orderId).select('lineItems').lean();
          if (order?.lineItems && order.lineItems.length > 0) {
            for (const item of order.lineItems) {
              await inventoryService.releaseStock(
                item.productId.toString(),
                item.qty,
                payment.orderId.toString(),
                "Payment failed via webhook"
              );
            }
          }
        } catch (inventoryError) {
          console.error('Failed to release stock for failed payment in webhook:', inventoryError);
        }
      } else if (payment?.orderId && typeof payment.orderId === 'string' && payment.orderId.startsWith('WALLET_TOPUP_')) {
        // Handle wallet topup payments in webhook
        console.log('Processing wallet top-up payment in webhook:', { orderId: payment.orderId, event: evt, status: data?.status, amount: payment.amount, currency: payment.currency });

        // Check if already settled to prevent replay attacks
        if (payment.settled) {
          console.log('Payment already settled, skipping wallet credit in webhook:', payment.reference);
          return res.status(200).send("ok");
        }

        if (evt === "charge.success" || data?.status === "success") {
          try {
            // Extract userId from orderId (format: WALLET_TOPUP_userId_timestamp)
            const parts = payment.orderId.split('_');
            if (parts.length >= 3) {
              const userId = parts[2];
              console.log('Extracted userId from orderId in webhook:', userId);
              const { WalletService } = require('../services/WalletService');
              const walletService = new WalletService();

              // Update wallet balance
              const transaction = await walletService.addFunds(
                userId,
                payment.currency === "NGN" ? payment.amount / 100 : payment.amount,
                payment.currency,
                "user",
                `Wallet top-up via ${payment.provider}`,
                {
                  paymentId: payment._id,
                  reference: payment.reference,
                  // Use deterministic idempotency key based on payment ID to prevent duplicates
                  idempotencyKey: `topup_${payment._id}`
                }
              );

              // Mark payment as settled
              payment.settled = true;
              await payment.save();

              console.log(`Wallet top-up successful via webhook: ${payment.amount} ${payment.currency} added to user ${userId}, transaction ID: ${transaction._id}`);
            }
          } catch (walletError) {
            console.error('Failed to update wallet balance for top-up in webhook:', walletError);
          }
        }
      }
    }
    return res.status(200).send("ok");
  } catch (e) {
    return res.status(200).send("ok");
  }
});

// OPay webhook removed; using Flutterwave's verification-only flow for OPay payments

export default router;

