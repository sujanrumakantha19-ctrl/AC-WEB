#!/usr/bin/env node
/**
 * Comprehensive Seed Script — VKS Autoservices
 * 
 * Seeds ALL data into MongoDB: Admin + Test Users + Auctions + Offers + Notifications
 * 
 * Usage:
 *   node scripts/seed-all.mjs
 *   node scripts/seed-all.mjs --clear   (drops all collections first)
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Config ──────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Sudexhub:Sudexhub2026@cluster0.ivs0qfk.mongodb.net/ACWEB";
const CLEAR_FIRST = process.argv.includes("--clear");
const SALT_ROUNDS = 10;

// ── Schemas ─────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String },
  accountType: { type: String, enum: ["individual", "dealer"] },
  avatar: { type: String },
  kycVerified: { type: Boolean, default: false },
}, { timestamps: true });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

const AuctionSchema = new mongoose.Schema({
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
  currentOffer: { type: Number, default: 0 },
  totalOffers: { type: Number, default: 0 },
  reserveMet: { type: Boolean, default: false },
  rounds: { type: Number, default: 1 },
  roundTimes: [{ start: String, end: String }],
  status: { type: String, enum: ["LIVE", "UPCOMING", "ENDED"], default: "UPCOMING" },
  endTime: { type: Date, required: true },
  startTime: { type: Date, required: true },
  seller: { type: String, default: "VKS Autoservices" },
  verifiedSeller: { type: Boolean, default: true },
  inspectionScore: { type: Number, default: 9.0 },
  lotNumber: { type: String, required: true, unique: true },
  engine: { type: String, default: "" },
  color: { type: String, default: "" },
  ownership: { type: String, default: "" },
  insurance: { type: String, default: "" },
  description: { type: String },
  rules: { type: String },
  whatsappGroupLink: { type: String },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  winningOffer: { type: Number },
}, { timestamps: true });

const OfferSchema = new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  round: { type: Number, required: true },
  isProxy: { type: Boolean, default: false },
  proxyMax: { type: Number },
  isWinning: { type: Boolean, default: false },
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["offer", "higher", "win", "auction", "system"], required: true },
  read: { type: Boolean, default: false },
  relatedAuction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
}, { timestamps: true });

// ── Models ──────────────────────────────────────────────────────────────────
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Auction = mongoose.models.Auction || mongoose.model("Auction", AuctionSchema);
const Offer = mongoose.models.Offer || mongoose.model("Offer", OfferSchema);
const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

// ── Seed Data ───────────────────────────────────────────────────────────────

const USERS = [
  {
    name: "Super Admin",
    email: "admin@gmail.com",
    password: "12345678",
    phone: "+91 9999999999",
    accountType: "individual",
    role: "admin",
    kycVerified: true,
  },
  {
    name: "Vikram Kumar",
    email: "user1@gmail.com",
    password: "12345678",
    phone: "+91 98765 43210",
    accountType: "individual",
    role: "user",
    kycVerified: true,
  },
  {
    name: "Priya Sharma",
    email: "user2@gmail.com",
    password: "12345678",
    phone: "+91 97654 32109",
    accountType: "individual",
    role: "user",
    kycVerified: true,
  },
  {
    name: "Rajesh Motors",
    email: "dealer1@gmail.com",
    password: "12345678",
    phone: "+91 96543 21098",
    accountType: "dealer",
    role: "user",
    kycVerified: true,
  },
  {
    name: "Ananya Patel",
    email: "user3@gmail.com",
    password: "12345678",
    phone: "+91 95432 10987",
    accountType: "individual",
    role: "user",
    kycVerified: false,
  },
  {
    name: "Metro Fleet Solutions",
    email: "dealer2@gmail.com",
    password: "12345678",
    phone: "+91 94321 09876",
    accountType: "dealer",
    role: "user",
    kycVerified: true,
  },
  {
    name: "Rohit Malhotra",
    email: "user4@gmail.com",
    password: "12345678",
    phone: "+91 93210 87654",
    accountType: "individual",
    role: "user",
    kycVerified: true,
  },
  {
    name: "Neha Deshmukh",
    email: "user5@gmail.com",
    password: "12345678",
    phone: "+91 92109 76543",
    accountType: "individual",
    role: "user",
    kycVerified: false,
  },
  {
    name: "VT Imports & Exports",
    email: "dealer3@gmail.com",
    password: "12345678",
    phone: "+91 91098 65432",
    accountType: "dealer",
    role: "user",
    kycVerified: true,
  },
  {
    name: "Suresh Iyer",
    email: "user6@gmail.com",
    password: "12345678",
    phone: "+91 90087 54321",
    accountType: "individual",
    role: "user",
    kycVerified: true,
  },
];

const now = new Date();
const h = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000);
const d = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

const AUCTIONS = [
  {
    title: "2024 Toyota Fortuner Legender 4x4 AT",
    make: "Toyota",
    model: "Fortuner Legender",
    year: 2024,
    variant: "2.8L 4x4 Automatic Dual Tone",
    fuelType: "Diesel",
    transmission: "Automatic",
    mileage: 8200,
    location: "Gurugram, Haryana",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 3200000,
    registrationFee: 5000,
    currentOffer: 3850000,
    totalOffers: 42,
    reserveMet: true,
    status: "LIVE",
    startTime: h(-4),
    endTime: h(1.25),
    seller: "Toyota Certified Pre-Owned",
    verifiedSeller: true,
    inspectionScore: 9.9,
    lotNumber: "LOT-BH-9940",
    engine: "2755 cc, 4-Cylinder D-4D",
    color: "White Pearl & Black Roof",
    ownership: "1st Owner",
    insurance: "Comprehensive till 2027",
    description: "Premium SUV with dual-tone exterior, ventilated seats, panoramic sunroof, and advanced safety suite. Single owner, full service history from Toyota authorized center.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close. Vehicle inspection available before auction.",
  },
  {
    title: "2023 Mahindra Thar LX Hard Top 4WD Diesel AT",
    make: "Mahindra",
    model: "Thar",
    year: 2023,
    variant: "LX Hard Top 4WD Diesel AT (Earth Edition)",
    fuelType: "Diesel",
    transmission: "Automatic",
    mileage: 18400,
    location: "Gurugram, Haryana",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAV602PWWdVt8hOSpPgFIzqBTX44V_W-cxQns2i3xfUPXyfjgXTkxrAy5jDKdAWB1EdyE-UX9UwHF-w9UEAL8_Jwg0Hb70tDaRm2Rb2nBeIAqcj1mET4laGkYEq5lEKQaUqiUbC792dk95GF_uZFolXYuBXwChRz9cfnoPSNXrHUT4ipexfXibOS2-e8wxh1EdJutdSiNpSkFiRfYoYVizjYvSGRq_eUW95pZPJ2KtXNJd9qdc2zOcWz8lxM6XX0MWecF25CEbbPIG5",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAV602PWWdVt8hOSpPgFIzqBTX44V_W-cxQns2i3xfUPXyfjgXTkxrAy5jDKdAWB1EdyE-UX9UwHF-w9UEAL8_Jwg0Hb70tDaRm2Rb2nBeIAqcj1mET4laGkYEq5lEKQaUqiUbC792dk95GF_uZFolXYuBXwChRz9cfnoPSNXrHUT4ipexfXibOS2-e8wxh1EdJutdSiNpSkFiRfYoYVizjYvSGRq_eUW95pZPJ2KtXNJd9qdc2zOcWz8lxM6XX0MWecF25CEbbPIG5",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 1200000,
    registrationFee: 5000,
    currentOffer: 1485000,
    totalOffers: 34,
    reserveMet: true,
    status: "LIVE",
    startTime: h(-6),
    endTime: h(2.75),
    seller: "Premium Auto Corp Gurgaon",
    verifiedSeller: true,
    inspectionScore: 9.4,
    lotNumber: "LOT-BH-8842",
    engine: "2184 cc, mHawk 130",
    color: "Napoli Black",
    ownership: "1st Owner",
    insurance: "Comprehensive till Nov 2026",
    description: "Rare Earth Edition Thar with off-road kit, hard top, automatic transmission. Perfect for adventure enthusiasts.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2023 Toyota Innova Hycross ZX(O) Hybrid",
    make: "Toyota",
    model: "Innova Hycross",
    year: 2023,
    variant: "ZX(O) Strong Hybrid e-CVT",
    fuelType: "Hybrid",
    transmission: "Automatic",
    mileage: 12100,
    location: "Bengaluru, Karnataka",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 2400000,
    registrationFee: 10000,
    currentOffer: 2850000,
    totalOffers: 48,
    reserveMet: true,
    status: "LIVE",
    startTime: h(-2),
    endTime: h(0.3),
    seller: "Apex Motors BLR",
    verifiedSeller: true,
    inspectionScore: 9.8,
    lotNumber: "LOT-BH-9102",
    engine: "1987 cc, 5th Gen Hybrid",
    color: "Blackish Ageha Glass Flake",
    ownership: "1st Owner",
    insurance: "Zero Dep till Dec 2026",
    description: "Top-of-the-line hybrid MPV with ADAS, panoramic roof, 360 camera, and connected car features.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2023 Tata Harrier Fearless Dark Edition AT",
    make: "Tata",
    model: "Harrier",
    year: 2023,
    variant: "Fearless+ Dark Edition Kryotec 170 AT",
    fuelType: "Diesel",
    transmission: "Automatic",
    mileage: 24500,
    location: "Mumbai, Maharashtra",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 1500000,
    registrationFee: 5000,
    currentOffer: 1820000,
    totalOffers: 29,
    reserveMet: true,
    status: "LIVE",
    startTime: h(-8),
    endTime: h(4.2),
    seller: "Metro Fleet Solutions Mumbai",
    verifiedSeller: true,
    inspectionScore: 9.1,
    lotNumber: "LOT-BH-7721",
    engine: "1956 cc, Kryotec 2.0L",
    color: "Oberon Black",
    ownership: "1st Owner",
    insurance: "Valid till Sep 2026",
    description: "All-black dark edition Harrier with panoramic sunroof, ventilated seats, and Level 2 ADAS.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2022 BMW 3 Series Gran Limousine 330Li M Sport",
    make: "BMW",
    model: "3 Series Gran Limousine",
    year: 2022,
    variant: "330Li M Sport Executive",
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 15200,
    location: "New Delhi",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 3800000,
    registrationFee: 15000,
    currentOffer: 4200000,
    totalOffers: 19,
    reserveMet: true,
    status: "UPCOMING",
    startTime: d(1),
    endTime: d(2),
    seller: "Imperial Luxury Wheels",
    verifiedSeller: true,
    inspectionScore: 9.6,
    lotNumber: "LOT-BH-6091",
    engine: "1998 cc, TwinPower Turbo",
    color: "Carbon Black Metallic",
    ownership: "1st Owner",
    insurance: "Comprehensive",
    description: "Long-wheelbase BMW 3 Series with M Sport package, Harman Kardon audio, head-up display, and gesture control.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2022 Mercedes-Benz GLA 220d AMG Line 4MATIC",
    make: "Mercedes-Benz",
    model: "GLA",
    year: 2022,
    variant: "220d AMG Line 4MATIC",
    fuelType: "Diesel",
    transmission: "Automatic",
    mileage: 22000,
    location: "Pune, Maharashtra",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 3200000,
    registrationFee: 15000,
    currentOffer: 3650000,
    totalOffers: 26,
    reserveMet: true,
    status: "LIVE",
    startTime: h(-3),
    endTime: h(1.1),
    seller: "West Coast Autohaus",
    verifiedSeller: true,
    inspectionScore: 9.3,
    lotNumber: "LOT-BH-5412",
    engine: "1950 cc, Inline 4 Diesel",
    color: "Iridium Silver",
    ownership: "1st Owner",
    insurance: "Valid till Oct 2026",
    description: "Compact luxury SUV with AMG Line styling, 4MATIC all-wheel drive, MBUX infotainment, and premium Burmester audio.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2023 Audi Q5 45 TFSI Quattro Technology",
    make: "Audi",
    model: "Q5",
    year: 2023,
    variant: "45 TFSI Technology Quattro",
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 19800,
    location: "Hyderabad, Telangana",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 4200000,
    registrationFee: 25000,
    currentOffer: 4890000,
    totalOffers: 15,
    reserveMet: true,
    status: "ENDED",
    startTime: d(-7),
    endTime: d(-1),
    seller: "Deccan Luxury Cars",
    verifiedSeller: true,
    inspectionScore: 9.7,
    lotNumber: "LOT-BH-4011",
    engine: "1984 cc, 249 hp Turbo",
    color: "Navarra Blue Metallic",
    ownership: "1st Owner",
    insurance: "Full Coverage",
    description: "Premium mid-size SUV with Quattro all-wheel drive, virtual cockpit, matrix LED headlights, and adaptive air suspension.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2023 Kia Carens Luxury Plus 1.5 TGDi",
    make: "Kia",
    model: "Carens",
    year: 2023,
    variant: "Luxury Plus 1.5 Turbo GDi DCT",
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 11300,
    location: "Kolkata, West Bengal",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 1100000,
    registrationFee: 5000,
    currentOffer: 1230000,
    totalOffers: 11,
    reserveMet: true,
    status: "ENDED",
    startTime: d(-12),
    endTime: d(-5),
    seller: "Eastern Auto Corp",
    verifiedSeller: true,
    inspectionScore: 9.0,
    lotNumber: "LOT-BH-3320",
    engine: "1482 cc, Turbo GDi",
    color: "Imperial Blue",
    ownership: "1st Owner",
    insurance: "Valid till Jan 2027",
    description: "Spacious 6-seater Kia Carens Luxury with ventilated seats, 360-degree camera, and connected car suite.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2022 Hyundai Verna SX Turbo",
    make: "Hyundai",
    model: "Verna",
    year: 2022,
    variant: "SX (O) 1.5 Turbo DCT",
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 21600,
    location: "Chennai, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 980000,
    registrationFee: 5000,
    currentOffer: 1090000,
    totalOffers: 23,
    reserveMet: true,
    status: "ENDED",
    startTime: d(-16),
    endTime: d(-9),
    seller: "Nilgiris Motos",
    verifiedSeller: true,
    inspectionScore: 8.8,
    lotNumber: "LOT-BH-3882",
    engine: "1482 cc, Smartstream Turbo",
    color: "Phantom Black",
    ownership: "2nd Owner",
    insurance: "Valid",
    description: "Top-spec Verna Turbo DCT with Bose speakers, sunroof, and Level 2 ADAS. Well maintained.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2023 Skoda Kushaq Style 1.5 TSI AT",
    make: "Skoda",
    model: "Kushaq",
    year: 2023,
    variant: "Style 1.5 TSI DSG",
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 9800,
    location: "Bengaluru, Karnataka",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 1320000,
    registrationFee: 5000,
    currentOffer: 1440000,
    totalOffers: 31,
    reserveMet: true,
    status: "ENDED",
    startTime: d(-3),
    endTime: d(-0.5),
    seller: "VRS Motors BLR",
    verifiedSeller: true,
    inspectionScore: 9.2,
    lotNumber: "LOT-BH-6250",
    engine: "1498 cc, TSI DSG",
    color: "Candy White",
    ownership: "1st Owner",
    insurance: "Zero Dep till 2027",
    description: "European-grade SUV with a segment-best 1.5 TSI DSG combo, wireless CarPlay, and violin-free ride quality.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2024 Hyundai Creta SX(O) Knight Edition"
    ,
    make: "Hyundai",
    model: "Creta",
    year: 2024,
    variant: "SX (O) Knight Edition DCT",
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 6100,
    location: "Pune, Maharashtra",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 1460000,
    registrationFee: 5000,
    currentOffer: 1510000,
    totalOffers: 18,
    reserveMet: true,
    status: "UPCOMING",
    startTime: d(1),
    endTime: d(3),
    seller: "Vhouse Motors Pune",
    verifiedSeller: true,
    inspectionScore: 9.5,
    lotNumber: "LOT-BH-2266",
    weight: "1482 cc, Smartstream TGDi",
    color: "Abyss Black",
    ownership: "1st Owner",
    insurance: "Full, 3-year package",
    description: "New-gen Creta with panoramic sunroof, ADAS, 17-inch alloy, and Digital 10.25” cluster.",
    rules: "All offers are final. Buyer must complete payment within 48 hours of auction close.",
  },
  {
    title: "2021 Tata Tiago XZ+ CNG",
    make: "Tata",
    model: "Tiago",
    year: 2021,
    variant: "XZ+ Limited CNG",
    fuelType: "Petrol",
    transmission: "Manual",
    mileage: 42100,
    location: "Indore, Madhya Pradesh",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1200",
    ],
    startingOffer: 310000,
    registrationFee: 2000,
    currentOffer: 355000,
    totalOffers: 17,
    reserveMet: true,
    status: "UPCOMING",
    startTime: d(1),
    endTime: d(2),
    seller: "Central Auto Bazaar",
    verifiedSeller: true,
    inspectionScore: 8.4,
    lotNumber: "LOT-BH-8848",
    weight: "1199 cc, Revotron",
    color: "Sparkle Bronze",
    ownership: "1st Owner",
    insurance: "Third-party till Oct 2026",
    description: "Budget-friendly CNG hatchback with factory fitment, rear parking sensors, and a clean record.",
    rules: "Registration fee ₹5,000. All offers final.",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function log(msg) { console.log(`  ✅ ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); }
function section(title) { console.log(`\n━━━ ${title} ━━━`); }

// ── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🚀 VKS Autoservices — Full Database Seed\n");
  console.log(`   MongoDB: ${MONGODB_URI.replace(/\/\/[^:]+:([^@]+)@/, "//***:***@")}`);
  console.log(`   Clear first: ${CLEAR_FIRST}`);

  await mongoose.connect(MONGODB_URI);
  log("Connected to MongoDB");

  // ── Clear (optional) ────────────────────────────────────────────────────
  if (CLEAR_FIRST) {
    section("Clearing Database");
    await User.deleteMany({});
    await Auction.deleteMany({});
    await Offer.deleteMany({});
    await Notification.deleteMany({});
    log("All collections cleared");
  }

  // ── Seed Users ──────────────────────────────────────────────────────────
  section("Seeding Users");
  const userDocs = [];
  for (const userData of USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      warn(`${userData.name} (${userData.email}) already exists — skipping`);
      userDocs.push(existing);
    } else {
      const doc = await User.create(userData);
      userDocs.push(doc);
      log(`${userData.name} (${userData.email}) — role: ${userData.role}`);
    }
  }

  const [admin, buyer1, buyer2, dealer1, buyer3, dealer2, buyer4, buyer5, dealer3, buyer6] = userDocs;

  // ── Seed Auctions ───────────────────────────────────────────────────────
  section("Seeding Auctions");
  const auctionDocs = [];
  for (const auctionData of AUCTIONS) {
    const existing = await Auction.findOne({ lotNumber: auctionData.lotNumber });
    if (existing) {
      warn(`${auctionData.title} (${auctionData.lotNumber}) already exists — skipping`);
      auctionDocs.push(existing);
    } else {
      const doc = await Auction.create(auctionData);
      auctionDocs.push(doc);
      log(`${doc.title} — ${doc.status} — ₹${doc.currentOffer.toLocaleString("en-IN")}`);
    }
  }

  const [
    fortuner,
    thar,
    innova,
    harrier,
    bmw,
    merc,
    audi,
    carens,
    verna,
    kushaq,
    creta,
    tiago,
  ] = auctionDocs;

  // ── Seed Offers ───────────────────────────────────────────────────────────
  section("Seeding Offers");

  const nowMs = Date.now();
  const min = (m) => new Date(nowMs - m * 60 * 1000);

  const OFFER_DATA = [
    // Fortuner offers
    { auction: fortuner, buyer: buyer1, amount: 3300000, isWinning: false, createdAt: min(180) },
    { auction: fortuner, buyer: dealer1, amount: 3450000, isWinning: false, createdAt: min(150) },
    { auction: fortuner, buyer: buyer2, amount: 3600000, isWinning: false, createdAt: min(120) },
    { auction: fortuner, buyer: buyer1, amount: 3700000, isWinning: false, createdAt: min(90) },
    { auction: fortuner, buyer: dealer2, amount: 3850000, isWinning: true, createdAt: min(30) },

    // Thar offers
    { auction: thar, buyer: buyer2, amount: 1250000, isWinning: false, createdAt: min(200) },
    { auction: thar, buyer: dealer1, amount: 1350000, isWinning: false, createdAt: min(160) },
    { auction: thar, buyer: buyer3, amount: 1400000, isWinning: false, createdAt: min(100) },
    { auction: thar, buyer: buyer2, amount: 1485000, isWinning: true, createdAt: min(45) },

    // Innova offers
    { auction: innova, buyer: dealer1, amount: 2500000, isWinning: false, createdAt: min(120) },
    { auction: innova, buyer: buyer1, amount: 2650000, isWinning: false, createdAt: min(90) },
    { auction: innova, buyer: dealer2, amount: 2750000, isWinning: false, createdAt: min(60) },
    { auction: innova, buyer: buyer3, amount: 2850000, isWinning: true, createdAt: min(15) },

    // Harrier offers
    { auction: harrier, buyer: buyer3, amount: 1550000, isWinning: false, createdAt: min(300) },
    { auction: harrier, buyer: dealer1, amount: 1650000, isWinning: false, createdAt: min(200) },
    { auction: harrier, buyer: buyer1, amount: 1820000, isWinning: true, createdAt: min(60) },

    // BMW offers
    { auction: bmw, buyer: buyer1, amount: 3900000, isWinning: false, createdAt: min(500) },
    { auction: bmw, buyer: dealer2, amount: 4200000, isWinning: true, createdAt: min(400) },

    // Mercedes offers
    { auction: merc, buyer: buyer2, amount: 3300000, isWinning: false, createdAt: min(150) },
    { auction: merc, buyer: dealer1, amount: 3450000, isWinning: false, createdAt: min(100) },
    { auction: merc, buyer: buyer3, amount: 3650000, isWinning: true, createdAt: min(20) },

    // Audi offers (ended)
    { auction: audi, buyer: dealer1, amount: 4400000, isWinning: false, createdAt: min(2000) },
    { auction: audi, buyer: buyer1, amount: 4600000, isWinning: false, createdAt: min(1500) },
    { auction: audi, buyer: dealer2, amount: 4890000, isWinning: true, createdAt: min(1000) },

    // Carens offers (ended)
    { auction: carens, buyer: buyer4, amount: 1140000, isWinning: false, createdAt: min(800) },
    { auction: carens, buyer: buyer6, amount: 1190000, isWinning: false, createdAt: min(600) },
    { auction: carens, buyer: buyer5, amount: 1230000, isWinning: true, createdAt: min(400) },

    // Verna offers (ended)
    { auction: verna, buyer: buyer3, amount: 1010000, isWinning: false, createdAt: min(1000) },
    { auction: verna, buyer: buyer4, amount: 1050000, isWinning: false, createdAt: min(800) },
    { auction: verna, buyer: buyer5, amount: 1090000, isWinning: true, createdAt: min(500) },

    // Kushaq offers (ended)
    { auction: kushaq, buyer: buyer2, amount: 1360000, isWinning: false, createdAt: min(300) },
    { auction: kushaq, buyer: buyer4, amount: 1410000, isWinning: false, createdAt: min(200) },
    { auction: kushaq, buyer: buyer6, amount: 1440000, isWinning: true, createdAt: min(100) },
  ];

  let offerCount = 0;
  const roundCounts = new Map();
  let offerSeq = 0;
  let prevAuctionId = null;
  for (const b of OFFER_DATA) {
    const auctionId = b.auction._id.toString();
    if (auctionId !== prevAuctionId) {
      offerSeq = 1;
      prevAuctionId = auctionId;
    } else {
      offerSeq++;
    }
    const existing = await Offer.findOne({ auction: b.auction._id, buyer: b.buyer._id, amount: b.amount });
    if (!existing) {
      await Offer.create({
        auction: b.auction._id,
        buyer: b.buyer._id,
        amount: b.amount,
        round: offerSeq,
        isWinning: b.isWinning,
        createdAt: b.createdAt,
      });
      offerCount++;
    }
    roundCounts.set(auctionId, Math.max(roundCounts.get(auctionId) || 0, offerSeq));
  }
  log(`${offerCount} offers inserted across ${AUCTIONS.length} auctions`);

  // Update auction winners + rounds + totalOffers counts
  for (const auctionDoc of auctionDocs) {
    const offerCount = await Offer.countDocuments({ auction: auctionDoc._id });
    const winningOffer = await Offer.findOne({ auction: auctionDoc._id, isWinning: true })
      .sort({ amount: -1 });
    if (winningOffer) {
      auctionDoc.winner = winningOffer.buyer;
      auctionDoc.winningOffer = winningOffer.amount;
    }
    const roundsForAuction = roundCounts.get(auctionDoc._id.toString());
    if (roundsForAuction) auctionDoc.rounds = roundsForAuction;
    auctionDoc.totalOffers = offerCount;
    await auctionDoc.save();
  }
  log("Auction winners + rounds + totalOffers counts updated");

  // ── Paid Access & Refund enrichment ─────────────────────────────────────
  section("Seeding Paid Access & Refunds");

  const PAID_MAP = [
    { user: buyer1, paid: [fortuner, thar, audi], refunded: [audi] },
    { user: buyer2, paid: [thar, innova, kushaq], refunded: [] },
    { user: dealer1, paid: [innova, bmw, audi], refunded: [audi] },
    { user: buyer3, paid: [harrier, verna], refunded: [] },
    { user: dealer2, paid: [audi, merc], refunded: [audi] },
    { user: buyer4, paid: [carens, verna, kushaq], refunded: [kushaq] },
    { user: buyer5, paid: [carens, verna], refunded: [carens] },
    { user: dealer3, paid: [bmw, creta, tiago], refunded: [] },
    { user: buyer6, paid: [carens, kushaq], refunded: [] },
  ];

  for (const row of PAID_MAP) {
    const paidIds = (row.paid || []).map((a) => a._id);
    const refundIds = (row.refunded || []).map((a) => a._id);
    row.user.paidAccessAuctions = paidIds;
    row.user.refundedAuctions = refundIds;
    await row.user.save();
  }
  log("Paid access + refund statuses assigned to users");

  // ── Seed Notifications ──────────────────────────────────────────────────
  section("Seeding Notifications");

  const NOTIFICATIONS = [
    {
      user: buyer1._id,
      title: "Welcome to VKS Autoservices!",
      message: "Your account has been created. Complete KYC verification to start offering on premium vehicles.",
      type: "system",
      read: true,
    },
    {
      user: buyer1._id,
      title: "You've received a Higher Offer!",
      message: "Someone placed a higher offer of ₹3,850,000 on the 2024 Toyota Fortuner Legender.",
      type: "higher",
      read: false,
      relatedAuction: fortuner._id,
    },
    {
      user: buyer1._id,
      title: "Offer placed successfully",
      message: "Your offer of ₹3,700,000 on the 2024 Toyota Fortuner Legender is being tracked.",
      type: "offer",
      read: true,
      relatedAuction: fortuner._id,
    },
    {
      user: buyer1._id,
      title: "Auction ending soon!",
      message: "The 2022 Mercedes-Benz GLA 220d auction is ending in less than 1 hour. Place your final offers now!",
      type: "auction",
      read: false,
      relatedAuction: merc._id,
    },
    {
      user: buyer2._id,
      title: "Welcome to VKS Autoservices!",
      message: "Your account is ready. Browse live auctions and start offering!",
      type: "system",
      read: true,
    },
    {
      user: buyer2._id,
      title: "Highest buyer!",
      message: "You are currently the highest buyer on the 2023 Mahindra Thar LX Hard Top at ₹14,85,000.",
      type: "offer",
      read: false,
      relatedAuction: thar._id,
    },
    {
      user: buyer2._id,
      title: "You've received a Higher Offer!",
      message: "Someone placed a higher offer of ₹2,850,000 on the 2023 Toyota Innova Hycross.",
      type: "higher",
      read: false,
      relatedAuction: innova._id,
    },
    {
      user: dealer1._id,
      title: "Dealer account verified",
      message: "Your dealership KYC has been approved. You can now participate in all auctions.",
      type: "system",
      read: true,
    },
    {
      user: dealer1._id,
      title: "New auction alert",
      message: "A 2022 BMW 3 Series Gran Limousine has been listed. Starting offer: ₹38,00,000.",
      type: "auction",
      read: false,
      relatedAuction: bmw._id,
    },
    {
      user: buyer3._id,
      title: "Welcome to VKS Autoservices!",
      message: "Your account is pending KYC verification. Please submit your documents to start offering.",
      type: "system",
      read: false,
    },
    {
      user: buyer3._id,
      title: "Highest buyer!",
      message: "You are currently the highest buyer on the 2023 Toyota Innova Hycross at ₹28,50,000.",
      type: "offer",
      read: false,
      relatedAuction: innova._id,
    },
    {
      user: dealer2._id,
      title: "Welcome to VKS Autoservices!",
      message: "Your fleet account has been approved. Start offering on bulk vehicle lots.",
      type: "system",
      read: true,
    },
    {
      user: dealer2._id,
      title: "You won an auction!",
      message: "Congratulations! You won the 2023 Audi Q5 45 TFSI Quattro with an offer of ₹48,90,000. Please complete payment within 48 hours.",
      type: "win",
      read: false,
      relatedAuction: audi._id,
    },
    {
      user: buyer4._id,
      title: "Welcome to VKS Autoservices!",
      message: "Your account is ready. Start offering on live premium vehicle auctions.",
      type: "system",
      read: true,
    },
    {
      user: buyer4._id,
      title: "You won an auction!",
      message: "Congratulations! You won the 2022 Hyundai Verna SX Turbo with an offer of ₹10,90,000.",
      type: "win",
      read: false,
      relatedAuction: verna._id,
    },
    {
      user: buyer5._id,
      title: "Welcome to VKS Autoservices!",
      message: "Your account is pending KYC. Upload documents to unlock live bidding.",
      type: "system",
      read: false,
    },
    {
      user: dealer3._id,
      title: "Dealer account verified",
      message: "Your dealership KYC has been approved. You now have access to all auction lots.",
      type: "system",
      read: true,
    },
    {
      user: buyer6._id,
      title: "You won an auction!",
      message: "Congratulations! You won the 2023 Skoda Kushaq Style with an offer of ₹14,40,000.",
      type: "win",
      read: false,
      relatedAuction: kushaq._id,
    },
  ];

  let notifCount = 0;
  for (const n of NOTIFICATIONS) {
    const existing = await Notification.findOne({ user: n.user, title: n.title });
    if (!existing) {
      await Notification.create(n);
      notifCount++;
    }
  }
  log(`${notifCount} notifications inserted`);

  // ── Summary ─────────────────────────────────────────────────────────────
  section("Seed Complete!");
  const totalUsers = await User.countDocuments();
  const totalAuctions = await Auction.countDocuments();
  const totalOffers = await Offer.countDocuments();
  const totalNotifs = await Notification.countDocuments();

  console.log(`\n  📊 Database Summary:`);
  console.log(`     Users:         ${totalUsers}`);
  console.log(`     Auctions:      ${totalAuctions}`);
  console.log(`     Offers:          ${totalOffers}`);
  console.log(`     Notifications: ${totalNotifs}`);
  console.log(`\n  🔑 Login Credentials:`);
  console.log(`     Admin:   admin@gmail.com / 12345678`);
  console.log(`     User 1:  user1@gmail.com / 12345678`);
  console.log(`     User 2:  user2@gmail.com / 12345678`);
  console.log(`     Dealer:  dealer1@gmail.com / 12345678`);
  console.log(`     User 3:  user3@gmail.com / 12345678`);
  console.log(`     Dealer 2: dealer2@gmail.com / 12345678\n`);

  await mongoose.disconnect();
  log("Disconnected from MongoDB");
  console.log("");
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
