import mongoose, { Schema, Document } from "mongoose";

export interface IAuction extends Omit<Document, 'model'> {
  title: string;
  make: string;
  model: string;
  year: number;
  variant: string;
  fuelType: "Diesel" | "Petrol" | "Hybrid" | "EV";
  transmission: "Automatic" | "Manual";
  mileage: number;
  location: string;
  image: string;
  images: string[];
  startingOffer: number;
  registrationFee: number;
  offerUnlockFee: number;
  currentOffer: number;
  totalOffers: number;
  reserveMet: boolean;
  rounds: number;
  roundTimes: { start: string; end: string }[];
  currentRound: number;
  roundStates: {
    round: number;
    status: "pending" | "active" | "completed" | "paused";
    highestOffer: number;
    highestBuyer?: mongoose.Types.ObjectId;
    startedAt?: Date;
    endedAt?: Date;
    startNotified?: boolean;
    endNotified?: boolean;
  }[];
  status: "LIVE" | "UPCOMING" | "ENDED";
  endTime: Date;
  startTime: Date;
  seller: string;
  verifiedSeller: boolean;
  inspectionScore: number;
  isParkingSale: boolean;
  lotNumber: string;
  engine: string;
  color: string;
  ownership: string;
  insurance: string;
  description?: string;
  rules?: string;
  whatsappGroups?: { link: string; limit: number; notifyBefore: number }[];
  whatsappGroupLink?: string;
  winner?: mongoose.Types.ObjectId;
  winningOffer?: number;
  cancelReason?: string;
  refundsProcessed?: boolean;
  liveNotified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AuctionSchema = new Schema<IAuction>(
  {
    title: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    variant: { type: String, required: true },
    fuelType: { type: String, enum: ["Diesel", "Petrol", "Hybrid", "EV"], required: true },
    transmission: { type: String, enum: ["Automatic", "Manual"], required: true },
    mileage: { type: Number, required: true },
    location: { type: String, required: true },
    image: { type: String, default: "" },
    images: [{ type: String }],
    startingOffer: { type: Number, required: true },
    registrationFee: { type: Number, default: 0 },
    offerUnlockFee: { type: Number, default: 0 },
    currentOffer: { type: Number, default: 0 },
    totalOffers: { type: Number, default: 0 },
    reserveMet: { type: Boolean, default: false },
    rounds: { type: Number, default: 1 },
    roundTimes: [{ start: { type: String }, end: { type: String } }],
    currentRound: { type: Number, default: 1 },
    roundStates: [{
      round: { type: Number },
      status: { type: String, enum: ["pending", "active", "completed", "paused"], default: "pending" },
      highestOffer: { type: Number, default: 0 },
      highestBuyer: { type: Schema.Types.ObjectId, ref: "User" },
      startedAt: { type: Date },
      endedAt: { type: Date },
      startNotified: { type: Boolean, default: false },
      endNotified: { type: Boolean, default: false },
    }],
    status: { type: String, enum: ["LIVE", "UPCOMING", "ENDED"], default: "UPCOMING" },
    endTime: { type: Date, required: true },
    startTime: { type: Date, required: true },
    seller: { type: String, default: "VKS Autoservices" },
    verifiedSeller: { type: Boolean, default: true },
    inspectionScore: { type: Number, default: 9.0 },
    isParkingSale: { type: Boolean, default: false },
    lotNumber: { type: String, required: true, unique: true },
    engine: { type: String, default: "" },
    color: { type: String, default: "" },
    ownership: { type: String, default: "" },
    insurance: { type: String, default: "" },
    description: { type: String },
    rules: { type: String },
    whatsappGroups: [{
      link: { type: String },
      limit: { type: Number, default: 900 },
      notifyBefore: { type: Number, default: 5 },
    }],
    whatsappGroupLink: { type: String },
    winner: { type: Schema.Types.ObjectId, ref: "User" },
    winningOffer: { type: Number },
    cancelReason: { type: String },
    refundsProcessed: { type: Boolean, default: false },
    liveNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Auction || mongoose.model<IAuction>("Auction", AuctionSchema);
