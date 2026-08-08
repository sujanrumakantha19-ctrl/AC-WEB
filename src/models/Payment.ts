import mongoose, { Schema, Document } from "mongoose";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  auction: mongoose.Types.ObjectId;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: PaymentStatus;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    receipt: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    failureReason: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ status: 1, updatedAt: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);