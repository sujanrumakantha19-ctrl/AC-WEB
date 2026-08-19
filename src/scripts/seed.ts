import mongoose from "mongoose";
import User from "../models/User";
import Auction from "../models/Auction";
import Offer from "../models/Offer";
import Setting from "../models/Setting";
import Notification from "../models/Notification";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Sudexhub:Sudexhub2026@cluster0.ivs0qfk.mongodb.net/ACWEB";

async function run() {
  try {
    console.log("Connecting to MongoDB via mongoose.connect()...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully to MongoDB!");

    // Clear collections
    console.log("Clearing existing collections...");
    await User.deleteMany({});
    await Auction.deleteMany({});
    await Offer.deleteMany({});
    await Setting.deleteMany({});
    await Notification.deleteMany({});

    console.log("Collections cleared!");

    // Create Admin User
    await User.create({
      name: "VKS Admin",
      email: "admin@vks.com",
      password: "Admin@1234",
      role: "admin",
      cusId: "ADM-1001",
      phone: "919000000000",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      kycVerified: true,
    });

    // Create Customers with unique phone numbers
    const customersData = [
      {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@gmail.com",
        password: "User@1234",
        role: "user",
        cusId: "CUS-1001-A",
        phone: "919876543210",
        addressLine1: "Flat 402, Seawood Towers, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        pincode: "400050",
        accountType: "dealer",
        kycVerified: true,
      },
      {
        name: "Priya Sharma",
        email: "priya.sharma@yahoo.com",
        password: "User@1234",
        role: "user",
        cusId: "CUS-1002-B",
        phone: "919812345678",
        addressLine1: "B-12, Vasant Kunj",
        city: "Delhi",
        state: "Delhi NCR",
        country: "India",
        pincode: "110070",
        accountType: "individual",
        kycVerified: true,
      },
      {
        name: "Vikramaditya Singh",
        email: "vikram@singhmotors.com",
        password: "User@1234",
        role: "user",
        cusId: "CUS-1003-C",
        phone: "919711223344",
        addressLine1: "Plot 45, C-Scheme",
        city: "Jaipur",
        state: "Rajasthan",
        country: "India",
        pincode: "302001",
        accountType: "dealer",
        kycVerified: true,
      },
      {
        name: "Ananya Deshmukh",
        email: "ananya.d@gmail.com",
        password: "User@1234",
        role: "user",
        cusId: "CUS-1004-D",
        phone: "919988776655",
        addressLine1: "78, Koregaon Park Road",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        pincode: "411001",
        accountType: "individual",
        kycVerified: true,
      },
      {
        name: "Suresh Reddy",
        email: "suresh.reddy@reddyauto.in",
        password: "User@1234",
        role: "user",
        cusId: "CUS-1005-E",
        phone: "919440112233",
        addressLine1: "Road No. 12, Jubilee Hills",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        pincode: "500033",
        accountType: "dealer",
        kycVerified: true,
      },
      {
        name: "Karthik Venkat",
        email: "karthik.v@gmail.com",
        password: "User@1234",
        role: "user",
        cusId: "CUS-1006-F",
        phone: "919840998877",
        addressLine1: "15, Anna Nagar 2nd Avenue",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        pincode: "600040",
        accountType: "individual",
        kycVerified: true,
      },
      {
        name: "Arjun Mehta",
        email: "arjun.m@mehtacars.com",
        password: "User@1234",
        role: "user",
        cusId: "CUS-1007-G",
        phone: "919820114477",
        addressLine1: "22, SG Highway, Thaltej",
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        pincode: "380054",
        accountType: "dealer",
        kycVerified: true,
      },
      {
        name: "Deepak Patel",
        email: "deepak.patel@gmail.com",
        password: "User@1234",
        role: "user",
        cusId: "CUS-1008-H",
        phone: "919898001122",
        addressLine1: "Ring Road, Ghod Dod Road",
        city: "Surat",
        state: "Gujarat",
        country: "India",
        pincode: "395007",
        accountType: "individual",
        kycVerified: false,
      },
    ];

    const users = await User.create(customersData);
    const uRajesh = users[0];
    const uPriya = users[1];
    const uVikram = users[2];
    const uAnanya = users[3];
    const uSuresh = users[4];
    const uKarthik = users[5];
    const uArjun = users[6];

    console.log(`Inserted ${users.length} customer accounts!`);

    const imgThar = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80";
    const imgCreta = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80";
    const imgNexon = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80";
    const imgFortuner = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80";
    const imgBMW = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80";
    const imgMerc = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80";
    const imgSeltos = "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80";
    const imgCity = "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80";

    const now = new Date();
    const future1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const future2 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const past1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const auctionsData = [
      {
        lotNumber: "LOT-1001",
        title: "2023 Mahindra Thar LX 4WD Hard Top Diesel",
        make: "Mahindra",
        model: "Thar",
        year: 2023,
        variant: "LX 4WD Hard Top",
        fuelType: "Diesel",
        transmission: "Automatic",
        mileage: 18500,
        location: "Mumbai, Maharashtra",
        image: imgThar,
        images: [imgThar, imgFortuner],
        startingOffer: 1250000,
        registrationFee: 5000,
        offerUnlockFee: 5000,
        currentOffer: 1380000,
        totalOffers: 3,
        reserveMet: true,
        rounds: 3,
        roundTimes: [
          { start: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), end: new Date(now.getTime() + 60 * 60 * 1000).toISOString() },
          { start: new Date(now.getTime() + 65 * 60 * 1000).toISOString(), end: new Date(now.getTime() + 120 * 60 * 1000).toISOString() },
          { start: new Date(now.getTime() + 125 * 60 * 1000).toISOString(), end: new Date(now.getTime() + 180 * 60 * 1000).toISOString() },
        ],
        currentRound: 1,
        roundStates: [
          { round: 1, status: "active", highestOffer: 1380000, highestBuyer: uRajesh._id, startedAt: new Date(now.getTime() - 60 * 60 * 1000) },
          { round: 2, status: "pending", highestOffer: 0 },
          { round: 3, status: "pending", highestOffer: 0 },
        ],
        status: "LIVE",
        startTime: new Date(now.getTime() - 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 180 * 60 * 1000),
        seller: "VKS Premium Auto",
        verifiedSeller: true,
        inspectionScore: 9.4,
        engine: "2.2L mHawk Diesel",
        color: "Napoli Black",
        ownership: "1st Owner",
        insurance: "Valid till Dec 2026",
        description: "Immaculate condition Mahindra Thar with full company service history, ceramic coating, and custom alloys.",
        rules: "Minimum offer increment: ₹10,000. Registration fee ₹5,000 mandatory before placing offers.",
        whatsappGroupLink: "https://chat.whatsapp.com/sample-group-1",
      },
      {
        lotNumber: "LOT-1002",
        title: "2022 Hyundai Creta SX (O) 1.5 CRDi Diesel AT",
        make: "Hyundai",
        model: "Creta",
        year: 2022,
        variant: "SX (O) 1.5 CRDi",
        fuelType: "Diesel",
        transmission: "Automatic",
        mileage: 24000,
        location: "Delhi NCR",
        image: imgCreta,
        images: [imgCreta, imgSeltos],
        startingOffer: 1120000,
        registrationFee: 5000,
        offerUnlockFee: 5000,
        currentOffer: 1240000,
        totalOffers: 2,
        reserveMet: true,
        rounds: 2,
        roundTimes: [
          { start: new Date(now.getTime() - 40 * 60 * 1000).toISOString(), end: new Date(now.getTime() + 50 * 60 * 1000).toISOString() },
          { start: new Date(now.getTime() + 55 * 60 * 1000).toISOString(), end: new Date(now.getTime() + 110 * 60 * 1000).toISOString() },
        ],
        currentRound: 1,
        roundStates: [
          { round: 1, status: "active", highestOffer: 1240000, highestBuyer: uPriya._id, startedAt: new Date(now.getTime() - 40 * 60 * 1000) },
          { round: 2, status: "pending", highestOffer: 0 },
        ],
        status: "LIVE",
        startTime: new Date(now.getTime() - 40 * 60 * 1000),
        endTime: new Date(now.getTime() + 110 * 60 * 1000),
        seller: "VKS Fleet Sales",
        verifiedSeller: true,
        inspectionScore: 9.1,
        engine: "1.5L U2 CRDi Diesel",
        color: "Polar White",
        ownership: "1st Owner",
        insurance: "Comprehensive till Aug 2026",
        description: "Top-end Creta SX(O) with panoramic sunroof, Bose sound system, ventilated seats, and zero accidents.",
        rules: "Minimum offer increment: ₹10,000.",
        whatsappGroupLink: "https://chat.whatsapp.com/sample-group-2",
      },
      {
        lotNumber: "LOT-1003",
        title: "2024 Tata Nexon EV Long Range Empowered Plus",
        make: "Tata",
        model: "Nexon EV",
        year: 2024,
        variant: "Empowered Plus Long Range",
        fuelType: "EV",
        transmission: "Automatic",
        mileage: 8500,
        location: "Bengaluru, Karnataka",
        image: imgNexon,
        images: [imgNexon],
        startingOffer: 1380000,
        registrationFee: 5000,
        offerUnlockFee: 5000,
        currentOffer: 1450000,
        totalOffers: 1,
        reserveMet: true,
        rounds: 2,
        roundTimes: [
          { start: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), end: new Date(now.getTime() + 60 * 60 * 1000).toISOString() },
          { start: new Date(now.getTime() + 65 * 60 * 1000).toISOString(), end: new Date(now.getTime() + 120 * 60 * 1000).toISOString() },
        ],
        currentRound: 1,
        roundStates: [
          { round: 1, status: "active", highestOffer: 1450000, highestBuyer: uSuresh._id, startedAt: new Date(now.getTime() - 20 * 60 * 1000) },
          { round: 2, status: "pending", highestOffer: 0 },
        ],
        status: "LIVE",
        startTime: new Date(now.getTime() - 20 * 60 * 1000),
        endTime: new Date(now.getTime() + 120 * 60 * 1000),
        seller: "EV Direct India",
        verifiedSeller: true,
        inspectionScore: 9.6,
        engine: "Permanent Magnet Synchronous Motor (40.5 kWh Battery)",
        color: "Empowered Teal",
        ownership: "1st Owner",
        insurance: "Zero Dep Insurance till 2027",
        description: "Latest Nexon EV facelift with 465 km ARAI range, 360-degree camera, V2L & V2V charging capabilities.",
        rules: "Minimum offer increment: ₹10,000.",
        whatsappGroupLink: "https://chat.whatsapp.com/sample-group-3",
      },
      {
        lotNumber: "LOT-1004",
        title: "2023 Toyota Fortuner Legender 4x4 AT",
        make: "Toyota",
        model: "Fortuner",
        year: 2023,
        variant: "Legender 4x4 AT",
        fuelType: "Diesel",
        transmission: "Automatic",
        mileage: 15000,
        location: "Pune, Maharashtra",
        image: imgFortuner,
        images: [imgFortuner],
        startingOffer: 3850000,
        registrationFee: 10000,
        offerUnlockFee: 10000,
        currentOffer: 0,
        totalOffers: 0,
        reserveMet: false,
        rounds: 3,
        roundTimes: [
          { start: new Date(future1.getTime()).toISOString(), end: new Date(future1.getTime() + 60 * 60 * 1000).toISOString() },
          { start: new Date(future1.getTime() + 70 * 60 * 1000).toISOString(), end: new Date(future1.getTime() + 130 * 60 * 1000).toISOString() },
          { start: new Date(future1.getTime() + 140 * 60 * 1000).toISOString(), end: new Date(future1.getTime() + 200 * 60 * 1000).toISOString() },
        ],
        currentRound: 1,
        roundStates: [
          { round: 1, status: "pending", highestOffer: 0 },
          { round: 2, status: "pending", highestOffer: 0 },
          { round: 3, status: "pending", highestOffer: 0 },
        ],
        status: "UPCOMING",
        startTime: future1,
        endTime: new Date(future1.getTime() + 200 * 60 * 1000),
        seller: "VKS Luxury Cars",
        verifiedSeller: true,
        inspectionScore: 9.7,
        engine: "2.8L Turbocharged Diesel Engine",
        color: "Super White Dual Tone",
        ownership: "1st Owner",
        insurance: "Full Insurance valid",
        description: "Prestigious Toyota Fortuner Legender 4x4. Dual-zone AC, wireless charging, JBL 11-speaker audio system.",
        rules: "Registration deposit ₹10,000 required.",
        whatsappGroupLink: "https://chat.whatsapp.com/sample-group-4",
      },
      {
        lotNumber: "LOT-1005",
        title: "2022 BMW 3 Series 320d M Sport",
        make: "BMW",
        model: "3 Series",
        year: 2022,
        variant: "320d M Sport",
        fuelType: "Diesel",
        transmission: "Automatic",
        mileage: 21000,
        location: "Hyderabad, Telangana",
        image: imgBMW,
        images: [imgBMW],
        startingOffer: 3400000,
        registrationFee: 10000,
        offerUnlockFee: 10000,
        currentOffer: 0,
        totalOffers: 0,
        reserveMet: false,
        rounds: 2,
        roundTimes: [
          { start: new Date(future2.getTime()).toISOString(), end: new Date(future2.getTime() + 60 * 60 * 1000).toISOString() },
          { start: new Date(future2.getTime() + 70 * 60 * 1000).toISOString(), end: new Date(future2.getTime() + 130 * 60 * 1000).toISOString() },
        ],
        currentRound: 1,
        roundStates: [
          { round: 1, status: "pending", highestOffer: 0 },
          { round: 2, status: "pending", highestOffer: 0 },
        ],
        status: "UPCOMING",
        startTime: future2,
        endTime: new Date(future2.getTime() + 130 * 60 * 1000),
        seller: "BMW Premium Partner",
        verifiedSeller: true,
        inspectionScore: 9.5,
        engine: "2.0L BMW TwinPower Turbo Diesel Engine",
        color: "Portimao Blue",
        ownership: "1st Owner",
        insurance: "Comprehensive till Nov 2026",
        description: "BMW 3 Series M Sport edition with Head-Up Display, Gesture Control, and M Aerodynamics package.",
        rules: "Minimum offer increment ₹25,000.",
        whatsappGroupLink: "https://chat.whatsapp.com/sample-group-5",
      },
      {
        lotNumber: "LOT-1007",
        title: "2021 Mercedes-Benz C-Class C200 Progressive",
        make: "Mercedes-Benz",
        model: "C-Class",
        year: 2021,
        variant: "C200 Progressive",
        fuelType: "Petrol",
        transmission: "Automatic",
        mileage: 28000,
        location: "Mumbai, Maharashtra",
        image: imgMerc,
        images: [imgMerc],
        startingOffer: 2850000,
        registrationFee: 5000,
        offerUnlockFee: 5000,
        currentOffer: 3120000,
        totalOffers: 2,
        reserveMet: true,
        rounds: 2,
        roundTimes: [
          { start: new Date(past1.getTime()).toISOString(), end: new Date(past1.getTime() + 60 * 60 * 1000).toISOString() },
          { start: new Date(past1.getTime() + 70 * 60 * 1000).toISOString(), end: new Date(past1.getTime() + 130 * 60 * 1000).toISOString() },
        ],
        currentRound: 2,
        roundStates: [
          { round: 1, status: "completed", highestOffer: 3000000, highestBuyer: uVikram._id, startedAt: past1, endedAt: new Date(past1.getTime() + 60 * 60 * 1000) },
          { round: 2, status: "completed", highestOffer: 3120000, highestBuyer: uRajesh._id, startedAt: new Date(past1.getTime() + 70 * 60 * 1000), endedAt: new Date(past1.getTime() + 130 * 60 * 1000) },
        ],
        status: "ENDED",
        startTime: past1,
        endTime: new Date(past1.getTime() + 130 * 60 * 1000),
        seller: "VKS Auto Direct",
        verifiedSeller: true,
        inspectionScore: 9.3,
        engine: "2.0L Turbocharged Petrol",
        color: "Iridium Silver",
        ownership: "1st Owner",
        insurance: "Comprehensive",
        description: "Sleek Mercedes-Benz C200. Winner declared for Rajesh Kumar (CUS-1001-A).",
        winner: uRajesh._id,
        winningOffer: 3120000,
      },
      {
        lotNumber: "LOT-1008",
        title: "2022 Kia Seltos GTX Plus 1.4 Turbo Petrol DCT",
        make: "Kia",
        model: "Seltos",
        year: 2022,
        variant: "GTX Plus 1.4 T-GDi DCT",
        fuelType: "Petrol",
        transmission: "Automatic",
        mileage: 26000,
        location: "Delhi NCR",
        image: imgSeltos,
        images: [imgSeltos],
        startingOffer: 1280000,
        registrationFee: 5000,
        offerUnlockFee: 5000,
        currentOffer: 1450000,
        totalOffers: 2,
        reserveMet: true,
        rounds: 2,
        roundTimes: [
          { start: new Date(past1.getTime() - 24 * 60 * 60 * 1000).toISOString(), end: new Date(past1.getTime() - 23 * 60 * 60 * 1000).toISOString() },
          { start: new Date(past1.getTime() - 22 * 60 * 60 * 1000).toISOString(), end: new Date(past1.getTime() - 21 * 60 * 60 * 1000).toISOString() },
        ],
        currentRound: 2,
        roundStates: [
          { round: 1, status: "completed", highestOffer: 1380000, highestBuyer: uArjun._id },
          { round: 2, status: "completed", highestOffer: 1450000, highestBuyer: uVikram._id },
        ],
        status: "ENDED",
        startTime: new Date(past1.getTime() - 24 * 60 * 60 * 1000),
        endTime: new Date(past1.getTime() - 21 * 60 * 60 * 1000),
        seller: "VKS Auto Direct",
        verifiedSeller: true,
        inspectionScore: 9.0,
        engine: "1.4L Smartstream Petrol",
        color: "Gravity Grey",
        ownership: "1st Owner",
        insurance: "Valid",
        description: "Kia Seltos GTX Plus top variant. Winner declared for Vikramaditya Singh (CUS-1003-C).",
        winner: uVikram._id,
        winningOffer: 1450000,
      },
      {
        lotNumber: "LOT-1009",
        title: "2020 Honda City 1.5 i-VTEC VX Manual",
        make: "Honda",
        model: "City",
        year: 2020,
        variant: "1.5 i-VTEC VX",
        fuelType: "Petrol",
        transmission: "Manual",
        mileage: 38000,
        location: "Ahmedabad, Gujarat",
        image: imgCity,
        images: [imgCity],
        startingOffer: 680000,
        registrationFee: 5000,
        offerUnlockFee: 5000,
        currentOffer: 760000,
        totalOffers: 1,
        reserveMet: true,
        rounds: 1,
        roundTimes: [
          { start: new Date(past1.getTime() - 48 * 60 * 60 * 1000).toISOString(), end: new Date(past1.getTime() - 47 * 60 * 60 * 1000).toISOString() },
        ],
        currentRound: 1,
        roundStates: [
          { round: 1, status: "completed", highestOffer: 760000, highestBuyer: uRajesh._id },
        ],
        status: "ENDED",
        startTime: new Date(past1.getTime() - 48 * 60 * 60 * 1000),
        endTime: new Date(past1.getTime() - 47 * 60 * 60 * 1000),
        seller: "VKS Auto Direct",
        verifiedSeller: true,
        inspectionScore: 8.9,
        engine: "1.5L i-VTEC Petrol Engine",
        color: "Orchid White Pearl",
        ownership: "1st Owner",
        insurance: "Valid",
        description: "Honda City VX Petrol. Winner declared for Rajesh Kumar (CUS-1001-A).",
        winner: uRajesh._id,
        winningOffer: 760000,
      },
    ];

    const auctions = await Auction.create(auctionsData);
    const aThar = auctions[0];
    const aCreta = auctions[1];
    const aNexon = auctions[2];
    const aMerc = auctions[5];
    const aSeltos = auctions[6];
    const aCity = auctions[7];

    console.log(`Inserted ${auctions.length} auctions!`);

    // Offers
    const offersData = [
      { auction: aThar._id, buyer: uAnanya._id, amount: 1280000, round: 1, createdAt: new Date(now.getTime() - 50 * 60 * 1000) },
      { auction: aThar._id, buyer: uArjun._id, amount: 1320000, round: 1, createdAt: new Date(now.getTime() - 40 * 60 * 1000) },
      { auction: aThar._id, buyer: uRajesh._id, amount: 1380000, round: 1, createdAt: new Date(now.getTime() - 15 * 60 * 1000) },

      { auction: aCreta._id, buyer: uKarthik._id, amount: 1180000, round: 1, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
      { auction: aCreta._id, buyer: uPriya._id, amount: 1240000, round: 1, createdAt: new Date(now.getTime() - 10 * 60 * 1000) },

      { auction: aNexon._id, buyer: uSuresh._id, amount: 1450000, round: 1, createdAt: new Date(now.getTime() - 5 * 60 * 1000) },

      { auction: aMerc._id, buyer: uVikram._id, amount: 3000000, round: 1, createdAt: new Date(past1.getTime() + 30 * 60 * 1000) },
      { auction: aMerc._id, buyer: uRajesh._id, amount: 3120000, round: 2, createdAt: new Date(past1.getTime() + 100 * 60 * 1000) },

      { auction: aSeltos._id, buyer: uArjun._id, amount: 1380000, round: 1, createdAt: new Date(past1.getTime() - 23.5 * 60 * 60 * 1000) },
      { auction: aSeltos._id, buyer: uVikram._id, amount: 1450000, round: 2, createdAt: new Date(past1.getTime() - 21.5 * 60 * 60 * 1000) },

      { auction: aCity._id, buyer: uRajesh._id, amount: 760000, round: 1, createdAt: new Date(past1.getTime() - 47.5 * 60 * 60 * 1000) },
    ];

    await Offer.create(offersData);
    console.log(`Inserted ${offersData.length} offers!`);

    // Update Access & Refunds
    uRajesh.paidAccessAuctions = [aThar._id, aMerc._id, aCity._id];
    await uRajesh.save();

    uPriya.paidAccessAuctions = [aCreta._id];
    await uPriya.save();

    uVikram.paidAccessAuctions = [aMerc._id, aSeltos._id];
    uVikram.refundedAuctions = [aMerc._id];
    await uVikram.save();

    uAnanya.paidAccessAuctions = [aThar._id];
    await uAnanya.save();

    uSuresh.paidAccessAuctions = [aNexon._id];
    await uSuresh.save();

    uKarthik.paidAccessAuctions = [aCreta._id];
    await uKarthik.save();

    uArjun.paidAccessAuctions = [aThar._id, aSeltos._id];
    uArjun.refundedAuctions = [aSeltos._id];
    await uArjun.save();

    // Settings
    await Setting.create([
      { key: "registrationFee", value: "5000" },
      { key: "specialRules", value: "Welcome to VKS Autoservices Auction Portal." },
    ]);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

run();
