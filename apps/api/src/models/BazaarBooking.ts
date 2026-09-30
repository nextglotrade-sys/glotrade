import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminActor {
  adminId?: string;
  name?: string;
  email?: string;
  role?: string;
  at?: Date;
  action?: string;
}

export interface IAuditLogEntry {
  action: string;
  performedBy?: {
    adminId?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  details?: string;
  timestamp: Date;
}

export interface IBazaarBooking extends Document {
  eventId?: string;
  reference: string;
  ticketCode: string;
  type: "ticket" | "exhibitor" | "sponsorship" | "contact";
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessName?: string;
  notes?: string;
  paymentStatus: "pending" | "paid" | "failed";
  checkInStatus: "pending" | "checked_in";
  checkInTime?: Date;
  paystackReference?: string;
  paystackUrl?: string;
  rawWebhook?: any;
  registeredBy?: IAdminActor;
  paymentApprovedBy?: IAdminActor;
  checkedInBy?: IAdminActor;
  lastModifiedBy?: IAdminActor;
  auditLogs?: IAuditLogEntry[];
  promoterCode?: string;
  promoterId?: mongoose.Schema.Types.ObjectId | string;
  promoterCommissionPercent?: number;
  promoterCommissionAmount?: number;
  promoterCommissionStatus?: "pending" | "approved" | "paid" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const AdminActorSchema = new Schema(
  {
    adminId: { type: String },
    name: { type: String },
    email: { type: String },
    role: { type: String },
    at: { type: Date, default: Date.now },
    action: { type: String },
  },
  { _id: false }
);

const AuditLogEntrySchema = new Schema(
  {
    action: { type: String, required: true },
    performedBy: {
      adminId: { type: String },
      name: { type: String },
      email: { type: String },
      role: { type: String },
    },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BazaarBookingSchema: Schema = new Schema(
  {
    eventId: { type: String, default: "tradefair_2026", index: true },
    reference: { type: String, required: true, unique: true, index: true },
    ticketCode: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["ticket", "exhibitor", "sponsorship", "contact"],
      required: true,
    },
    packageId: { type: String, required: true },
    packageName: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "NGN" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, required: true },
    businessName: { type: String },
    notes: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    checkInStatus: {
      type: String,
      enum: ["pending", "checked_in"],
      default: "pending",
      index: true,
    },
    checkInTime: { type: Date },
    paystackReference: { type: String },
    paystackUrl: { type: String },
    rawWebhook: { type: Schema.Types.Mixed },
    registeredBy: { type: AdminActorSchema },
    paymentApprovedBy: { type: AdminActorSchema },
    checkedInBy: { type: AdminActorSchema },
    lastModifiedBy: { type: AdminActorSchema },
    auditLogs: { type: [AuditLogEntrySchema], default: [] },
    promoterCode: { type: String, uppercase: true, trim: true, index: true },
    promoterId: { type: Schema.Types.ObjectId, ref: "BazaarPromoter", index: true },
    promoterCommissionPercent: { type: Number },
    promoterCommissionAmount: { type: Number },
    promoterCommissionStatus: {
      type: String,
      enum: ["pending", "approved", "paid", "cancelled"],
      default: undefined,
      index: true,
    },
  },
  { timestamps: true }
);

const BazaarBooking: Model<IBazaarBooking> =
  (mongoose.models.BazaarBooking as Model<IBazaarBooking>) ||
  mongoose.model<IBazaarBooking>("BazaarBooking", BazaarBookingSchema);

export default BazaarBooking;
