import React from "react";
import { formatINR } from "@/lib/utils";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";

export default function UserPurchasesPage() {
  const purchases = [
    {
      id: "PUR-2026-091",
      vehicle: "2023 Mahindra Thar LX Hard Top Diesel AT",
      winningOffer: 1485000,
      lotNumber: "LOT-BH-8842",
      date: "Jul 28, 2026",
      status: "PAYMENT PENDING",
      isPending: true,
      delivery: "Hub Dispatch Ready (Gurgaon)",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAV602PWWdVt8hOSpPgFIzqBTX44V_W-cxQns2i3xfUPXyfjgXTkxrAy5jDKdAWB1EdyE-UX9UwHF-w9UEAL8_Jwg0Hb70tDaRm2Rb2nBeIAqcj1mET4laGkYEq5lEKQaUqiUbC792dk95GF_uZFolXYuBXwChRz9cfnoPSNXrHUT4ipexfXibOS2-e8wxh1EdJutdSiNpSkFiRfYoYVizjYvSGRq_eUW95pZPJ2KtXNJd9qdc2zOcWz8lxM6XX0MWecF25CEbbPIG5",
      images: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
      ],
    },
    {
      id: "PUR-2026-042",
      vehicle: "2023 Audi Q5 45 TFSI Quattro Technology",
      winningOffer: 4890000,
      lotNumber: "LOT-BH-4011",
      date: "May 14, 2026",
      status: "DELIVERED & RC TRANSFERRED",
      isPending: false,
      delivery: "Delivered to Gurugram Residence",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1200",
      images: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf8?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-on-surface">My Purchase History</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Track won auctions, view invoices, download inspection certificates, and follow RC transfer status.
        </p>
      </div>

      <div className="space-y-4">
        {purchases.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
          >
            <div className="flex items-center gap-4">
              <ImageWithGallery
                src={item.image}
                alt={item.vehicle}
                images={item.images}
                className="w-28 h-20 rounded-xl"
              />
              <div>
                <div className="mb-1">
                  <span className="text-[10px] font-bold text-primary-container font-mono">{item.id}</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">{item.vehicle}</h3>
                <p className="text-[11px] text-outline mt-0.5">{item.lotNumber} • Won on {item.date}</p>
                <p className="text-[11px] text-on-surface-variant mt-1 font-medium">📍 {item.delivery}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-outline-variant/20">
              <div className="text-left lg:text-right">
                <p className="text-[10px] text-outline uppercase tracking-wider font-bold">Winning Hammer Price</p>
                <p className="text-base font-extrabold text-primary">{formatINR(item.winningOffer)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
