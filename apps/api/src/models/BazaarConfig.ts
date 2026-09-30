import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBazaarConfig extends Document {
  isPortalActive: boolean;
  ticketSalesActive: boolean;
  exhibitorApplicationsActive: boolean;
  sponsorshipActive: boolean;
  inactiveMessage: string;
  eventTitle: string;
  eventDateLabel: string;
  eventVenue: string;
  whatsappNumber?: string;
  email?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  promoterProgramActive?: boolean;
  promoterCommissionPercent?: number;
  updatedAt: Date;
  updatedBy?: string;
}

const BazaarConfigSchema: Schema = new Schema(
  {
    isPortalActive: { type: Boolean, default: true },
    ticketSalesActive: { type: Boolean, default: true },
    exhibitorApplicationsActive: { type: Boolean, default: true },
    sponsorshipActive: { type: Boolean, default: true },
    promoterProgramActive: { type: Boolean, default: true },
    promoterCommissionPercent: { type: Number, default: 5 },
    inactiveMessage: {
      type: String,
      default:
        "GloTrade International Trade Fair 2026 portal is currently inactive. Stay tuned for official announcements!",
    },
    eventTitle: { type: String, default: "GloTrade International Trade Fair 2026" },
    eventDateLabel: { type: String, default: "1st – 5th December 2026" },
    eventVenue: {
      type: String,
      default:
        "Nigerian Army Conference Centre & Suites (NACCAS), Km 10 Expressway, Asokoro, Abuja, FCT – Nigeria",
    },
    whatsappNumber: { type: String, default: "2347044600924" },
    email: { type: String, default: "tradefair@glotrade.online" },
    bankName: { type: String, default: "Wema Bank" },
    bankAccountName: { type: String, default: "GloTrade Platform Limited" },
    bankAccountNumber: { type: String, default: "0127131496" },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const BazaarConfig: Model<IBazaarConfig> =
  (mongoose.models.BazaarConfig as Model<IBazaarConfig>) ||
  mongoose.model<IBazaarConfig>("BazaarConfig", BazaarConfigSchema);

export default BazaarConfig;
