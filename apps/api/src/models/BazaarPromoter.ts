import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPromoterPayout {
  amount: number;
  reference: string;
  paidAt: Date;
  paidBy?: {
    adminId?: string;
    name?: string;
    email?: string;
  };
  notes?: string;
}

export interface IBazaarPromoterStats {
  totalReferredExhibitors: number;
  paidExhibitors: number;
  totalBookingValue: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  pendingCommission: number;
}

export interface IBazaarPromoter extends Document {
  promoterCode: string;
  name: string;
  email: string;
  phone: string;
  pinHash: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: "active" | "suspended";
  stats: IBazaarPromoterStats;
  payouts: IPromoterPayout[];
  createdAt: Date;
  updatedAt: Date;
}

const PromoterPayoutSchema = new Schema(
  {
    amount: { type: Number, required: true },
    reference: { type: String, required: true },
    paidAt: { type: Date, default: Date.now },
    paidBy: {
      adminId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    notes: { type: String },
  },
  { _id: true }
);

const BazaarPromoterSchema = new Schema<IBazaarPromoter>(
  {
    promoterCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    pinHash: {
      type: String,
      required: true,
    },
    bankDetails: {
      bankName: { type: String, required: true, trim: true },
      accountNumber: { type: String, required: true, trim: true },
      accountName: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true,
    },
    stats: {
      totalReferredExhibitors: { type: Number, default: 0 },
      paidExhibitors: { type: Number, default: 0 },
      totalBookingValue: { type: Number, default: 0 },
      totalCommissionEarned: { type: Number, default: 0 },
      totalCommissionPaid: { type: Number, default: 0 },
      pendingCommission: { type: Number, default: 0 },
    },
    payouts: {
      type: [PromoterPayoutSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const BazaarPromoter: Model<IBazaarPromoter> =
  (mongoose.models.BazaarPromoter as Model<IBazaarPromoter>) ||
  mongoose.model<IBazaarPromoter>("BazaarPromoter", BazaarPromoterSchema);

export default BazaarPromoter;
