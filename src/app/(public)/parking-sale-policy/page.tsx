import React from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

export const metadata = {
  title: "Parking Sale Policy | VKS Autoservices",
  description: "Terms and conditions governing Parking Sale transactions, zero buyer/seller fees, and loan assistance policies.",
};

const POLICIES = [
  {
    title: "1. Facilitator & Coordinator Role",
    body: "VKS Autoservices acts strictly as a coordinator and facilitator between the vehicle seller and the buyer for all Parking Sale transactions. We assist both parties in reaching a mutual agreement and coordinating the transaction smoothly.",
  },
  {
    title: "2. Zero Charges & Free Participation",
    body: "No registration fees, listing charges, or commission fees are collected from either the buyer or the seller for participating in or completing a Parking Sale. Quote submission and vehicle viewing are completely free of charge.",
  },
  {
    title: "3. Financing & Loan Assistance",
    body: "Our primary business benefit is derived through optional loan and financing facilitation when a buyer requires financial assistance. If a buyer needs financing to complete the purchase, our team helps arrange a vehicle loan quickly based on the buyer's financial profile and eligibility.",
  },
  {
    title: "4. Loan Terms & Approval Disclaimer",
    body: "All loan approvals, interest rates, tenure options, and eligible sanction amounts are determined solely by the partner banks or Non-Banking Financial Companies (NBFCs) according to their internal lending policies. VKS Autoservices does not guarantee loan approval or a specific loan amount/rate.",
  },
];

export default function ParkingSalePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
          <span className="material-symbols-outlined text-sm">local_parking</span>
          Parking Sale Policy
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Parking Sale Terms & Policy</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Aug 22nd, 2026</p>
      </div>

      {/* Core Summary */}
      <section className="bg-purple-50/80 rounded-2xl p-6 border border-purple-200 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-700">verified</span>
          Core Facilitation Policy
        </h2>
        <p className="text-sm text-purple-900 leading-relaxed">
          Parking Sale is a zero-fee vehicle coordination service offered by VKS Autoservices. Neither buyers nor sellers are charged any registration fees or platform charges. Our services are monetized primarily when buyers choose to opt for our expedited vehicle financing assistance.
        </p>
      </section>

      {/* Policy Sections */}
      <div className="space-y-4">
        {POLICIES.map((item) => (
          <section key={item.title} className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
            <h2 className="text-base font-extrabold text-on-surface">{item.title}</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">{item.body}</p>
          </section>
        ))}
      </div>

      {/* Support & Contact */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">Contact & Support</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          If you have questions about a Parking Sale vehicle or financing options, reach out to our team:
        </p>
        <div className="text-sm text-on-surface-variant space-y-1 font-medium">
          <p>Email: <a href={`mailto:${SITE_CONFIG.contact.email}`} className="text-primary hover:underline font-bold">{SITE_CONFIG.contact.email}</a></p>
          <p>Call Us: <a href={`tel:${SITE_CONFIG.contact.phone}`} className="text-primary hover:underline font-bold">{SITE_CONFIG.contact.phone}</a></p>
          <p>WhatsApp: <a href={`https://wa.me/91${SITE_CONFIG.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">95971 77351</a></p>
        </div>
      </section>

      <div className="text-center pt-4">
        <Link href="/auctions" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">arrow_back</span>
          Back to Auctions
        </Link>
      </div>
    </div>
  );
}
