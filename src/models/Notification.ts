import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "offer" | "higher" | "win" | "auction" | "system";
  read: boolean;
  relatedAuction?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["offer", "higher", "win", "auction", "system"],
      required: true,
    },
    read: { type: Boolean, default: false },
    relatedAuction: { type: Schema.Types.ObjectId, ref: "Auction" },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
