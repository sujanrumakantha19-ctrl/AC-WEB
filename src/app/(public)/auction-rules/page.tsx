import React from "react";

const HOW_IT_WORKS = [
  {
    title: "Register on the platform",
    body: "Create an account with your genuine name, mobile number, email, and address. A Customer ID is generated on successful registration.",
  },
  {
    title: "Pay the registration fee",
    body: "Pay the Registration Fee (₹599 per auction, as displayed on the listing) through the online payment gateway to participate in that auction.",
  },
  {
    title: "Place offers across rounds",
    body: "Each auction runs in scheduled rounds. During the active rounds, you can place offers on the vehicle. The offer must meet the minimum offer increment set for the auction.",
  },
  {
    title: "Winner declaration",
    body: "At the close of the auction, the highest valid offer is declared the winning offer, and that customer becomes the winner of the auction.",
  },
];

const OFFER_RULES = [
  "Offers can be placed only during the active round of an auction.",
  "Each offer must be higher than the current highest offer by at least the minimum offer increment for that auction.",
  "Once placed, an offer is binding and cannot be withdrawn.",
  "Offers are placed in rupees and must be whole amounts.",
  "The highest valid offer at the end of the final round wins the auction.",
  "Collusion, price manipulation, fake offers, or any interference with the auction process is strictly prohibited.",
];

const FEES = [
  {
    title: "Registration Fee",
    body: "₹599 per auction (as displayed on the listing). Paid once per auction to participate. Refundable only as described in the Refund Policy.",
  },
  {
    title: "Offer Access Fee",
    body: "Where applicable, an offer access fee may be charged to unlock the ability to place offers in a specific auction. This is shown on the auction listing.",
  },
  {
    title: "Winner Payment",
    body: "The winner is required to complete the payment for the vehicle as per the auction terms through the online payment gateway.",
  },
];

export default function AuctionRulesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Auction Rules</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Aug 19th, 2026</p>
      </div>

      {/* How it works */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">How an Auction Works</h2>
        <div className="space-y-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-extrabold text-primary">{i + 1}</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-on-surface">{step.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Offer rules */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Offer Rules</h2>
        <ul className="space-y-1.5">
          {OFFER_RULES.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-on-surface-variant">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Fees */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">Fees &amp; Payments</h2>
        <div className="space-y-3">
          {FEES.map((fee) => (
            <div key={fee.title} className="space-y-0.5">
              <h3 className="text-sm font-bold text-on-surface">{fee.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{fee.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Refunds */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Refunds</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Refunds, if any, are issued in the circumstances described in the{" "}
          <a href="/refund-policy" className="text-primary hover:underline font-bold">Refund Policy</a>.
        </p>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Contact</h2>
        <div className="text-sm text-on-surface-variant leading-relaxed">
          <p>M/S. VKS AUTO SERVICES</p>
          <p>98/13, Kodangi Thoppu Street, Thirupparankundram, Madurai - 625005.</p>
          <p className="mt-2">
            E-mail:{" "}
            <a href="mailto:owner@vksautoserviceauctions.com" className="text-primary hover:underline">
              owner@vksautoserviceauctions.com
            </a>
          </p>
          <p>
            Call / WhatsApp:{" "}
            <a href="tel:9003991351" className="text-primary hover:underline">9003991351</a>
          </p>
        </div>
      </section>

      <p className="text-xs text-on-surface-variant border-t border-outline-variant/30 pt-6">
        Disclaimer: The above content is created at VKS AUTO SERVICES&apos;s sole discretion.
      </p>
    </div>
  );
}