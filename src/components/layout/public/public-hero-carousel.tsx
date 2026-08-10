"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    image: "/uploads/auction-9.jpg",
    alt: "Mahindra Thar and Tata Harrier",
  },
  {
    image: "/uploads/auction-4.jpg",
    alt: "Premium SUV showcase",
  },
  {
    image: "/uploads/auction-6.jpg",
    alt: "Luxury sedan showcase",
  },
  {
    image: "/uploads/auction-7.jpg",
    alt: "Executive vehicle showcase",
  },
  {
    image: "/uploads/auction-10.jpg",
    alt: "Premium automotive lot",
  },
];

export function PublicHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) =>
    setIndex(((i % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <section className="group relative min-h-[380px] md:min-h-[460px] w-full overflow-hidden flex items-center py-6 sm:py-8 md:py-10">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-primary/95 via-primary/90 to-primary/75 md:from-primary/95 md:via-primary/85 md:to-primary/40 z-10" />
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              className="w-full h-full object-cover object-center"
              src={slide.image}
              alt={slide.alt}
              priority={i === 0}
              fill
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {HERO_SLIDES.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>

          <div className="absolute z-30 bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === index ? "w-7 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}

      <div className="relative z-20 max-w-container-max mx-auto px-4 md:px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-3 sm:space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md">
            Premium Automotive Marketplace
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Your Gateway to <br />
            <span className="text-on-primary-container">Luxury Road Icons</span>
          </h1>

          <p className="text-xs md:text-sm text-white/90 max-w-md leading-relaxed">
            Experience the thrill of acquiring premium SUVs, luxury sedans, and executive
            vehicles through India&apos;s most trusted offering platform.
          </p>

          <div className="pt-1">
            <Link href="/login?redirect=/auctions">
              <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white hover:bg-white/90 text-primary font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95">
                Explore Auctions
              </button>
            </Link>
          </div>
        </div>

        <div className="self-end pt-2 md:pt-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 p-2 sm:p-3 bg-white/10 sm:bg-white backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-none rounded-xl text-white sm:text-on-surface shadow-xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 sm:bg-primary-container/10 flex items-center justify-center text-white sm:text-primary-container shrink-0">
                <span className="material-symbols-outlined text-sm sm:text-base">gavel</span>
              </div>
              <div>
                <p className="text-xs sm:text-lg font-extrabold text-white sm:text-primary leading-tight">2,500+</p>
                <p className="text-[9px] sm:text-[10px] text-white/80 sm:text-on-surface-variant font-medium leading-tight">Auctions</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 p-2 sm:p-3 bg-white/10 sm:bg-white backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-none rounded-xl text-white sm:text-on-surface shadow-xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 sm:bg-primary-container/10 flex items-center justify-center text-white sm:text-primary-container shrink-0">
                <span className="material-symbols-outlined text-sm sm:text-base">payments</span>
              </div>
              <div>
                <p className="text-xs sm:text-lg font-extrabold text-white sm:text-primary leading-tight">₹450 Cr+</p>
                <p className="text-[9px] sm:text-[10px] text-white/80 sm:text-on-surface-variant font-medium leading-tight">Volume</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 p-2 sm:p-3 bg-white/10 sm:bg-white backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-none rounded-xl text-white sm:text-on-surface shadow-xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 sm:bg-primary-container/10 flex items-center justify-center text-white sm:text-primary-container shrink-0">
                <span className="material-symbols-outlined text-sm sm:text-base">verified_user</span>
              </div>
              <div>
                <p className="text-xs sm:text-lg font-extrabold text-white sm:text-primary leading-tight">99.8%</p>
                <p className="text-[9px] sm:text-[10px] text-white/80 sm:text-on-surface-variant font-medium leading-tight">Inspection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}