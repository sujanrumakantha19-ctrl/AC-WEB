import React from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

export const metadata = {
  title: "Refund Policy | VKS Autoservices",
  description: "Detailed refund terms, ₹499 base refund breakdown excluding non-refundable GST, eligibility criteria, and Razorpay verification workflow.",
};

const REFUND_ELIGIBILITY_RULES = [
  {
    title: "Top 50% Highest Offer Customers",
    body: "Only customers who placed an offer in the final round and ranked within the top 50% of highest offer submitters for that auction are evaluated for a deposit refund.",
  },
  {
    title: "1% Winning Offer Threshold",
    body: "Within the top 50% highest offer submitters, a refund is issued only if the customer's final round offer is at least 1% (≥ 1%) of the declared winning offer price.",
  },
  {
    title: "Unsold / Cancelled Auctions",
    body: "If an auction concludes without a declared winner or is cancelled by the platform, all paid participants are eligible for the base registration fee refund.",
  },
];

const NO_REFUND_RULES = [
  "The customer is declared the winning buyer of the auction.",
  "The customer's offer is outside the top 50% highest offer list or below the 1% threshold of the winning offer.",
  "The customer paid the registration fee but did not submit any valid offer during active offering rounds.",
  "The 18% GST portion (₹89) paid at registration, which is remitted to tax authorities.",
  "The customer provides false or incomplete registration details.",
];

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Refund Policy</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Aug 22nd, 2026</p>
      </div>

      {/* Breakdown Summary Banner */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">Registration Fee & Refund Amount Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white p-3.5 rounded-xl border border-outline-variant/20">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Initial Payment Paid</p>
            <p className="text-lg font-extrabold text-primary font-mono mt-0.5">₹588</p>
            <p className="text-[11px] text-on-surface-variant mt-1">₹499 Base + ₹89 GST (18%)</p>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Refundable Amount</p>
            <p className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">₹499</p>
            <p className="text-[11px] text-emerald-800 mt-1">Base Registration Fee</p>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Non-Refundable Portion</p>
            <p className="text-lg font-extrabold text-amber-700 font-mono mt-0.5">₹89</p>
            <p className="text-[11px] text-amber-800 mt-1">18% Statutory GST</p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed pt-2">
          The total payment for auction registration is <strong>₹588</strong> (comprising a <strong>₹499</strong> registration fee base + <strong>₹89</strong> 18% GST). When a customer becomes eligible for a refund under our rules, <strong>only the base registration fee of ₹499 will be refunded</strong>. The 18% GST amount of ₹89 is non-refundable as it is remitted directly to statutory tax authorities.
        </p>
      </section>

      {/* Eligibility Rules */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-on-surface">Refund Eligibility Criteria</h2>
        <div className="space-y-3">
          {REFUND_ELIGIBILITY_RULES.map((rule) => (
            <div key={rule.title} className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-1.5">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                {rule.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed pl-6">{rule.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Non-Refundable Conditions */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">Refund is NOT applicable when:</h2>
        <ul className="space-y-2">
          {NO_REFUND_RULES.map((item) => (
            <li key={item} className="flex gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-red-600 text-sm shrink-0">cancel</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Refund Workflow & Tracking */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">Refund Process & Timeline</h2>
        <div className="space-y-2.5 text-xs text-on-surface-variant leading-relaxed">
          <p>
            1. <strong>Initiation:</strong> When an auction completes, eligible accounts are identified and a Razorpay refund for <strong>₹499</strong> is automatically initiated. The status changes to <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Refund Initiated</span>.
          </p>
          <p>
            2. <strong>Verification:</strong> Our background system checks Razorpay settlement updates periodically until Razorpay confirms that the funds have been successfully credited.
          </p>
          <p>
            3. <strong>Confirmation:</strong> Once credited, the status is updated to <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">Refunded</span> and an automated confirmation receipt is emailed to your registered email address.
          </p>
          <p>
            4. <strong>Credit Timeline:</strong> Refunds typically reflect in your bank account or payment method within <strong>1–3 business days</strong> depending on your bank and Razorpay settlement cycles.
          </p>
        </div>
      </section>

      {/* Contact for Refund Queries */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Contact for Refund Queries</h2>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          For any questions regarding your refund status or registration payments, please contact our support team:
        </p>
        <div className="text-xs text-on-surface-variant space-y-1 font-medium pt-1">
          <p>Email: <a href={`mailto:${SITE_CONFIG.contact.email}`} className="text-primary hover:underline font-bold">{SITE_CONFIG.contact.email}</a></p>
          <p>Call Us: <a href={`tel:${SITE_CONFIG.contact.phone}`} className="text-primary hover:underline font-bold">{SITE_CONFIG.contact.phone}</a></p>
          <p>WhatsApp: <a href={`https://wa.me/91${SITE_CONFIG.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">95971 77351</a></p>
        </div>
      </section>

      <div className="text-center pt-2">
        <Link href="/auctions" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">arrow_back</span>
          Back to Auctions
        </Link>
      </div>
    </div>
  );
}