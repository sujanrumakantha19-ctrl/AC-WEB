import React from "react";

const NO_REFUND_IF = [
  "Customer changes mind",
  "Customer cannot visit seller",
  "Seller withdraws the car",
  "Customer provides wrong information",
];

const REFUND_APPLICABLE_IF = [
  {
    title: "Duplicate payment is made by mistake",
    detail: "",
  },
  {
    title: "Payment is deducted but service not delivered",
    detail: "In such cases refund will be processed within 7–14 working days.",
  },
];

const CANCELLATION_POINTS = [
  {
    title: "Cancellations",
    body:
      "Cancellations will be considered only if the request is made within Not Applicable of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.",
  },
  {
    title: "Perishable / Non-returnable items",
    body:
      "VKS AUTOSERVICES does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.",
  },
  {
    title: "Damaged or defective items",
    body:
      "In case of receipt of damaged or defective items, please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within Not applicable of receipt of the products.",
  },
  {
    title: "Product not as expected",
    body:
      "In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within Not applicable of receiving the product. The Customer Service Team, after looking into your complaint, will take an appropriate decision.",
  },
  {
    title: "Manufacturer warranty",
    body:
      "In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.",
  },
  {
    title: "Refund processing",
    body:
      "In case of any refunds approved by the VKS AUTOSERVICES, it will take Not applicable for the refund to be processed to the end customer.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Refund Policy</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Nov 23rd, 2025</p>
      </div>

      {/* Core rule */}
      <section className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Core Policy</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          All registration payments are{" "}
          <span className="font-extrabold text-error">NON-REFUNDABLE</span>.
        </p>
      </section>

      {/* No refund if */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">No refund will be issued if:</h2>
        <ul className="space-y-1.5">
          {NO_REFUND_IF.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-on-surface-variant">
              <span className="text-red-500 font-bold shrink-0">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Refund applicable if */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
        <h2 className="text-base font-extrabold text-on-surface">Refund is applicable only if:</h2>
        <ul className="space-y-1.5">
          {REFUND_APPLICABLE_IF.map((item) => (
            <li key={item.title} className="flex gap-2 text-sm text-on-surface-variant">
              <span className="text-emerald-600 font-bold shrink-0">✔</span>
              <span>
                {item.title}
                {item.detail && <span className="block text-xs mt-0.5">{item.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cancellation policy */}
      <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3">
        <h2 className="text-base font-extrabold text-on-surface">Cancellation &amp; Refund Policy</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          VKS AUTOSERVICES believes in helping its customers as far as possible and has therefore a
          liberal cancellation policy. Under this policy:
        </p>
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
        Disclaimer: The above content is created at VKS AUTOSERVICES&apos;s sole discretion.
      </p>
    </div>
  );
}