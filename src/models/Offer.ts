import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  auction: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  amount: number;
  round: number;
  isProxy: boolean;
  proxyMax?: number;
  isWinning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    round: { type: Number, required: true },
    isProxy: { type: Boolean, default: false },
    proxyMax: { type: Number },
    isWinning: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OfferSchema.index({ auction: 1, amount: -1 });
OfferSchema.index({ buyer: 1, createdAt: -1 });
OfferSchema.index({ auction: 1, buyer: 1, round: 1 }, { unique: true });

export default mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);
