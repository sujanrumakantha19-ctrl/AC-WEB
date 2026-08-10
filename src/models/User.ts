import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  cusId?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  accountType?: "individual" | "dealer";
  avatar?: string;
  kycVerified: boolean;
  paidAccessAuctions: mongoose.Types.ObjectId[];
  refundedAuctions?: mongoose.Types.ObjectId[];
  whatsAppGroup?: mongoose.Types.ObjectId;
  whatsAppGroupLinkSent?: boolean;
  whatsAppGroupPending?: boolean;
  whatsAppGroupUpdatedAt?: Date;
  resetOtp?: string;
  resetOtpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cusId: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },
    accountType: { type: String, enum: ["individual", "dealer"] },
    avatar: { type: String },
    kycVerified: { type: Boolean, default: false },
    paidAccessAuctions: [{ type: Schema.Types.ObjectId, ref: "Auction" }],
    refundedAuctions: [{ type: Schema.Types.ObjectId, ref: "Auction" }],
    whatsAppGroup: { type: Schema.Types.ObjectId, ref: "WhatsAppGroup" },
    whatsAppGroupLinkSent: { type: Boolean, default: false },
    whatsAppGroupPending: { type: Boolean, default: false },
    whatsAppGroupUpdatedAt: { type: Date },
    resetOtp: { type: String },
    resetOtpExpires: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
