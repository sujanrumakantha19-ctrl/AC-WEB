export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "user" | "admin";
  cusId?: string;
  phone?: string;
  avatar?: string;
  accountType?: "individual" | "dealer";
  kycVerified?: boolean;
  paidAccessAuctions?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  createdAt?: string;
}

export type RoundStatus = "pending" | "active" | "completed" | "paused";

export interface RoundState {
  round: number;
  status: RoundStatus;
  highestOffer?: number;
  highestBuyer?: string;
  startedAt?: string | Date;
  endedAt?: string | Date;
}

export interface RoundTime {
  start: string;
  end: string;
}

export interface SerializedAuction {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  image?: string;
  images?: string[];
  make?: string;
  model?: string;
  variant?: string;
  year?: number;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  location?: string;
  seller?: string;
  status: "UPCOMING" | "LIVE" | "ENDED";
  lotNumber?: string;
  startingOffer: number;
  currentOffer?: number;
  registrationFee?: number;
  offerUnlockFee?: number;
  inspectionScore?: number;
  isParkingSale?: boolean;
  thresholdAmount?: number;
  engine?: string;
  color?: string;
  ownership?: string;
  insurance?: string;
  verifiedSeller?: boolean;
  rounds?: number;
  currentRound?: number;
  roundTimes?: RoundTime[];
  roundStates?: RoundState[];
  winner?: string | { _id: string; name?: string; phone?: string; email?: string; cusId?: string };
  winningOffer?: number;
  cancelReason?: string;
  totalOffers?: number;
  rules?: string;
  startTime?: string;
  endTime?: string;
  auctionDate?: string;
  hasAccess?: boolean;
  whatsappGroups?: { link: string; limit?: number; notifyBefore?: number }[];
  whatsappGroupLink?: string;
  createdAt?: string;
}

export interface Offer {
  _id: string;
  auction?: string;
  buyer?: string | { _id: string; name?: string; phone?: string; email?: string; cusId?: string };
  amount: number;
  round?: number;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  relatedAuction?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}
