import { Request, Response, NextFunction } from "express";
import BazaarConfig from "../models/BazaarConfig";
import BazaarBooking from "../models/BazaarBooking";
import BazaarPromoter from "../models/BazaarPromoter";
import { PaystackProvider } from "../services/providers/PaystackProvider";
import emailService from "../services/EmailService";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const paystackProvider = new PaystackProvider();

// Helper to get or initialize singleton config
async function getOrCreateConfig() {
  let config = await BazaarConfig.findOne();
  if (!config) {
    config = await BazaarConfig.create({
      isPortalActive: true,
      ticketSalesActive: true,
      exhibitorApplicationsActive: true,
      sponsorshipActive: true,
      inactiveMessage:
        "GloTrade International Trade Fair 2026 portal is currently inactive. Stay tuned for official date announcements!",
      eventTitle: "GloTrade International Trade Fair 2026",
      eventDateLabel: "1st – 5th December 2026",
      eventVenue:
        "Nigerian Army Conference Centre & Suites (NACCAS), Km 10 Expressway, Asokoro, Abuja, FCT – Nigeria",
      whatsappNumber: "2347044600924",
      email: "tradefair@glotrade.online",
    });
  } else {
    let changed = false;
    if (
      !config.eventTitle ||
      config.eventTitle === "GloTrade Bazaar Abuja 2026" ||
      config.eventTitle.toLowerCase().includes("bazaar abuja")
    ) {
      config.eventTitle = "GloTrade International Trade Fair 2026";
      changed = true;
    }
    if (!config.eventDateLabel || config.eventDateLabel === "12 September 2026") {
      config.eventDateLabel = "1st – 5th December 2026";
      changed = true;
    }
    if (
      !config.eventVenue ||
      config.eventVenue === "Harrow Park, Abuja" ||
      config.eventVenue.includes("TBA") ||
      config.eventVenue.includes("announced")
    ) {
      config.eventVenue =
        "Nigerian Army Conference Centre & Suites (NACCAS), Km 10 Expressway, Asokoro, Abuja, FCT – Nigeria";
      changed = true;
    }
    if (!config.inactiveMessage || config.inactiveMessage.includes("GloTrade Bazaar Abuja")) {
      config.inactiveMessage =
        "GloTrade International Trade Fair 2026 portal is currently inactive. Stay tuned for official date announcements!";
      changed = true;
    }
    if (
      !config.whatsappNumber ||
      config.whatsappNumber === "2348000000000" ||
      config.whatsappNumber.includes("8000000000")
    ) {
      config.whatsappNumber = "2347044600924";
      changed = true;
    }
    if (changed) {
      await config.save();
    }
  }

  // Migrate legacy bookings without an eventId to "bazaar_abuja_2026"
  try {
    await BazaarBooking.updateMany(
      { eventId: { $exists: false } },
      { $set: { eventId: "bazaar_abuja_2026" } }
    );
  } catch (e) {
    console.error("Failed to migrate legacy bookings eventId:", e);
  }

  return config;
}

// Generate unique Ticket Code (8 chars)
function generateTicketCode(): string {
  return "GTB-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

// Helper to extract authenticated manager/admin details for action blame/audit tracking
function extractAdminActor(req: Request) {
  const user = (req as any).user;
  if (!user) return null;
  const name =
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    user.email ||
    "Admin Manager";
  return {
    adminId: String(user._id || user.id || ""),
    name,
    email: user.email || "",
    role: user.role || "bazaar_manager",
  };
}

export class BazaarController {
  // Public: Get portal config & seasonal status
  static async getPublicConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await getOrCreateConfig();
      res.json({ status: "success", data: config });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Update portal config & seasonal controls
  static async updateAdminConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        isPortalActive,
        ticketSalesActive,
        exhibitorApplicationsActive,
        sponsorshipActive,
        inactiveMessage,
        eventTitle,
        eventDateLabel,
        eventVenue,
        whatsappNumber,
        email,
        bankName,
        bankAccountName,
        bankAccountNumber,
      } = req.body;

      const config = await getOrCreateConfig();

      if (typeof isPortalActive === "boolean") config.isPortalActive = isPortalActive;
      if (typeof ticketSalesActive === "boolean") config.ticketSalesActive = ticketSalesActive;
      if (typeof exhibitorApplicationsActive === "boolean")
        config.exhibitorApplicationsActive = exhibitorApplicationsActive;
      if (typeof sponsorshipActive === "boolean") config.sponsorshipActive = sponsorshipActive;
      if (typeof req.body.promoterProgramActive === "boolean") {
        config.promoterProgramActive = req.body.promoterProgramActive;
      }
      if (req.body.promoterCommissionPercent !== undefined) {
        const pVal = Number(req.body.promoterCommissionPercent);
        if (!isNaN(pVal) && pVal >= 0 && pVal <= 100) {
          config.promoterCommissionPercent = pVal;
        }
      }

      if (inactiveMessage !== undefined) config.inactiveMessage = inactiveMessage;
      if (eventTitle !== undefined) config.eventTitle = eventTitle;
      if (eventDateLabel !== undefined) config.eventDateLabel = eventDateLabel;
      if (eventVenue !== undefined) config.eventVenue = eventVenue;
      if (whatsappNumber !== undefined) {
        const cleaned = String(whatsappNumber).replace(/[^0-9]/g, "");
        config.whatsappNumber =
          cleaned === "2348000000000" || !cleaned ? "2347044600924" : cleaned;
      }
      if (email !== undefined) config.email = email;

      // Only Super Admin can modify official bank transfer checkout account details
      const isSuperAdmin = Boolean((req as any).user?.isSuperAdmin);
      if (isSuperAdmin) {
        if (bankName !== undefined) config.bankName = bankName;
        if (bankAccountName !== undefined) config.bankAccountName = bankAccountName;
        if (bankAccountNumber !== undefined) config.bankAccountNumber = bankAccountNumber;
      }

      config.updatedAt = new Date();
      if ((req as any).user) {
        config.updatedBy = (req as any).user._id || (req as any).user.email;
      }

      await config.save();
      res.json({
        status: "success",
        data: config,
        message: isSuperAdmin
          ? "Bazaar settings and bank account details updated"
          : "Bazaar settings updated (bank account details are restricted to Super Admin)",
      });
    } catch (err) {
      next(err);
    }
  }

  // Public: Initialize ticket/stall/sponsorship booking & Paystack checkout
  static async initializeBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await getOrCreateConfig();

      if (!config.isPortalActive) {
        return res.status(403).json({
          status: "fail",
          message: config.inactiveMessage || "Bazaar portal is currently inactive.",
        });
      }

      const {
        type = "ticket",
        packageId,
        packageName,
        amount = 0,
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        notes,
        returnUrl,
        paymentMethod,
        isManualBankTransfer,
      } = req.body;

      // Validate portal feature status
      if (type === "ticket" && !config.ticketSalesActive) {
        return res.status(400).json({ status: "fail", message: "Ticket sales are currently closed." });
      }
      if (type === "exhibitor" && !config.exhibitorApplicationsActive) {
        return res.status(400).json({ status: "fail", message: "Exhibitor stall applications are closed." });
      }
      if (type === "sponsorship" && !config.sponsorshipActive) {
        return res.status(400).json({ status: "fail", message: "Sponsorship applications are closed." });
      }

      if (!customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ status: "fail", message: "Name, email, and phone number are required." });
      }

      const prefix = type === "ticket" ? "TK" : type === "exhibitor" ? "EX" : type === "sponsorship" ? "SP" : "CT";
      const reference = `BZ-${prefix}-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      const ticketCode = generateTicketCode();

      // Resolve Promoter Referral Code if provided for Exhibitor booking
      let promoterId: any = undefined;
      let promoterCodeClean: string | undefined = undefined;
      let promoterCommissionPercent: number | undefined = undefined;
      let promoterCommissionAmount: number | undefined = undefined;
      let promoterCommissionStatus: "pending" | "approved" | "paid" | "cancelled" | undefined = undefined;

      if (type === "exhibitor" && req.body.promoterCode) {
        try {
          const rawCode = String(req.body.promoterCode).trim().toUpperCase();
          const promoter = await BazaarPromoter.findOne({ promoterCode: rawCode, status: "active" });
          if (promoter) {
            promoterId = promoter._id;
            promoterCodeClean = promoter.promoterCode;
            promoterCommissionPercent = Number(config.promoterCommissionPercent) || 5;
            promoterCommissionAmount = Math.round((Number(amount) * promoterCommissionPercent) / 100);
            promoterCommissionStatus = "pending";

            promoter.stats.totalReferredExhibitors = (promoter.stats.totalReferredExhibitors || 0) + 1;
            promoter.stats.totalBookingValue = (promoter.stats.totalBookingValue || 0) + Number(amount);
            await promoter.save();
          }
        } catch (promoterErr) {
          console.error("Error attaching promoter referral to booking:", promoterErr);
        }
      }

      const booking = await BazaarBooking.create({
        eventId: req.body.eventId || "tradefair_2026",
        reference,
        ticketCode,
        type,
        packageId: packageId || "general",
        packageName: packageName || "General Ticket",
        amount: Number(amount),
        currency: "NGN",
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        notes,
        paymentStatus: Number(amount) <= 0 ? "paid" : "pending",
        checkInStatus: "pending",
        promoterCode: promoterCodeClean,
        promoterId,
        promoterCommissionPercent,
        promoterCommissionAmount,
        promoterCommissionStatus,
      });

      // Check if this is a manual bank transfer request
      const isManual =
        paymentMethod === "bank_transfer" ||
        paymentMethod === "manual" ||
        isManualBankTransfer === true ||
        (typeof notes === "string" && notes.includes("[Manual Bank Transfer Enquiry]"));

      // If free ticket, contact inquiry, or manual bank transfer
      if (isManual || Number(amount) <= 0) {
        if (Number(amount) <= 0 && type !== "contact") {
          emailService.sendBazaarConfirmationEmail(booking).catch((emailErr) => {
            console.error("Failed to send bazaar confirmation email for free ticket:", emailErr);
          });
        }

        return res.json({
          status: "success",
          data: {
            booking,
            free: Number(amount) <= 0,
            manual: isManual,
            reference: booking.reference,
            ticketCode: booking.ticketCode,
          },
        });
      }

      // Initialize Paystack payment
      try {
        const callback = returnUrl || `${req.protocol}://${req.get("host")}/bazaar/callback`;
        const paystackResult = await paystackProvider.initialize({
          orderId: booking.reference,
          provider: "paystack",
          amount: Number(amount) * 100, // convert NGN to kobo
          currency: "NGN",
          customer: { email: customerEmail, name: customerName },
          returnUrl: `${callback}?reference=${booking.reference}`,
          metadata: {
            type: "bazaar",
            bookingId: (booking._id as any).toString(),
            bookingType: type,
            reference: booking.reference,
            ticketCode: booking.ticketCode,
            phone: customerPhone,
          },
        });

        booking.paystackReference = paystackResult.reference;
        booking.paystackUrl = paystackResult.url;
        await booking.save();

        return res.json({
          status: "success",
          data: {
            authorizationUrl: paystackResult.url,
            paystackReference: paystackResult.reference,
            reference: booking.reference,
            ticketCode: booking.ticketCode,
            booking,
          },
        });
      } catch (paystackErr: any) {
        console.error("Paystack initialization failed for Bazaar booking:", paystackErr);
        return res.status(400).json({
          status: "fail",
          message: paystackErr?.message || "Paystack payment initialization unavailable. Please use Bank Transfer / WhatsApp option.",
          data: {
            booking,
            reference: booking.reference,
            ticketCode: booking.ticketCode,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  // Public: Verify payment status by reference or ticket code
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = String(req.query.reference || req.params.reference || "").trim();
      if (!reference) {
        return res.status(400).json({ status: "fail", message: "Reference or Ticket Code is required." });
      }

      const booking = await BazaarBooking.findOne({
        $or: [
          { reference },
          { paystackReference: reference },
          { ticketCode: reference.toUpperCase() },
        ],
      });

      if (!booking) {
        return res.status(404).json({ status: "fail", message: "Booking reference or ticket code not found." });
      }

      if (booking.paymentStatus === "paid") {
        return res.json({ status: "success", data: { booking, paid: true } });
      }

      // If booking was initialized with Paystack, attempt verification
      if (booking.paystackReference) {
        try {
          const verifyRes = await paystackProvider.verify(booking.paystackReference);
          if (verifyRes?.paid) {
            booking.paymentStatus = "paid";
            await booking.save();

            // Credit promoter commission if applicable
            await BazaarController.creditPromoterIfApplicable(booking);

            // Send confirmation email with ticket code
            emailService.sendBazaarConfirmationEmail(booking).catch((emailErr) => {
              console.error("Failed to send bazaar confirmation email:", emailErr);
            });

            return res.json({ status: "success", data: { booking, paid: true } });
          }
        } catch (paystackErr: any) {
          console.warn("Paystack verification check returned error or was unavailable:", paystackErr?.message || paystackErr);
        }
      }

      return res.json({ status: "success", data: { booking, paid: false } });
    } catch (err) {
      next(err);
    }
  }

  // Public: Submit general contact message
  static async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ status: "fail", message: "Name, email, and message are required." });
      }

      const reference = `BZ-CT-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      const ticketCode = generateTicketCode();

      const booking = await BazaarBooking.create({
        eventId: req.body.eventId || "tradefair_2026",
        reference,
        ticketCode,
        type: "contact",
        packageId: "contact",
        packageName: subject || "Contact Inquiry",
        amount: 0,
        currency: "NGN",
        customerName: name,
        customerEmail: email,
        customerPhone: phone || "N/A",
        notes: message,
        paymentStatus: "paid",
        checkInStatus: "pending",
      });

      // Asynchronously notify Secretariat and sender
      const secretariatEmail = process.env.TRADE_FAIR_EMAIL || process.env.SUPPORT_EMAIL || "tradefair@glotrade.online";
      
      // 1. Notify Secretariat
      emailService.sendEmail({
        to: secretariatEmail,
        subject: `[Trade Fair 2026 Inquiry] ${subject || "General Inquiry"} - from ${name}`,
        text: `New Trade Fair enquiry from ${name} (${email}, phone: ${phone || "N/A"}):\n\nSubject: ${subject || "General"}\n\nMessage:\n${message}\n\nReference: ${reference}`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6;">
            <h3 style="color: #d97706; margin-top: 0;">New Trade Fair 2026 Secretariat Inquiry</h3>
            <p><strong>From:</strong> ${name} &lt;<a href="mailto:${email}">${email}</a>&gt;</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
            <p><strong>Reference:</strong> <code>${reference}</code></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px;">
              <strong style="display: block; margin-bottom: 8px; color: #0f172a;">Message:</strong>
              <div style="white-space: pre-wrap; color: #334155;">${message}</div>
            </div>
          </div>
        `,
      }).catch((emailErr) => {
        console.error("Failed to send contact notification to secretariat:", emailErr);
      });

      // 2. Acknowledgment to sender
      emailService.sendEmail({
        to: email,
        subject: `Enquiry Received: GloTrade International Trade Fair 2026 [Ref: ${ticketCode}]`,
        text: `Dear ${name},\n\nThank you for reaching out to the GloTrade International Trade Fair 2026 Secretariat. Your enquiry (Ref: ${ticketCode}) has been received and routed to the appropriate directorate. Our team will get back to you shortly.\n\nWarm regards,\nGloTrade Trade Fair Secretariat`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; line-height: 1.6;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for contacting the <strong>GloTrade International Trade Fair 2026 Secretariat</strong>.</p>
            <p>Your inquiry has been successfully logged with tracking reference: <strong style="color: #d97706;">${ticketCode}</strong>.</p>
            <div style="background: #f8fafc; border-left: 4px solid #d97706; padding: 12px 16px; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
            </div>
            <p>A member of our liaison team in Abuja will review your submission and reply directly to this email within 24 hours.</p>
            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
              Warm regards,<br />
              <strong>GloTrade Trade Fair Secretariat</strong><br />
              Abuja, Nigeria · <a href="https://glotrade.online/trade-fair" style="color: #d97706;">glotrade.online/trade-fair</a>
            </p>
          </div>
        `,
      }).catch((emailErr) => {
        console.error("Failed to send contact acknowledgment to sender:", emailErr);
      });

      res.json({ status: "success", data: booking, message: "Enquiry submitted successfully." });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Get overall statistics
  static async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = (req.query.eventId as string) || "tradefair_2026";
      const baseFilter: any = {};
      if (eventId !== "all") {
        baseFilter.eventId = eventId;
      }

      const totalRevenueRes = await BazaarBooking.aggregate([
        { $match: { ...baseFilter, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalRevenue = totalRevenueRes[0]?.total || 0;

      const totalTickets = await BazaarBooking.countDocuments({ ...baseFilter, type: "ticket" });
      const totalTicketsPaid = await BazaarBooking.countDocuments({ ...baseFilter, type: "ticket", paymentStatus: "paid" });
      const totalPending = await BazaarBooking.countDocuments({ ...baseFilter, paymentStatus: "pending" });
      const totalExhibitors = await BazaarBooking.countDocuments({ ...baseFilter, type: "exhibitor" });
      const totalSponsorships = await BazaarBooking.countDocuments({ ...baseFilter, type: "sponsorship" });
      const totalContacts = await BazaarBooking.countDocuments({ ...baseFilter, type: "contact" });
      const totalCheckedIn = await BazaarBooking.countDocuments({ ...baseFilter, checkInStatus: "checked_in" });

      res.json({
        status: "success",
        data: {
          totalRevenue,
          totalTickets,
          totalTicketsPaid,
          totalPending,
          totalExhibitors,
          totalSponsorships,
          totalContacts,
          totalCheckedIn,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Get paginated bookings with search & filters
  static async getAdminBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const eventId = (req.query.eventId as string) || "tradefair_2026";
      const type = req.query.type as string;
      const paymentStatus = req.query.paymentStatus as string;
      const checkInStatus = req.query.checkInStatus as string;
      const search = req.query.search as string;

      const query: any = {};
      if (eventId !== "all") {
        query.eventId = eventId;
      }

      if (type && type !== "all") query.type = type;
      if (paymentStatus && paymentStatus !== "all") query.paymentStatus = paymentStatus;
      if (checkInStatus && checkInStatus !== "all") query.checkInStatus = checkInStatus;

      if (search) {
        query.$or = [
          { customerName: { $regex: search, $options: "i" } },
          { customerEmail: { $regex: search, $options: "i" } },
          { customerPhone: { $regex: search, $options: "i" } },
          { reference: { $regex: search, $options: "i" } },
          { ticketCode: { $regex: search, $options: "i" } },
          { businessName: { $regex: search, $options: "i" } },
        ];
      }

      const total = await BazaarBooking.countDocuments(query);
      const bookings = await BazaarBooking.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        status: "success",
        data: {
          bookings,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Update booking status or notes (with Manager Action Audit Blame Tracking)
  static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { paymentStatus, checkInStatus, notes } = req.body;

      const booking = await BazaarBooking.findById(id);
      if (!booking) {
        return res.status(404).json({ status: "fail", message: "Booking not found." });
      }

      const actor = extractAdminActor(req);
      const previousStatus = booking.paymentStatus;
      const previousCheckIn = booking.checkInStatus;

      if (!booking.auditLogs) {
        booking.auditLogs = [];
      }

      if (paymentStatus && paymentStatus !== previousStatus) {
        booking.paymentStatus = paymentStatus;
        if (paymentStatus === "paid" && actor) {
          booking.paymentApprovedBy = { ...actor, at: new Date() };
          booking.auditLogs.push({
            action: "PAYMENT_MARKED_PAID",
            performedBy: actor,
            details: `Payment status updated from '${previousStatus}' to 'PAID'`,
            timestamp: new Date(),
          });
        } else if (actor) {
          booking.auditLogs.push({
            action: "PAYMENT_STATUS_CHANGE",
            performedBy: actor,
            details: `Payment status updated from '${previousStatus}' to '${paymentStatus}'`,
            timestamp: new Date(),
          });
        }
      }

      if (checkInStatus && checkInStatus !== previousCheckIn) {
        booking.checkInStatus = checkInStatus;
        if (checkInStatus === "checked_in") {
          if (!booking.checkInTime) {
            booking.checkInTime = new Date();
          }
          if (actor) {
            booking.checkedInBy = { ...actor, at: new Date() };
            booking.auditLogs.push({
              action: "GATE_CHECK_IN",
              performedBy: actor,
              details: `Guest admitted & checked in at gate`,
              timestamp: new Date(),
            });
          }
        } else if (actor) {
          booking.auditLogs.push({
            action: "CHECK_IN_STATUS_CHANGE",
            performedBy: actor,
            details: `Gate check-in status reset to '${checkInStatus}'`,
            timestamp: new Date(),
          });
        }
      }

      if (notes !== undefined && notes !== booking.notes) {
        booking.notes = notes;
        if (actor) {
          booking.auditLogs.push({
            action: "NOTES_UPDATED",
            performedBy: actor,
            details: `Booking notes/special requests updated`,
            timestamp: new Date(),
          });
        }
      }

      if (actor) {
        booking.lastModifiedBy = { ...actor, action: "UPDATE_BOOKING", at: new Date() };
      }

      await booking.save();

      // Trigger ticket email and promoter commission if payment was just changed to paid
      if (previousStatus !== "paid" && paymentStatus === "paid") {
        await BazaarController.creditPromoterIfApplicable(booking);
        emailService.sendBazaarConfirmationEmail(booking).catch((emailErr) => {
          console.error("Failed to send ticket email on admin mark paid:", emailErr);
        });
      }

      res.json({ status: "success", data: booking, message: "Booking updated successfully." });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Create manual ticket / exhibitor / sponsorship booking with Manager Actor Tagging
  static async createManualBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        type = "ticket",
        packageId = "general",
        packageName = "General Ticket",
        amount = 0,
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        paymentStatus = "paid",
        notes = "Manual bank transfer registration via admin",
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ status: "fail", message: "Customer name, email, and phone number are required." });
      }

      const actor = extractAdminActor(req);
      const prefix = type === "ticket" ? "TK" : type === "exhibitor" ? "EX" : type === "sponsorship" ? "SP" : "CT";
      const reference = `BZ-${prefix}-M-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      const ticketCode = generateTicketCode();

      const registeredBy = actor ? { ...actor, at: new Date() } : undefined;
      const paymentApprovedBy = actor && paymentStatus === "paid" ? { ...actor, at: new Date() } : undefined;
      const auditLogs = actor
        ? [
            {
              action: "MANUAL_REGISTRATION",
              performedBy: actor,
              details: `Manual registration created for ${packageName} (₦${Number(amount).toLocaleString("en-NG")}) - Status: ${paymentStatus.toUpperCase()}`,
              timestamp: new Date(),
            },
          ]
        : [];

      // Resolve Promoter Referral Code if provided
      let promoterId: any = undefined;
      let promoterCodeClean: string | undefined = undefined;
      let promoterCommissionPercent: number | undefined = undefined;
      let promoterCommissionAmount: number | undefined = undefined;
      let promoterCommissionStatus: "pending" | "approved" | "paid" | "cancelled" | undefined = undefined;

      if (type === "exhibitor" && req.body.promoterCode) {
        try {
          const rawCode = String(req.body.promoterCode).trim().toUpperCase();
          const promoter = await BazaarPromoter.findOne({ promoterCode: rawCode, status: "active" });
          if (promoter) {
            const config = await getOrCreateConfig();
            promoterId = promoter._id;
            promoterCodeClean = promoter.promoterCode;
            promoterCommissionPercent = Number(config.promoterCommissionPercent) || 5;
            promoterCommissionAmount = Math.round((Number(amount) * promoterCommissionPercent) / 100);
            promoterCommissionStatus = "pending";

            promoter.stats.totalReferredExhibitors = (promoter.stats.totalReferredExhibitors || 0) + 1;
            promoter.stats.totalBookingValue = (promoter.stats.totalBookingValue || 0) + Number(amount);
            await promoter.save();
          }
        } catch (promoterErr) {
          console.error("Error attaching promoter to manual booking:", promoterErr);
        }
      }

      const booking = await BazaarBooking.create({
        eventId: req.body.eventId || "tradefair_2026",
        reference,
        ticketCode,
        type,
        packageId,
        packageName,
        amount: Number(amount),
        currency: "NGN",
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        notes,
        paymentStatus,
        checkInStatus: "pending",
        registeredBy,
        paymentApprovedBy,
        auditLogs,
        promoterCode: promoterCodeClean,
        promoterId,
        promoterCommissionPercent,
        promoterCommissionAmount,
        promoterCommissionStatus,
      });

      if (paymentStatus === "paid") {
        await BazaarController.creditPromoterIfApplicable(booking);
      }

      let emailSent = false;
      if (paymentStatus === "paid") {
        try {
          await emailService.sendBazaarConfirmationEmail(booking);
          emailSent = true;
        } catch (emailErr) {
          console.error("Failed to send manual bazaar confirmation email:", emailErr);
        }
      }

      res.status(201).json({
        status: "success",
        message: `Booking created successfully.${emailSent ? " Ticket confirmation email dispatched." : ""}`,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Resend ticket confirmation email with Audit Blame Logging
  static async resendConfirmationEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const booking = await BazaarBooking.findById(id);
      if (!booking) {
        return res.status(404).json({ status: "fail", message: "Booking record not found." });
      }

      const actor = extractAdminActor(req);
      if (actor) {
        if (!booking.auditLogs) {
          booking.auditLogs = [];
        }
        booking.auditLogs.push({
          action: "RESEND_CONFIRMATION_EMAIL",
          performedBy: actor,
          details: `Ticket confirmation pass resent to ${booking.customerEmail}`,
          timestamp: new Date(),
        });
        booking.lastModifiedBy = { ...actor, action: "RESEND_EMAIL", at: new Date() };
        await booking.save();
      }

      await emailService.sendBazaarConfirmationEmail(booking);
      res.json({
        status: "success",
        message: `Ticket confirmation email resent to ${booking.customerEmail}`,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin / Gate Check-in: Verify & check in ticket with Scanner Blame Tracking
  static async checkInTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ status: "fail", message: "Ticket code or reference is required." });
      }

      const booking = await BazaarBooking.findOne({
        $or: [
          { ticketCode: code.toUpperCase().trim() },
          { reference: code.trim() },
        ],
      });

      if (!booking) {
        return res.status(404).json({ status: "fail", message: "Invalid Ticket Code or Reference." });
      }

      const expectedEventId = req.body.eventId;
      if (expectedEventId && booking.eventId && booking.eventId !== expectedEventId) {
        return res.status(400).json({
          status: "fail",
          message: `This pass was issued for ${booking.eventId === "bazaar_abuja_2026" ? "GloTrade Bazaar Abuja" : "another event"} and is not valid for this event.`,
          booking,
        });
      }

      if (booking.paymentStatus !== "paid") {
        return res.status(400).json({
          status: "fail",
          message: `Ticket payment is ${booking.paymentStatus.toUpperCase()}. Entry denied.`,
          booking,
        });
      }

      if (booking.checkInStatus === "checked_in") {
        return res.status(400).json({
          status: "fail",
          message: `Ticket ALREADY CHECKED IN at ${booking.checkInTime ? new Date(booking.checkInTime).toLocaleTimeString() : "earlier"}${
            booking.checkedInBy?.name ? ` by ${booking.checkedInBy.name}` : ""
          }.`,
          booking,
        });
      }

      const actor = extractAdminActor(req);
      booking.checkInStatus = "checked_in";
      booking.checkInTime = new Date();

      if (actor) {
        booking.checkedInBy = { ...actor, at: new Date() };
        if (!booking.auditLogs) {
          booking.auditLogs = [];
        }
        booking.auditLogs.push({
          action: "GATE_CHECK_IN",
          performedBy: actor,
          details: `Validated QR code and granted entrance at Harrow Park gate`,
          timestamp: new Date(),
        });
        booking.lastModifiedBy = { ...actor, action: "GATE_CHECK_IN", at: new Date() };
      }

      await booking.save();

      res.json({
        status: "success",
        message: `VALID TICKET! ${booking.customerName} checked in successfully.`,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Super Admin: Delete single booking
  static async deleteBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await BazaarBooking.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ status: "fail", message: "Booking record not found." });
      }
      res.json({
        status: "success",
        message: "Booking record deleted successfully.",
        data: deleted,
      });
    } catch (err) {
      next(err);
    }
  }

  // Super Admin: Bulk delete multiple bookings
  static async bulkDeleteBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ status: "fail", message: "Please provide an array of booking IDs to delete." });
      }

      const result = await BazaarBooking.deleteMany({ _id: { $in: ids } });
      res.json({
        status: "success",
        message: `Successfully deleted ${result.deletedCount} booking record(s).`,
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      next(err);
    }
  }

  // Helper: Credit promoter when an exhibitor booking payment is confirmed
  static async creditPromoterIfApplicable(booking: any) {
    try {
      if (!booking) return;
      if (booking.type !== "exhibitor") return;
      if (booking.promoterCommissionStatus === "approved" || booking.promoterCommissionStatus === "paid") return;

      let promoter = null;
      if (booking.promoterId) {
        promoter = await BazaarPromoter.findById(booking.promoterId);
      }
      if (!promoter && booking.promoterCode) {
        promoter = await BazaarPromoter.findOne({ promoterCode: String(booking.promoterCode).trim().toUpperCase() });
      }
      if (!promoter) return;

      let commAmount = Number(booking.promoterCommissionAmount) || 0;
      if (commAmount <= 0 && Number(booking.amount) > 0) {
        const config = await getOrCreateConfig();
        const percent = Number(booking.promoterCommissionPercent || config.promoterCommissionPercent || 5);
        commAmount = Math.round((Number(booking.amount) * percent) / 100);
        booking.promoterCommissionAmount = commAmount;
        booking.promoterCommissionPercent = percent;
      }

      booking.promoterId = promoter._id;
      booking.promoterCode = promoter.promoterCode;
      booking.promoterCommissionStatus = "approved";
      await booking.save();

      promoter.stats.paidExhibitors = (promoter.stats.paidExhibitors || 0) + 1;
      promoter.stats.totalCommissionEarned = (promoter.stats.totalCommissionEarned || 0) + commAmount;
      promoter.stats.pendingCommission = (promoter.stats.pendingCommission || 0) + commAmount;
      await promoter.save();
      console.log(`[BazaarPromoter] Credited ₦${commAmount} commission to promoter ${promoter.promoterCode} for booking ${booking.reference}`);
    } catch (err) {
      console.error("[BazaarPromoter] Failed to credit promoter commission:", err);
    }
  }

  // Public: Validate promoter referral code (for exhibitor booking form)
  static async validatePromoterCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = String(req.params.code || req.query.code || "").trim().toUpperCase();
      if (!code) {
        return res.status(400).json({ status: "fail", message: "Promoter code is required." });
      }

      const promoter = await BazaarPromoter.findOne({ promoterCode: code });
      if (!promoter) {
        return res.status(404).json({ status: "fail", message: "Invalid promoter code.", valid: false });
      }

      if (promoter.status !== "active") {
        return res.status(400).json({ status: "fail", message: "This promoter code is currently inactive.", valid: false });
      }

      const config = await getOrCreateConfig();
      const commissionPercent = config.promoterCommissionPercent || 5;

      const nameParts = promoter.name.trim().split(" ");
      const maskedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.` : nameParts[0];

      return res.json({
        status: "success",
        valid: true,
        data: {
          promoterCode: promoter.promoterCode,
          promoterName: maskedName,
          commissionPercent,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Public: Register as a Trade Fair Promoter
  static async registerPromoter(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await getOrCreateConfig();
      if (config.promoterProgramActive === false) {
        return res.status(400).json({
          status: "fail",
          message: "The Trade Fair Promoter Program is currently paused.",
        });
      }

      const { name, email, phone, bankName, accountNumber, accountName, pin } = req.body;

      if (!name || !email || !phone || !bankName || !accountNumber || !accountName || !pin) {
        return res.status(400).json({
          status: "fail",
          message: "All fields are required (Name, Email, Phone, Bank Name, Account Number, Account Name, 6-digit PIN).",
        });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPin = String(pin).trim();

      if (cleanPin.length < 4 || cleanPin.length > 8) {
        return res.status(400).json({
          status: "fail",
          message: "PIN must be between 4 and 8 digits.",
        });
      }

      const existing = await BazaarPromoter.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({
          status: "fail",
          message: "A promoter with this email is already registered. Please log in.",
        });
      }

      let promoterCode = "";
      let attempts = 0;
      while (attempts < 10) {
        const candidate = `TF-PROMO-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        const exists = await BazaarPromoter.findOne({ promoterCode: candidate });
        if (!exists) {
          promoterCode = candidate;
          break;
        }
        attempts++;
      }
      if (!promoterCode) {
        promoterCode = `TF-PROMO-${Date.now().toString(36).toUpperCase()}`;
      }

      const pinHash = await bcrypt.hash(cleanPin, 10);

      const promoter = await BazaarPromoter.create({
        promoterCode,
        name: String(name).trim(),
        email: cleanEmail,
        phone: String(phone).trim(),
        pinHash,
        bankDetails: {
          bankName: String(bankName).trim(),
          accountNumber: String(accountNumber).trim(),
          accountName: String(accountName).trim(),
        },
        status: "active",
      });

      const token = jwt.sign(
        {
          promoterId: (promoter._id as any).toString(),
          promoterCode: promoter.promoterCode,
          email: promoter.email,
          role: "bazaar_promoter",
        },
        process.env.JWT_SECRET || "glotrade_jwt_secret",
        { expiresIn: "30d" }
      );

      const referralLink = `/trade-fair/exhibitors?ref=${promoter.promoterCode}`;

      res.status(201).json({
        status: "success",
        message: "Promoter registered successfully! Your unique referral code is ready.",
        data: {
          promoter: {
            id: promoter._id,
            promoterCode: promoter.promoterCode,
            name: promoter.name,
            email: promoter.email,
            phone: promoter.phone,
            bankDetails: promoter.bankDetails,
            stats: promoter.stats,
          },
          token,
          referralLink,
          commissionPercent: config.promoterCommissionPercent || 5,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Public: Promoter login via email/code and PIN
  static async loginPromoter(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, pin } = req.body;
      if (!identifier || !pin) {
        return res.status(400).json({
          status: "fail",
          message: "Please enter your Email or Promoter Code and PIN.",
        });
      }

      const cleanId = String(identifier).trim();
      const cleanPin = String(pin).trim();

      const promoter = await BazaarPromoter.findOne({
        $or: [{ email: cleanId.toLowerCase() }, { promoterCode: cleanId.toUpperCase() }],
      });

      if (!promoter) {
        return res.status(404).json({
          status: "fail",
          message: "No promoter account found with that Email or Code.",
        });
      }

      if (promoter.status === "suspended") {
        return res.status(403).json({
          status: "fail",
          message: "Your promoter account is suspended. Please contact Trade Fair admin.",
        });
      }

      const validPin = await bcrypt.compare(cleanPin, promoter.pinHash);
      if (!validPin) {
        return res.status(401).json({
          status: "fail",
          message: "Invalid PIN. Please check and try again.",
        });
      }

      const token = jwt.sign(
        {
          promoterId: (promoter._id as any).toString(),
          promoterCode: promoter.promoterCode,
          email: promoter.email,
          role: "bazaar_promoter",
        },
        process.env.JWT_SECRET || "glotrade_jwt_secret",
        { expiresIn: "30d" }
      );

      const config = await getOrCreateConfig();
      const referralLink = `/trade-fair/exhibitors?ref=${promoter.promoterCode}`;

      res.json({
        status: "success",
        data: {
          promoter: {
            id: promoter._id,
            promoterCode: promoter.promoterCode,
            name: promoter.name,
            email: promoter.email,
            phone: promoter.phone,
            bankDetails: promoter.bankDetails,
            stats: promoter.stats,
          },
          token,
          referralLink,
          commissionPercent: config.promoterCommissionPercent || 5,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Promoter: Get self dashboard & referred exhibitor bookings
  static async getPromoterDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      let promoterId: string | undefined;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const decoded = jwt.verify(
            authHeader.split(" ")[1],
            process.env.JWT_SECRET || "glotrade_jwt_secret"
          ) as any;
          promoterId = decoded.promoterId;
        } catch (e) {
          // Token invalid/expired
        }
      }

      if (!promoterId && req.query.promoterCode) {
        const pCode = String(req.query.promoterCode).trim().toUpperCase();
        const p = await BazaarPromoter.findOne({ promoterCode: pCode });
        if (p) promoterId = (p._id as any).toString();
      }

      if (!promoterId) {
        return res.status(401).json({ status: "fail", message: "Unauthorized. Please log in to view dashboard." });
      }

      const promoter = await BazaarPromoter.findById(promoterId);
      if (!promoter) {
        return res.status(404).json({ status: "fail", message: "Promoter profile not found." });
      }

      if (promoter.status === "suspended") {
        return res.status(403).json({
          status: "fail",
          message: "Your promoter account has been suspended. Please contact the Trade Fair secretariat.",
          suspended: true,
        });
      }

      const bookings = await BazaarBooking.find({
        $or: [{ promoterId: promoter._id }, { promoterCode: promoter.promoterCode }],
        type: "exhibitor",
      })
        .sort({ createdAt: -1 })
        .select(
          "reference ticketCode businessName customerName packageName amount paymentStatus promoterCommissionPercent promoterCommissionAmount promoterCommissionStatus createdAt"
        )
        .lean();

      const config = await getOrCreateConfig();

      res.json({
        status: "success",
        data: {
          promoter: {
            id: promoter._id,
            promoterCode: promoter.promoterCode,
            name: promoter.name,
            email: promoter.email,
            phone: promoter.phone,
            bankDetails: promoter.bankDetails,
            status: promoter.status,
            stats: promoter.stats,
            payouts: promoter.payouts || [],
            createdAt: promoter.createdAt,
          },
          bookings,
          commissionPercent: config.promoterCommissionPercent || 5,
          referralLink: `/trade-fair/exhibitors?ref=${promoter.promoterCode}`,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Get all promoters with stats and search
  static async adminGetPromoters(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const search = ((req.query.search as string) || "").trim();
      const status = req.query.status as string;

      const query: any = {};
      if (status && status !== "all") {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { promoterCode: { $regex: search.toUpperCase(), $options: "i" } },
        ];
      }

      const total = await BazaarPromoter.countDocuments(query);
      const promoters = await BazaarPromoter.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-pinHash")
        .lean();

      const aggregateStats = await BazaarPromoter.aggregate([
        {
          $group: {
            _id: null,
            totalPromoters: { $sum: 1 },
            totalReferredExhibitors: { $sum: "$stats.totalReferredExhibitors" },
            paidExhibitors: { $sum: "$stats.paidExhibitors" },
            totalCommissionEarned: { $sum: "$stats.totalCommissionEarned" },
            totalCommissionPaid: { $sum: "$stats.totalCommissionPaid" },
            totalPendingCommission: { $sum: "$stats.pendingCommission" },
          },
        },
      ]);

      const totals = aggregateStats[0] || {
        totalPromoters: total,
        totalReferredExhibitors: 0,
        paidExhibitors: 0,
        totalCommissionEarned: 0,
        totalCommissionPaid: 0,
        totalPendingCommission: 0,
      };

      res.json({
        status: "success",
        data: {
          promoters,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          totals,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Update promoter status (active / suspended)
  static async adminUpdatePromoterStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["active", "suspended"].includes(status)) {
        return res.status(400).json({ status: "fail", message: "Status must be 'active' or 'suspended'." });
      }

      const promoter = await BazaarPromoter.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      ).select("-pinHash");

      if (!promoter) {
        return res.status(404).json({ status: "fail", message: "Promoter not found." });
      }

      res.json({
        status: "success",
        message: `Promoter status changed to ${status.toUpperCase()}.`,
        data: promoter,
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Record manual bank payout to a promoter
  static async adminRecordPromoterPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { amount, reference, notes } = req.body;

      const payoutAmount = Number(amount);
      if (!payoutAmount || payoutAmount <= 0) {
        return res.status(400).json({ status: "fail", message: "A valid payout amount greater than 0 is required." });
      }
      if (!reference) {
        return res.status(400).json({ status: "fail", message: "Payment reference / transaction receipt number is required." });
      }

      const promoter = await BazaarPromoter.findById(id);
      if (!promoter) {
        return res.status(404).json({ status: "fail", message: "Promoter not found." });
      }

      const actor = extractAdminActor(req);

      // Record payout
      promoter.payouts.push({
        amount: payoutAmount,
        reference: String(reference).trim(),
        paidAt: new Date(),
        paidBy: actor ? { adminId: actor.adminId, name: actor.name, email: actor.email } : undefined,
        notes: notes ? String(notes).trim() : undefined,
      });

      // Update financial stats
      promoter.stats.totalCommissionPaid = (promoter.stats.totalCommissionPaid || 0) + payoutAmount;
      promoter.stats.pendingCommission = Math.max(0, (promoter.stats.pendingCommission || 0) - payoutAmount);

      await promoter.save();

      // Mark approved bookings for this promoter as paid
      await BazaarBooking.updateMany(
        {
          $or: [{ promoterId: promoter._id }, { promoterCode: promoter.promoterCode }],
          promoterCommissionStatus: "approved",
        },
        { $set: { promoterCommissionStatus: "paid" } }
      );

      // Send branded payout receipt email to the promoter
      if (promoter.email) {
        const formattedAmount = `₦${payoutAmount.toLocaleString("en-NG")}`;
        const portalUrl = `${process.env.FRONTEND_URL || "https://glotrade.online"}/bazaar/promoter`;

        emailService.sendEmail({
          to: promoter.email,
          subject: `Commission Payout Disbursed: ${formattedAmount} - GloTrade Trade Fair 2026`,
          text: `Hello ${promoter.name},\n\nA commission payout of ${formattedAmount} has been processed to your bank account (${promoter.bankDetails?.bankName} - ${promoter.bankDetails?.accountNumber}).\nTransaction Reference: ${reference}\n\nLogin to your promoter dashboard to view details: ${portalUrl}`,
          html: `
            <p>Dear <strong>${promoter.name}</strong>,</p>
            <p>We are pleased to inform you that a commission payout for your referral activity at the <strong>GloTrade International Trade Fair 2026</strong> has been successfully processed to your bank account.</p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Bank Transfer Payout Receipt</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Amount Paid:</td>
                  <td style="padding: 8px 0; font-weight: bold; font-size: 17px; color: #059669; text-align: right; font-family: monospace;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Beneficiary Bank:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1e293b; text-align: right;">${promoter.bankDetails?.bankName || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Account Number:</td>
                  <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #1e293b; text-align: right;">${promoter.bankDetails?.accountNumber || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Account Name:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1e293b; text-align: right;">${promoter.bankDetails?.accountName || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Transaction Reference / Receipt:</td>
                  <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #1e293b; text-align: right;">${reference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Date Processed:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1e293b; text-align: right;">${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
                ${notes ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Admin Note:</td>
                  <td style="padding: 8px 0; color: #1e293b; text-align: right; font-style: italic;">${notes}</td>
                </tr>` : ""}
              </table>

              <div style="border-top: 1px dashed #cbd5e1; margin-top: 15px; padding-top: 15px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td style="color: #64748b;">Total Commission Paid to Date:</td>
                    <td style="font-weight: bold; color: #0284c7; text-align: right; font-family: monospace;">₦${(promoter.stats.totalCommissionPaid || 0).toLocaleString("en-NG")}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b;">Remaining Pending Balance:</td>
                    <td style="font-weight: bold; color: #d97706; text-align: right; font-family: monospace;">₦${(promoter.stats.pendingCommission || 0).toLocaleString("en-NG")}</td>
                  </tr>
                </table>
              </div>
            </div>

            <p style="font-size: 14px; color: #475569;">Keep sharing your promoter code <strong>${promoter.promoterCode}</strong> to continue earning commissions from every booth booked.</p>
          `,
          cta: {
            label: "Open Promoter Dashboard",
            url: portalUrl,
          },
        }).catch((emailErr) => {
          console.error("Failed to send payout receipt email to promoter:", emailErr);
        });
      }

      res.json({
        status: "success",
        message: `Payout of ₦${payoutAmount.toLocaleString("en-NG")} recorded successfully for promoter ${promoter.name}.`,
        data: promoter,
      });
    } catch (err) {
      next(err);
    }
  }
}
