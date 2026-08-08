"use client";

import React, { useState } from "react";

interface ImageWithGalleryProps {
  src: string;
  alt: string;
  images?: string[];
  className?: string;
  overlayChildren?: React.ReactNode;
  score?: string;
  imgClassName?: string;
}

export function ImageWithGallery({
  src,
  alt,
  images,
  className,
  overlayChildren,
  score,
  imgClassName = "",
}: ImageWithGalleryProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState("");

  const allImages = (images && images.length > 0 ? images : src ? [src] : []);
  const photoCount = allImages.length;
  const wrapperClass = className || "w-full h-full";

  return (
    <>
      <div className={`relative overflow-hidden ${wrapperClass}`}>
        <img src={src} alt={alt} className={`w-full h-full object-cover ${imgClassName}`} />
        {overlayChildren}
        <button
          onClick={() => setShowGallery(true)}
          className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black/80 transition-all z-20"
        >
          <span className="material-symbols-outlined text-xs">photo_library</span>
          {photoCount > 0 ? `${photoCount} Photo${photoCount !== 1 ? "s" : ""}` : "View"}
        </button>
      </div>

      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-outline-variant/20">
              <h3 className="text-sm font-extrabold text-on-surface">All Photos</h3>
              <button
                onClick={() => setShowGallery(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {allImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden aspect-video bg-black/5 cursor-pointer"
                  onClick={() => setFullscreenImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`${alt} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {fullscreenImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setFullscreenImage("")}>
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={fullscreenImage} alt="Full screen" className="max-w-full max-h-[90vh] object-contain rounded-2xl" />
            <button
              onClick={() => setFullscreenImage("")}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
