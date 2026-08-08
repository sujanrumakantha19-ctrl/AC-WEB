#!/usr/bin/env node
/**
 * Seeds LIVE + UPCOMING auctions into MongoDB.
 *
 * Usage:
 *   node scripts/seed-auctions.mjs
 *
 * Re-running replaces only the auctions it created (lotNumbers prefixed VKS-L- / VKS-U-).
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const envFile = path.resolve(process.cwd(), ".env.local");
const MONGODB_URI =
  (() => {
    try {
      const txt = fs.readFileSync(envFile, "utf-8");
      const m = txt.match(/^\s*MONGODB_URI\s*=\s*["']?([^"'\s]+)["']?\s*$/m);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  })() ||
  process.env.MONGODB_URI ||
  "mongodb+srv://Sudexhub:Sudexhub2026@cluster0.ivs0qfk.mongodb.net/ACWEB";

const Auction = mongoose.models.Auction || mongoose.model("Auction", new mongoose.Schema({}, { strict: false }));

const now = new Date();
const h = (hours) => new Date(now.getTime() + hours * 3600 * 1000);
const d = (days) => new Date(now.getTime() + days * 86400 * 1000);

const img = (n) => `/uploads/auction-${n}.jpg`;

const AUCTIONS = [
  // ── LIVE (12) ──────────────────────────────────────────────────────────────
  {
    title: "2021 Mercedes-Benz C 200 AMG Line",
    make: "Mercedes-Benz", model: "C-Class", year: 2021, variant: "C 200 AMG Line",
    fuelType: "Petrol", transmission: "Automatic", mileage: 45200,
    location: "Mumbai, Maharashtra", image: img(1),
    startingOffer: 4200000, registrationFee: 15000, offerUnlockFee: 5000,
    currentOffer: 4650000, totalOffers: 23, inspectionScore: 9.4,
    lotNumber: "VKS-L-0001", engine: "1497 cc Turbo Petrol", color: "Polar White",
    ownership: "1st Owner", insurance: "Comprehensive till 2027",
    description: "AMG Line sedan with dual-tone 18-inch alloys, panoramic sunroof, 12.3-inch display and ambient lighting. Fully maintained at authorised centre.",
  },
  {
    title: "2022 BMW 530d M Sport",
    make: "BMW", model: "5 Series", year: 2022, variant: "530d M Sport",
    fuelType: "Diesel", transmission: "Automatic", mileage: 38100,
    location: "New Delhi", image: img(2),
    startingOffer: 5800000, registrationFee: 20000, offerUnlockFee: 5000,
    currentOffer: 6120000, totalOffers: 18, inspectionScore: 9.6,
    lotNumber: "VKS-L-0002", engine: "2993 cc TwinPower Turbo", color: "Carbon Black",
    ownership: "1st Owner", insurance: "Zero Dep till Mar 2027",
    description: "Long wheelbase executive sedan with M Sport kit, 360 camera, gesture control and premium Harman Kardon audio.",
  },
  {
    title: "2020 Audi A6 45 TDI Technology",
    make: "Audi", model: "A6", year: 2020, variant: "45 TDI Technology",
    fuelType: "Diesel", transmission: "Automatic", mileage: 61200,
    location: "Bengaluru, Karnataka", image: img(3),
    startingOffer: 3400000, registrationFee: 15000, offerUnlockFee: 5000,
    currentOffer: 3720000, totalOffers: 15, inspectionScore: 9.2,
    lotNumber: "VKS-L-0003", engine: "2967 cc V6 Diesel", color: "Floret Silver",
    ownership: "2nd Owner", insurance: "Valid till Jan 2027",
    description: "Quattro all-wheel-drive luxury sedan with virtual cockpit, matrix LED headlamps and adaptive air suspension.",
  },
  {
    title: "2022 Toyota Fortuner 4x4 Automatic",
    make: "Toyota", model: "Fortuner", year: 2022, variant: "2.8L 4x4 AT",
    fuelType: "Diesel", transmission: "Automatic", mileage: 52400,
    location: "Gurugram, Haryana", image: img(4),
    startingOffer: 3250000, registrationFee: 10000, offerUnlockFee: 5000,
    currentOffer: 3560000, totalOffers: 31, inspectionScore: 9.5,
    lotNumber: "VKS-L-0004", engine: "2755 cc D-4D", color: "Attitude Black",
    ownership: "1st Owner", insurance: "Comprehensive till Aug 2027",
    description: "Mighty SUV with 4x4 drivetrain, ventilated seats, 8-inch touchscreen and 7 airbags. Full Toyota service history.",
  },
  {
    title: "2023 Mahindra Thar LX Hard Top 4WD",
    make: "Mahindra", model: "Thar", year: 2023, variant: "LX Hard Top 4WD Diesel",
    fuelType: "Diesel", transmission: "Manual", mileage: 18400,
    location: "Jaipur, Rajasthan", image: img(5),
    startingOffer: 1380000, registrationFee: 5000, offerUnlockFee: 3000,
    currentOffer: 1520000, totalOffers: 26, inspectionScore: 9.3,
    lotNumber: "VKS-L-0005", engine: "2184 cc mHawk Diesel", color: "Napoli Black",
    ownership: "1st Owner", insurance: "Valid till Dec 2026",
    description: "Legendary off-roader in hard top guise with 4WD low range, ESC and touchscreen infotainment.",
  },
  {
    title: "2022 Honda City ZX CVT",
    make: "Honda", model: "City", year: 2022, variant: "ZX CVT",
    fuelType: "Petrol", transmission: "Automatic", mileage: 24600,
    location: "Chennai, Tamil Nadu", image: img(6),
    startingOffer: 1120000, registrationFee: 5000, offerUnlockFee: 3000,
    currentOffer: 1240000, totalOffers: 22, inspectionScore: 9.1,
    lotNumber: "VKS-L-0006", engine: "1498 cc i-VTEC", color: "Lunar Silver",
    ownership: "1st Owner", insurance: "Valid till Mar 2027",
    description: "Refined sedan with ADAS, wireless Android Auto/Apple CarPlay, sunroof and 40 kmpl-class efficiency.",
  },
  {
    title: "2022 Hyundai Creta SX(O) Diesel",
    make: "Hyundai", model: "Creta", year: 2022, variant: "SX(O) 1.5 Diesel AT",
    fuelType: "Diesel", transmission: "Automatic", mileage: 28700,
    location: "Pune, Maharashtra", image: img(7),
    startingOffer: 1360000, registrationFee: 5000, offerUnlockFee: 3000,
    currentOffer: 1495000, totalOffers: 27, inspectionScore: 9.2,
    lotNumber: "VKS-L-0007", engine: "1493 cc U2 Diesel", color: "Abyss Black",
    ownership: "1st Owner", insurance: "Comprehensive till Apr 2027",
    description: "Best-seller SUV with panoramic sunroof, ventilated front seats, 360-degree camera and connected car tech.",
  },
  {
    title: "2021 Maruti Suzuki Swift ZXi",
    make: "Maruti Suzuki", model: "Swift", year: 2021, variant: "ZXi Petrol",
    fuelType: "Petrol", transmission: "Manual", mileage: 30500,
    location: "Lucknow, Uttar Pradesh", image: img(8),
    startingOffer: 640000, registrationFee: 3000, offerUnlockFee: 2000,
    currentOffer: 705000, totalOffers: 19, inspectionScore: 8.9,
    lotNumber: "VKS-L-0008", engine: "1197 cc K12 Petrol", color: "Pearl Arctic White",
    ownership: "1st Owner", insurance: "Valid till Jun 2027",
    description: "Clean single-owner hatchback with all-season tyres, dual airbags and touchscreen infotainment.",
  },
  {
    title: "2023 Tata Nexon XZ+ Dark",
    make: "Tata", model: "Nexon", year: 2023, variant: "XZ+ Dark 1.2T",
    fuelType: "Petrol", transmission: "Manual", mileage: 15800,
    location: "Ahmedabad, Gujarat", image: img(9),
    startingOffer: 950000, registrationFee: 5000, offerUnlockFee: 3000,
    currentOffer: 1040000, totalOffers: 16, inspectionScore: 9.0,
    lotNumber: "VKS-L-0009", engine: "1199 cc Turbocharged", color: "Midnight Black",
    ownership: "1st Owner", insurance: "Zero Dep till Sep 2027",
    description: "Dark edition compact SUV with 5-star safety rating, sunroof, ventilated seats and connected features.",
  },
  {
    title: "2021 Kia Seltos GTX+ Turbo",
    make: "Kia", model: "Seltos", year: 2021, variant: "GTX+ 1.4T DCT",
    fuelType: "Petrol", transmission: "Automatic", mileage: 33200,
    location: "Hyderabad, Telangana", image: img(10),
    startingOffer: 1420000, registrationFee: 5000, offerUnlockFee: 3000,
    currentOffer: 1560000, totalOffers: 24, inspectionScore: 9.3,
    lotNumber: "VKS-L-0010", engine: "1353 cc Turbo GDI", color: "Intense Red",
    ownership: "1st Owner", insurance: "Valid till Nov 2026",
    description: "Sporty compact SUV with 7-speed DCT, LED lighting, sunroof and premium Bose audio.",
  },
  {
    title: "2020 Volkswagen Tiguan AllSpace",
    make: "Volkswagen", model: "Tiguan", year: 2020, variant: "AllSpace Highline",
    fuelType: "Petrol", transmission: "Automatic", mileage: 44500,
    location: "Kochi, Kerala", image: img(1),
    startingOffer: 2250000, registrationFee: 10000, offerUnlockFee: 5000,
    currentOffer: 2480000, totalOffers: 14, inspectionScore: 9.1,
    lotNumber: "VKS-L-0011", engine: "1984 cc TSI", color: "Deep Black Pearl",
    ownership: "2nd Owner", insurance: "Valid till Feb 2027",
    description: "Seven-seater German SUV with 4MOTION all-wheel drive, panoramic sunroof and adaptive cruise control.",
  },
  {
    title: "2022 Skoda Superb L&K",
    make: "Skoda", model: "Superb", year: 2022, variant: "L&K 2.0 TSI",
    fuelType: "Petrol", transmission: "Automatic", mileage: 26800,
    location: "Chandigarh", image: img(2),
    startingOffer: 2790000, registrationFee: 10000, offerUnlockFee: 5000,
    currentOffer: 3050000, totalOffers: 17, inspectionScore: 9.5,
    lotNumber: "VKS-L-0012", engine: "1984 cc TSI", color: "Magic Black",
    ownership: "1st Owner", insurance: "Comprehensive till May 2027",
    description: "Flagship Laurin & Klement sedan with massage seats, matrix LED headlamps and Canton audio.",
  },

  // ── UPCOMING (8) ────────────────────────────────────────────────────────────
  {
    title: "2023 BMW X1 xLine",
    make: "BMW", model: "X1", year: 2023, variant: "xLine 18d",
    fuelType: "Diesel", transmission: "Automatic", mileage: 12300,
    location: "Mumbai, Maharashtra", image: img(3),
    startingOffer: 3400000, registrationFee: 15000, offerUnlockFee: 5000,
    currentOffer: 3400000, totalOffers: 0, inspectionScore: 9.7,
    lotNumber: "VKS-U-0001", engine: "1995 cc Diesel", color: "Black Sapphire",
    ownership: "1st Owner", insurance: "Zero Dep till Aug 2027",
    description: "Nearly-new luxury compact SUV with the latest iDrive, digital cockpit and driver assistance suite.",
  },
  {
    title: "2022 Mercedes-Benz GLA 200",
    make: "Mercedes-Benz", model: "GLA", year: 2022, variant: "200 Petrol",
    fuelType: "Petrol", transmission: "Automatic", mileage: 21800,
    location: "Gurugram, Haryana", image: img(4),
    startingOffer: 3200000, registrationFee: 15000, offerUnlockFee: 5000,
    currentOffer: 3200000, totalOffers: 0, inspectionScore: 9.4,
    lotNumber: "VKS-U-0002", engine: "1332 cc Turbo Petrol", color: "Iridium Silver",
    ownership: "1st Owner", insurance: "Comprehensive till Oct 2027",
    description: "Compact luxury SUV with dual 10.25-inch displays, ambient lighting and active brake assist.",
  },
  {
    title: "2021 Jaguar XF 2.0 R-Dynamic",
    make: "Jaguar", model: "XF", year: 2021, variant: "2.0 R-Dynamic SE",
    fuelType: "Petrol", transmission: "Automatic", mileage: 30800,
    location: "Bengaluru, Karnataka", image: img(5),
    startingOffer: 4150000, registrationFee: 20000, offerUnlockFee: 5000,
    currentOffer: 4150000, totalOffers: 0, inspectionScore: 9.6,
    lotNumber: "VKS-U-0003", engine: "1997 cc Turbo Petrol", color: "Santorini Black",
    ownership: "1st Owner", insurance: "Valid till Sep 2027",
    description: "British executive sedan with Meridian audio, head-up display and leather-trimmed cabin.",
  },
  {
    title: "2019 Range Rover Evoque R-Dynamic",
    make: "Land Rover", model: "Range Rover Evoque", year: 2019, variant: "R-Dynamic S",
    fuelType: "Petrol", transmission: "Automatic", mileage: 48700,
    location: "New Delhi", image: img(6),
    startingOffer: 3800000, registrationFee: 20000, offerUnlockFee: 5000,
    currentOffer: 3800000, totalOffers: 0, inspectionScore: 9.0,
    lotNumber: "VKS-U-0004", engine: "1997 cc Turbo Petrol", color: "Firenze Red",
    ownership: "2nd Owner", insurance: "Valid till Dec 2026",
    description: "Premium compact SUV with panoramic roof, gesture tailgate and Terrain Response system.",
  },
  {
    title: "2023 Toyota Camry Hybrid",
    make: "Toyota", model: "Camry", year: 2023, variant: "Hybrid",
    fuelType: "Hybrid", transmission: "Automatic", mileage: 16500,
    location: "Chennai, Tamil Nadu", image: img(7),
    startingOffer: 3650000, registrationFee: 15000, offerUnlockFee: 5000,
    currentOffer: 3650000, totalOffers: 0, inspectionScore: 9.8,
    lotNumber: "VKS-U-0005", engine: "2487 cc Hybrid", color: "Platinum Pearl",
    ownership: "1st Owner", insurance: "Comprehensive till Jul 2027",
    description: "Flagship self-charging hybrid sedan with ADAS, 360 camera and plush rear lounge seating.",
  },
  {
    title: "2022 Hyundai Tucson Signature Diesel",
    make: "Hyundai", model: "Tucson", year: 2022, variant: "Signature 2.0 Diesel",
    fuelType: "Diesel", transmission: "Automatic", mileage: 23400,
    location: "Pune, Maharashtra", image: img(8),
    startingOffer: 2580000, registrationFee: 10000, offerUnlockFee: 5000,
    currentOffer: 2580000, totalOffers: 0, inspectionScore: 9.4,
    lotNumber: "VKS-U-0006", engine: "1999 cc Diesel", color: "Abyss Black Pearl",
    ownership: "1st Owner", insurance: "Zero Dep till Feb 2027",
    description: "All-new Tucson with parametric design, dual 12.3-inch screens, panoramic sunroof and 18-level ADAS.",
  },
  {
    title: "2021 Kia Carnival Limousine",
    make: "Kia", model: "Carnival", year: 2021, variant: "Limousine Diesel AT",
    fuelType: "Diesel", transmission: "Automatic", mileage: 39600,
    location: "Hyderabad, Telangana", image: img(9),
    startingOffer: 2750000, registrationFee: 10000, offerUnlockFee: 5000,
    currentOffer: 2750000, totalOffers: 0, inspectionScore: 9.2,
    lotNumber: "VKS-U-0007", engine: "2199 cc Diesel", color: "Snow White Pearl",
    ownership: "1st Owner", insurance: "Valid till Jan 2027",
    description: "Luxury people mover with reclining captain seats, dual sunroof and premium cabin entertainment.",
  },
  {
    title: "2020 Porsche Macan",
    make: "Porsche", model: "Macan", year: 2020, variant: "Base",
    fuelType: "Petrol", transmission: "Automatic", mileage: 35100,
    location: "Mumbai, Maharashtra", image: img(10),
    startingOffer: 5500000, registrationFee: 25000, offerUnlockFee: 10000,
    currentOffer: 5500000, totalOffers: 0, inspectionScore: 9.7,
    lotNumber: "VKS-U-0008", engine: "1988 cc Turbo", color: "Mamba Green",
    ownership: "1st Owner", insurance: "Comprehensive till Mar 2027",
    description: "Driver-focused sports SUV with PDK transmission, adaptive dampers and sport chrono package.",
  },
];

async function seed() {
  console.log("Seeding auctions...");

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected.");

  await Auction.deleteMany({ lotNumber: { $in: [/^VKS-L-/, /^VKS-U-/] } });
  console.log("Removed previous seed auctions (VKS-L- / VKS-U-).");

  const docs = AUCTIONS.map((a) => {
    const isLive = a.lotNumber.startsWith("VKS-L-");
    const startTime = isLive ? h(-(3 + Math.floor(Math.random() * 12))) : d(1 + Math.floor(Math.random() * 6));
    const endTime = isLive ? d(2 + Math.floor(Math.random() * 4)) : new Date(startTime.getTime() + 4 * 3600 * 1000);
    return {
      ...a,
      status: isLive ? "LIVE" : "UPCOMING",
      images: [a.image],
      rounds: 1,
      startTime,
      endTime,
      currentRound: 1,
      roundTimes: isLive ? [{ start: startTime.toISOString(), end: endTime.toISOString() }] : [],
      roundStates: isLive
        ? [{ round: 1, status: "active", highestOffer: a.currentOffer || a.startingOffer }]
        : [],
      seller: "VKS Autoservices",
      verifiedSeller: true,
    };
  });

  const inserted = await Auction.insertMany(docs);
  console.log(`Inserted ${inserted.length} auctions (${inserted.filter((x) => x.status === "LIVE").length} LIVE, ${inserted.filter((x) => x.status === "UPCOMING").length} UPCOMING).`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
