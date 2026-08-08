import mongoose, { Schema, Document } from "mongoose";

export interface IWhatsAppGroup extends Document {
  name: string;
  link: string;
  capacity: number;
  notifyBefore: number;
  status: "active" | "inactive";
  members: number;
  limitNotified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppGroupSchema = new Schema<IWhatsAppGroup>(
  {
    name: { type: String, required: true },
    link: { type: String, required: true },
    capacity: { type: Number, default: 1000 },
    notifyBefore: { type: Number, default: 900 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    members: { type: Number, default: 0, min: 0 },
    limitNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.WhatsAppGroup ||
  mongoose.model<IWhatsAppGroup>("WhatsAppGroup", WhatsAppGroupSchema);