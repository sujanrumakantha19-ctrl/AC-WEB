import React from "react";

const DO_NOT = [
  "Arrange transport",
  "Deliver vehicles",
  "Act as courier or logistics company",
];

export default function DeliveryPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Delivery Policy</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Nov 23rd, 2025</p>
      </div>

      {/* Intro */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Since this is a vehicle information service, no physical shipping is done.
        </p>
        <div className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
          <p className="font-bold text-on-surface">After Customer Registration:</p>
          <ul className="space-y-1.5">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Verified vehicle information will be shared digitally.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Physical vehicle inspection must be done by the customer.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Delivery of the car is the responsibility of the seller, not VKS Auto Services.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* What we DON'T do */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">We DO NOT</h2>
        <ul className="space-y-1.5">
          {DO_NOT.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-on-surface-variant">
              <span className="text-red-500 font-bold shrink-0">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Digital delivery timeline */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Digital Delivery Timeline</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Vehicle information is shared within <span className="font-bold text-on-surface">20–30 days</span> after verification.
        </p>
      </section>

      {/* General shipping & delivery */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">Shipping &amp; Delivery Policy</h2>
        <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
          <p>
            For International buyers, orders are shipped and delivered through registered international
            courier companies and/or International speed post only. For domestic buyers, orders are shipped
            through registered domestic courier companies and/or speed post only. Orders are shipped within
            16-30 days or as per the delivery date agreed at the time of order confirmation, and delivering
            of the shipment subject to Courier Company / post office norms.
          </p>
          <p>
            VKS AUTOSETTLE E AUCTIONS is not liable for any delay in delivery by the courier company / postal
            authorities and only guarantees to hand over the consignment to the courier company or postal
            authorities within 16-30 days from the date of the order and payment or as per the delivery date
            agreed at the time of order confirmation.
          </p>
          <p>Delivery of all orders will be to the address provided by the buyer.</p>
          <p>
            Delivery of our services will be confirmed on your mail ID as specified during registration.
          </p>
          <p>
            For any issues in utilizing our services you may contact our helpdesk on{" "}
            <a href="tel:9797177351" className="text-primary hover:underline font-bold">9597177351</a> or{" "}
            <a href="mailto:owner@vksautoserviceauctions.com" className="text-primary hover:underline font-bold">
              owner@vksautoserviceauctions.com
            </a>
          </p>
        </div>
      </section>

      <p className="text-xs text-on-surface-variant border-t border-outline-variant/30 pt-6">
        Disclaimer: The above content is created at VKS AUTOSETTLE E AUCTIONS&apos;s sole discretion.
      </p>
    </div>
  );
}