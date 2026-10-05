import mongoose, { Document, Schema } from "mongoose";

export interface IWalletTransaction extends Document {
  walletId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  type: "deposit" | "withdrawal" | "payment" | "refund" | "transfer" | "earning" | "fee" | "bonus" | "adjustment" | "commission"; // Note: "transfer" deprecated
  category: "order_payment" | "order_refund" | "top_up" | "withdrawal" | "transfer_in" | "transfer_out" | "sale_earning" | "platform_fee" | "bonus" | "adjustment" | "admin_adjustment" | "commission" | "registration_bonus"; // Note: transfer_in/transfer_out deprecated
  amount: number; // in Naira
  currency: "NGN"; // Naira only
  balanceBefore: number; // in Naira
  balanceAfter: number; // in Naira
  status: "pending" | "completed" | "failed" | "cancelled";
  reference: string; // unique transaction reference
  externalReference?: string; // Paystack/Flutterwave reference
  description: string;
  metadata?: {
    orderId?: string;
    paymentId?: string;
    recipientId?: string;
    senderId?: string;
    idempotencyKey?: string;
    paymentProvider?: "paystack" | "flutterwave";
    bankDetails?: {
      accountNumber: string;
      bankCode: string;
      accountName: string;
    };
    fees?: {
      platformFee: number;
      processingFee: number;
      totalFees: number;
    };
    // Sales Agent Commission metadata
    commissionId?: string;
    referralId?: string;
    commissionType?: "registration" | "purchase" | "bonus" | "tier_upgrade";
  };
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "payment", "refund", "transfer", "earning", "fee", "bonus", "adjustment", "commission"],
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ["order_payment", "order_refund", "top_up", "withdrawal", "transfer_in", "transfer_out", "sale_earning", "platform_fee", "bonus", "adjustment", "admin_adjustment", "commission", "registration_bonus"],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ["NGN"], // Naira only
      required: true,
      default: "NGN"
    },
    balanceBefore: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
      index: true
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    externalReference: {
      type: String,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    metadata: {
      orderId: String,
      paymentId: String,
      recipientId: String,
      senderId: String,
      idempotencyKey: String,
      paymentProvider: String,
      bankDetails: {
        accountNumber: String,
        bankCode: String,
        accountName: String,
      },
      fees: {
        platformFee: Number,
        processingFee: Number,
        totalFees: Number,
      },
      // Sales Agent Commission metadata
      commissionId: String,
      referralId: String,
      commissionType: String,
    },
    processedAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient querying
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ walletId: 1, type: 1, status: 1 });
walletTransactionSchema.index({ reference: 1 });
walletTransactionSchema.index({ externalReference: 1 });
walletTransactionSchema.index({ createdAt: -1 });
// Allow exactly one 'payment' and one 'deposit' per idempotency key
// This prevents true duplicates while permitting both legs of a transfer
walletTransactionSchema.index(
  { "metadata.idempotencyKey": 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { "metadata.idempotencyKey": { $type: "string" } }
  }
);

export default mongoose.model<IWalletTransaction>("WalletTransaction", walletTransactionSchema);
