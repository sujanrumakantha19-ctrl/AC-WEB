import React from "react";

const REFUND_APPLICABLE_IF = [
  "The auction concludes without a winner — in such cases, eligible customers who paid the registration fee for that auction will automatically receive a refund.",
  "A winner is declared — eligible customers who placed offers but did not win may receive a refund as per the platform's policy.",
  "A duplicate payment is made by mistake.",
  "A payment is deducted but the service is not delivered.",
];

const NO_REFUND_IF = [
  "The customer is the declared winner of the auction.",
  "The customer changes their mind after participating.",
  "The customer does not follow the auction or payment process.",
  "The customer provides wrong or incomplete information.",
  "A refund has already been processed for the same payment.",
];

const CANCELLATION_POINTS = [
  {
    title: "Refund Processing",
    body:
      "Approved refunds are processed back to the original payment method used at the time of payment. Depending on the payment gateway and the customer's bank, it may take a few working days for the refund to reflect in the account.",
  },
  {
    title: "Duplicate or Failed Payments",
    body:
      "If a customer is charged twice for the same registration or the payment was deducted without the service being delivered, the duplicate or failed amount will be refunded automatically.",
  },
  {
    title: "Contact for Refund Queries",
    body:
      "For any refund-related queries, customers may contact our support team at owner@vksautoserviceauctions.com or call/WhatsApp us at 9003991351.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Refund Policy</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Aug 19th, 2026</p>
      </div>

      {/* Core rule */}
      <section className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Core Policy</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          A Registration Fee of ₹499 + 18% GST (Total ₹588.82) per auction is charged to participate in that auction.
          Only the base Registration Fee of ₹499 is refundable in the circumstances described below.
          GST charges are non-refundable. Refunds are always processed back to the original payment method.
        </p>
      </section>

      {/* Refund applicable if */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Refund is applicable when:</h2>
        <ul className="space-y-1.5">
          {REFUND_APPLICABLE_IF.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-on-surface-variant">
              <span className="text-emerald-600 font-bold shrink-0">✔</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* No refund if */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">No refund will be issued when:</h2>
        <ul className="space-y-1.5">
          {NO_REFUND_IF.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-on-surface-variant">
              <span className="text-red-500 font-bold shrink-0">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cancellation policy */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">Refund &amp; Processing Policy</h2>
        <div className="space-y-4">
          {CANCELLATION_POINTS.map((point) => (
            <div key={point.title} className="space-y-1">
              <h3 className="text-sm font-bold text-on-surface">{point.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-on-surface-variant border-t border-outline-variant/30 pt-6">
        Disclaimer: The above content is created at VKS AUTO SERVICES&apos;s sole discretion.
      </p>
    </div>
  );
}