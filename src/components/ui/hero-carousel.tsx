"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  image: string;
  title: string;
  subtitle?: string;
}

export function HeroCarousel({
  slides,
  interval = 4500,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [slides.length, interval]);

  const goTo = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);

  if (!slides.length) return null;

  return (
    <div className="group relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-md">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h3 className="text-white font-extrabold text-xl md:text-2xl drop-shadow-lg">
              {slide.title}
            </h3>
            {slide.subtitle && (
              <p className="text-white/85 text-sm mt-1.5 drop-shadow">{slide.subtitle}</p>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>

          <div className="absolute bottom-4 right-5 flex items-center gap-1.5">
            {slides.map((_, i) => (
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
    </div>
  );
}
