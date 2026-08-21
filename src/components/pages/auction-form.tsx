"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuctionFormSkeleton } from "@/components/ui/skeleton";
import { useGetAuctionQuery, useCreateAuctionMutation, useUpdateAuctionMutation } from "@/services/auctions-api";
import { useGetSpecialRulesQuery } from "@/services/settings-api";
import { useUploadImageMutation } from "@/services/upload-api";
import { errorMessage } from "@/lib/helpers";
import { compressImage } from "@/lib/compress-image";

const toLocalInput = (d: string | Date | undefined) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

export default function AuctionForm({ auctionId }: { auctionId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from") || "";
  const fromQuery = fromParam ? `?from=${encodeURIComponent(fromParam)}` : "";
  const isEdit = !!auctionId;
  const [transmission, setTransmission] = useState<"Automatic" | "Manual">("Automatic");
  const [fuelType, setFuelType] = useState("Petrol");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2024");
  const [variant, setVariant] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [mileage, setMileage] = useState("");
  const [location, setLocation] = useState("");
  const [startingOffer, setStartingOffer] = useState("");
  const [registrationFee, setRegistrationFee] = useState("599");
  const [offerUnlockFee, setOfferUnlockFee] = useState("");
  const [ownership, setOwnership] = useState("");
  const [insurance, setInsurance] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [rounds, setRounds] = useState("3");
  const [roundTimes, setRoundTimes] = useState<{ start: string; end: string }[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState("");
  const [isParkingSale, setIsParkingSale] = useState(false);
  const [parkingSaleStart, setParkingSaleStart] = useState("");
  const [thresholdAmount, setThresholdAmount] = useState("");

  const { data: auctionData, isLoading } = useGetAuctionQuery(auctionId || "", { skip: !auctionId });
  const { data: rulesData } = useGetSpecialRulesQuery(undefined, { skip: !!auctionId });
  const [createAuction] = useCreateAuctionMutation();
  const [updateAuction] = useUpdateAuctionMutation();
  const [uploadImage] = useUploadImageMutation();

  const auction = auctionData?.auction;
  const loading = isEdit && isLoading;

  useEffect(() => {
    if (!auction) return;
    setTransmission(auction.transmission === "Manual" ? "Manual" : "Automatic");
    setFuelType(auction.fuelType || "Petrol");
    setMake(auction.make || "");
    setModel(auction.model || "");
    setYear(auction.year ? String(auction.year) : "2024");
    setVariant(auction.variant || "");
    setLotNumber(auction.lotNumber || "");
    setMileage(auction.mileage ? String(auction.mileage) : "");
    setLocation(auction.location || "");
    setStartingOffer(auction.startingOffer ? String(auction.startingOffer) : "");
    setRegistrationFee(auction.registrationFee ? String(auction.registrationFee) : "599");
    setOfferUnlockFee(auction.offerUnlockFee ? String(auction.offerUnlockFee) : "");
    setOwnership(auction.ownership || "");
    setInsurance(auction.insurance || "");
    setColor(auction.color || "");
    setDescription(auction.description || "");
    setRules(auction.rules || "");
    setRounds(auction.rounds ? String(auction.rounds) : "3");
    if (Array.isArray(auction.roundTimes) && auction.roundTimes.length > 0) {
      setRoundTimes(auction.roundTimes.map((rt) => ({ start: toLocalInput(rt.start), end: toLocalInput(rt.end) })));
    }
    setImagePreviews([auction.image, ...(auction.images || [])].filter(Boolean) as string[]);
    setIsParkingSale(!!auction.isParkingSale);
    setParkingSaleStart(auction.isParkingSale && auction.startTime ? toLocalInput(auction.startTime) : "");
    setThresholdAmount(auction.thresholdAmount ? String(auction.thresholdAmount) : "");
  }, [auction]);

  useEffect(() => {
    if (typeof rulesData?.value === "string" && rulesData.value.trim()) setRules(rulesData.value);
  }, [rulesData]);

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", await compressImage(file));
    const { url } = await uploadImage(fd).unwrap();
    return url;
  };

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMainImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews([reader.result as string, ...imagePreviews.slice(1)]);
      reader.readAsDataURL(file);
    } else {
      setImagePreviews([...imagePreviews.slice(1)]);
    }
  };

  const handleAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...additionalImages, ...files].slice(0, 4);
    setAdditionalImages(newFiles);
    const previews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => {
          const updated = [...prev];
          if (updated.length <= 4) updated.push(reader.result as string);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const num = parseInt(rounds) || 1;
    setRoundTimes((prev) => {
      if (prev.length === num) return prev;
      return Array.from({ length: num }, (_, i) => prev[i] || { start: "", end: "" });
    });
  }, [rounds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const num = parseInt(rounds) || 1;
    const rtList = roundTimes.slice(0, num);
    if (!isParkingSale) {
      for (let i = 0; i < rtList.length; i++) {
        const rt = rtList[i];
        if (!rt.start || !rt.end) {
          setError(`Round ${i + 1}: Please set both start and end date & time`);
          setIsSubmitting(false);
          return;
        }
        const startMs = new Date(rt.start).getTime();
        const endMs = new Date(rt.end).getTime();
        if (isNaN(startMs) || isNaN(endMs)) {
          setError(`Round ${i + 1}: Invalid start or end date & time`);
          setIsSubmitting(false);
          return;
        }
        if (endMs <= startMs) {
          setError(`Round ${i + 1}: End date & time must be after the start date & time`);
          setIsSubmitting(false);
          return;
        }
        if (i > 0) {
          const prevEndMs = new Date(rtList[i - 1].end).getTime();
          if (startMs < prevEndMs + 60000) {
            setError(`Round ${i + 1}: Start must be at least 1 minute after the end of Round ${i}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
    }

    const startingOfferNum = startingOffer ? Number(startingOffer) : NaN;
    const regFeeNum = registrationFee ? Number(registrationFee) : 0;
    const unlockNum = offerUnlockFee ? Number(offerUnlockFee) : 0;

    if (!Number.isFinite(startingOfferNum) || startingOfferNum <= 0) {
      setError("Starting Offer must be a positive number");
      setIsSubmitting(false);
      return;
    }
    if (!Number.isInteger(startingOfferNum)) {
      setError("Starting Offer must be a whole number (no decimals)");
      setIsSubmitting(false);
      return;
    }
    if (!Number.isFinite(regFeeNum) || regFeeNum <= 0 || !Number.isInteger(regFeeNum)) {
      setError("Registration Fee must be a positive whole number (no decimals)");
      setIsSubmitting(false);
      return;
    }
    if (offerUnlockFee && (!Number.isFinite(unlockNum) || unlockNum <= 0 || !Number.isInteger(unlockNum))) {
      setError("Offer access fee must be a positive whole number (no decimals)");
      setIsSubmitting(false);
      return;
    }
    if (isParkingSale && thresholdAmount) {
      const thNum = Number(thresholdAmount);
      if (!Number.isFinite(thNum) || thNum <= 0 || !Number.isInteger(thNum)) {
        setError("Threshold Amount must be a positive whole number (no decimals)");
        setIsSubmitting(false);
        return;
      }
    }

    const existingMain = isEdit && !mainImage ? imagePreviews[0] : "";
    const existingImages = isEdit ? imagePreviews.slice(1).filter((p) => p && !p.startsWith("data:")) : [];

    let firstStart = roundTimes[0]?.start ? new Date(roundTimes[0].start) : new Date();
    let lastEnd = roundTimes[roundTimes.length - 1]?.end ? new Date(roundTimes[roundTimes.length - 1].end) : new Date();
    let roundsBody = parseInt(rounds) || 1;
    let roundTimesBody = roundTimes;

    if (isParkingSale) {
      const start = parkingSaleStart ? new Date(parkingSaleStart) : null;
      if (!start || isNaN(start.getTime())) {
        setError("Please set a start date & time for the parking sale");
        setIsSubmitting(false);
        return;
      }
      const end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
      firstStart = start;
      lastEnd = end;
      roundsBody = 1;
      roundTimesBody = [{ start: start.toISOString(), end: end.toISOString() }];
    }

    const body = {
      title: `${year} ${make} ${model}`,
      lotNumber,
      make,
      model,
      year: parseInt(year),
      variant,
      fuelType,
      transmission,
      mileage: parseInt(mileage),
      location,
      startingOffer: startingOfferNum,
      registrationFee: regFeeNum,
      offerUnlockFee: unlockNum,
      description,
      rules,
      ownership,
      insurance,
      color,
      rounds: roundsBody,
      roundTimes: roundTimesBody,
      startTime: firstStart.toISOString(),
      endTime: lastEnd.toISOString(),
      isParkingSale,
      thresholdAmount: isParkingSale && thresholdAmount ? Number(thresholdAmount) : undefined,
      image: mainImage ? await uploadFile(mainImage) : existingMain,
      images: isEdit
        ? [...existingImages, ...(await Promise.all(additionalImages.map(uploadFile)))]
        : await Promise.all(additionalImages.map(uploadFile)),
    };

    try {
      if (isEdit) {
        await updateAuction({ id: auctionId as string, body }).unwrap();
      } else {
        await createAuction(body).unwrap();
      }
      setIsSubmitting(false);
      setIsPublished(true);
      setTimeout(() => {
        router.push("/admin/auctions");
      }, 1500);
    } catch (err) {
      setError(errorMessage(err, "Failed to save auction"));
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <AuctionFormSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={isEdit ? `/admin/auctions/${auctionId}/details${fromQuery}` : "/admin/auctions"} className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors shrink-0">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back
          </Link>
          <h1 className="text-xl md:text-2xl font-extrabold text-primary">
            {isEdit ? "Edit Vehicle Auction" : "Create New Vehicle Auction"}
          </h1>
        </div>
      </div>

      {isEdit && auction?.status === "ENDED" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-amber-600">lock</span>
          This auction has completed and its date, time, and vehicle details cannot be modified.
        </div>
      )}

      {error && (
        <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-xs font-medium text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      {isPublished ? (
        <div className="bg-white p-12 rounded-2xl text-center space-y-3 border border-outline-variant/30">
          <span className="material-symbols-outlined text-5xl text-emerald-600">check_circle</span>
          <h2 className="text-xl font-extrabold text-on-surface">{isEdit ? "Auction Updated Successfully!" : "Auction Published Successfully!"}</h2>
          <p className="text-xs text-on-surface-variant">Redirecting to Auctions...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-xl">directions_car</span>
                <h2 className="text-sm font-extrabold text-on-surface">Vehicle Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Brand / Make <span className="text-error">*</span></label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="h-10 rounded-xl px-3 bg-white text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select Brand</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="BMW">BMW</option>
                    <option value="Audi">Audi</option>
                    <option value="Lamborghini">Lamborghini</option>
                    <option value="Ferrari">Ferrari</option>
                    <option value="Land Rover">Land Rover</option>
                    <option value="Mahindra">Mahindra</option>
                    <option value="Toyota">Toyota</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Model Name <span className="text-error">*</span></label>
                  <input
                    className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary"
                    placeholder="e.g. S-Class Maybach S680"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                  />
                </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant">Variant</label>
                    <input
                      className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary"
                      placeholder="e.g. 4x4 Automatic Dual Tone"
                      type="text"
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant">Lot Number</label>
                    <input
                      className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary disabled:bg-surface-container-low disabled:text-on-surface-variant"
                      placeholder="Auto-generated (LOT-1826)"
                      type="text"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      disabled={!isEdit}
                    />
                    {!isEdit && (
                      <p className="text-[10px] text-on-surface-variant">
                        Lot number is auto-generated with the current month and year on publish.
                      </p>
                    )}
                  </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Manufacturing Year <span className="text-error">*</span></label>
                  <input
                    className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary"
                    placeholder="YYYY"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Fuel Type <span className="text-error">*</span></label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="h-10 rounded-xl px-3 bg-white text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV (Electric)</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Transmission</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTransmission("Automatic")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        transmission === "Automatic"
                          ? "border-primary bg-primary/10 text-primary shadow-2xs"
                          : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      Automatic
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransmission("Manual")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        transmission === "Manual"
                          ? "border-primary bg-primary/10 text-primary shadow-2xs"
                          : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">KM Driven</label>
                  <input
                    className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary"
                    placeholder="e.g. 10000"
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Location</label>
                  <input
                    className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary"
                    placeholder="e.g. Gurugram, Haryana"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Number of Owners</label>
                  <input
                    className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary"
                    placeholder="e.g. 1"
                    type="number"
                    min="0"
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Insurance Valid Up To</label>
                  <input
                    className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary"
                    type="date"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant">Vehicle Colour</label>
                  <input
                    className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary"
                    placeholder="e.g. Obsidian Black"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>

              </div>

              <div className="border-t border-outline-variant/20 pt-4">
                <p className="text-xs font-extrabold text-on-surface mb-3">Vehicle Images</p>
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-1">
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer hover:border-primary transition-colors bg-primary/5">
                      {imagePreviews[0] ? (
                        <img src={imagePreviews[0]} alt="Main" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-2">
                          <span className="material-symbols-outlined text-primary text-lg">star</span>
                          <span className="text-[8px] font-bold text-primary text-center leading-tight">Main Image*</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
                    </label>
                  </div>
                  {Array.from({ length: 4 }, (_, i) => (
                    <div className="col-span-1" key={i}>
                      <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary transition-colors bg-white">
                        {imagePreviews[i + 1] ? (
                          <img src={imagePreviews[i + 1]} alt={`Additional ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 p-2">
                            <span className="material-symbols-outlined text-outline text-lg">add_photo_alternate</span>
                            <span className="text-[8px] font-bold text-outline text-center leading-tight">Photo {i + 1}</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          handleAdditionalImages(e);
                          e.target.value = "";
                        }} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant">Vehicle Description</label>
                <textarea
                  className="w-full rounded-xl p-3 text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                  placeholder="Highlight key features, history, and current condition..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-xl">local_parking</span>
                  <h2 className="text-sm font-extrabold text-on-surface">Sale Type</h2>
                </div>

                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-on-surface">Parking Sale</span>
                    <span className="text-[10px] font-medium text-on-surface-variant">Mark this auction as a parking sale vehicle</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isParkingSale}
                    onClick={() => setIsParkingSale((v) => !v)}
                    className={`w-11 h-6 rounded-full transition-colors shrink-0 ${isParkingSale ? "bg-primary" : "bg-outline-variant/60"}`}
                  >
                    <span className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isParkingSale ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </label>

                {isParkingSale && (
                  <div className="space-y-3.5 pt-3 border-t border-outline-variant/20">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant">Sale Start Date &amp; Time <span className="text-error">*</span></label>
                      <input
                        className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                        type="datetime-local"
                        value={parkingSaleStart}
                        onChange={(e) => setParkingSaleStart(e.target.value)}
                        required
                      />
                      <p className="text-[10px] text-on-surface-variant">
                        The sale goes live automatically at this time.
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant">Threshold Amount (₹)</label>
                      <input
                        className="h-10 rounded-xl px-3 text-xs font-bold text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                        type="number"
                        step={1}
                        min="1"
                        value={thresholdAmount}
                        onChange={(e) => setThresholdAmount(e.target.value)}
                        placeholder="Notify admin when a quote reaches this amount"
                      />
                      <p className="text-[10px] text-on-surface-variant">
                        Admins are notified every time a quote meets or exceeds this amount.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                  <h2 className="text-sm font-extrabold text-on-surface">Pricing</h2>
                </div>

                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant">Starting Offer (₹) <span className="text-error">*</span></label>
                    <input
                      className="w-full h-10 rounded-xl px-3 text-xs font-bold text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      type="number"
                      step={1}
                      value={startingOffer}
                      onChange={(e) => setStartingOffer(e.target.value)}
                      required
                      min="1"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant">Registration Fee for this Auction (₹) <span className="text-error">*</span></label>
                    <input
                      className="w-full h-10 rounded-xl px-3 text-xs font-bold text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      type="number"
                      step={1}
                      value={registrationFee}
                      onChange={(e) => setRegistrationFee(e.target.value)}
                      required
                      min="1"
                    />
                  </div>

                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-xl">description</span>
                  <h2 className="text-sm font-extrabold text-on-surface">Description &amp; Rules</h2>
                </div>

                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant">Special Auction Rules</label>
                    <textarea
                      className="w-full rounded-xl p-3 text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      placeholder="Enter terms specific to this vehicle auction..."
                      rows={2}
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {!isParkingSale && (
          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                  <h2 className="text-sm font-extrabold text-on-surface">Auction Schedule & Rounds</h2>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end max-w-xs">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-bold text-on-surface-variant">Number of Rounds <span className="text-error">*</span></label>
                    <input
                      className="h-10 rounded-xl px-3 text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      type="number"
                      min="1"
                      value={rounds}
                      onChange={(e) => setRounds(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-0 py-4">
                  {Array.from({ length: parseInt(rounds) || 1 }, (_, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="flex-1 h-0.5 bg-primary/30 min-w-8" />}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                          <span className="text-xs font-extrabold text-primary">{i + 1}</span>
                        </div>
                        <span className="text-[10px] font-bold text-on-surface-variant whitespace-nowrap">Round {i + 1}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roundTimes.map((rt, i) => (
                    <div key={i} className="border border-outline-variant/30 rounded-xl p-3 space-y-2">
                      <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Round {i + 1}</p>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-on-surface-variant">Start Date &amp; Time <span className="text-error">*</span></label>
                        <input
                          className="h-9 rounded-lg px-2.5 text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                          type="datetime-local"
                          value={rt.start}
                          onChange={(e) => {
                            const next = [...roundTimes];
                            next[i] = { ...next[i], start: e.target.value };
                            setRoundTimes(next);
                          }}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-on-surface-variant">End Date &amp; Time <span className="text-error">*</span></label>
                        <input
                          className="h-9 rounded-lg px-2.5 text-xs font-medium text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                          type="datetime-local"
                          value={rt.end}
                          onChange={(e) => {
                            const next = [...roundTimes];
                            next[i] = { ...next[i], end: e.target.value };
                            setRoundTimes(next);
                          }}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </section>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
            <p className="text-[11px] font-medium text-on-surface-variant">
              All fields marked with * are required.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(isEdit ? "/admin/auctions" : "/admin/dashboard")}
                className="px-4 py-2 text-error font-bold text-xs flex items-center gap-1 hover:bg-error/10 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Discard</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || (isEdit && auction?.status === "ENDED")}
                className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (isEdit ? "Saving..." : "Publishing...") : isEdit ? "Save Changes" : "Publish Auction Now"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
