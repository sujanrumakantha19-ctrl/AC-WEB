import React from "react";

const WHAT_WE_DO = [
  "Verify vehicle documents",
  "Share genuine car details",
  "Ensure transparency",
  "Assist buyers with seller coordination",
];

const WHY_CHOOSE_US = [
  "Verified Information",
  "Professional Support",
  "Transparency",
  "No Hidden Charges",
  "Fast Response",
];

export default function AboutUsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">About Us</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          VKS Auto Services — trust, safety, and clarity for the used car buying experience.
        </p>
      </div>

      {/* Intro */}
      <div className="text-sm text-on-surface-variant leading-relaxed">
        <p>
          VKS Auto Services is a trusted platform offering verified vehicle information and customer
          support services for buyers who want transparency before visiting a seller.
        </p>
      </div>

      {/* Vision */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-xl text-primary">visibility</span>
            <h2 className="text-base font-extrabold text-on-surface">Our Vision</h2>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            To bring trust, safety, and clarity to the used car buying experience.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-xl text-primary">fact_check</span>
            <h2 className="text-base font-extrabold text-on-surface">What We Do</h2>
          </div>
          <ul className="space-y-1.5">
            {WHAT_WE_DO.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-on-surface-variant">
                <span className="text-primary font-bold shrink-0">✔</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Business Details */}
      <section className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">M/S. VKS AUTO SERVICES</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Address</p>
            <p className="text-on-surface-variant leading-relaxed">
              98/13, Kodangi Thoppu Street,
              <br />
              Thirupparankundram,
              <br />
              Madurai - 625005.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">E-mail id</p>
              <a href="mailto:owner@vksautosettleeauctions.com" className="text-primary hover:underline">
                owner@vksautosettleeauctions.com
              </a>
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">WhatsApp Number</p>
              <a href="https://wa.me/919597177351" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
                95971 77351
              </a>
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Call Contact</p>
              <a href="tel:9003991351" className="text-primary hover:underline font-bold">
                9003991351
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* Why Choose Us */}
      <section className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-xs">
        <h2 className="text-base font-extrabold text-on-surface mb-3">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item} className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
              <span className="text-xs font-bold text-on-surface">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}