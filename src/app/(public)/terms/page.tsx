import React from "react";

const sections = [
  {
    title: "1. General Conditions",
    points: [
      "This service is operated by VKS AUTO SERVICES, Madurai, Tamil Nadu – 625005.",
      "By registering, the customer agrees to all Terms & Conditions mentioned below.",
      "We only provide vehicle information, document verification, and buyer–seller coordination.",
      "We do not engage in vehicle sale, auction, or bidding.",
    ],
  },
  {
    title: "2. Registration Fees",
    points: [
      "Registration Fee: ₹499 + GST (₹588 total)",
      "This fee is strictly NON-REFUNDABLE under any circumstances.",
      "Fee is charged only for verification, access to verified vehicle details, and platform usage.",
    ],
  },
  {
    title: "3. Eligibility",
    points: [
      "Only registered customers can access verified vehicle information.",
      "Fake details, wrong mobile numbers, or fraudulent activity will result in immediate removal.",
    ],
  },
  {
    title: "4. Vehicle Information",
    points: [
      "Vehicle details (model, documents, condition, history) are provided as received from the owner.",
      "We do not guarantee the accuracy of every detail.",
      "Customers must verify the car physically before any payment.",
    ],
  },
  {
    title: "5. Buyer–Seller Process",
    points: [
      "We connect the verified customer to the seller.",
      "All final negotiation, payment, delivery must be done directly between buyer and seller.",
      "VKS Auto Services is not responsible for disputes between buyer and seller.",
    ],
  },
  {
    title: "6. Payments",
    points: [
      "All payments on this website are processed through the Online Payment Gateway.",
      "No advance or booking amount is collected by us for vehicle purchase.",
      "We only collect registration fees for verification access.",
    ],
  },
  {
    title: "7. Service Provided",
    points: [
      "We provide:",
      "Verified car details",
      "Owner-shared documents",
      "Buyer–seller coordination",
      "Customer support",
      "We do NOT:",
      "Buy or sell vehicles",
      "Involve in loan, insurance, or legal transfer",
      "Provide any guarantee about seller commitments",
    ],
  },
  {
    title: "8. Misuse",
    points: [
      "Fake details, cheating attempts, or chargebacks will lead to:",
      "Account termination",
      "Legal action if necessary",
    ],
  },
];

const additionalClauses = [
  "The content of the pages of this website is subject to change without notice.",
  "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.",
  "Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.",
  "Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.",
  "All trademarks reproduced on our website which are not the property of, or licensed to, the owner are acknowledged on the website.",
  "Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offence.",
  "From time to time, our website may also include links to other websites. These links are provided for your convenience to provide further information.",
  "You may not create a link to our website from another website or document without the prior written consent of VKS AUTO SERVICES.",
  "Any dispute arising out of the use of our website, purchase with us and/or any engagement with us is subject to the laws of India.",
  "We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.",
  "This service is operated by VKS AUTO SERVICES, Madurai, Tamil Nadu – 625005. We only provide vehicle information, document verification, and buyer–seller coordination. We do not engage in vehicle sale, auction, or bidding.",
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Terms and Conditions</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Nov 23rd, 2025</p>
      </div>

      {/* Definition */}
      <div className="text-sm text-on-surface-variant leading-relaxed">
        <p>
          For the purpose of these Terms and Conditions, the term{" "}
          <span className="font-semibold text-on-surface">&quot;we&quot; / &quot;us&quot; / &quot;our&quot;</span>{" "}
          used anywhere on this page shall mean{" "}
          <span className="font-semibold text-on-surface">VKS AUTO SERVICES</span>, whose registered/operational office
          is KODANGI THOPPU STREET, THIRUPPARANKUNDRAM, 625005, Thiruparankundram SO, Tamil Nadu 625005.{" "}
          <span className="font-semibold text-on-surface">&quot;you&quot; / &quot;your&quot; / &quot;user&quot;</span>{" "}
          shall mean any natural or legal person who is visiting our website or has agreed to purchase from us.
        </p>
        <p className="mt-3">
          Your use of the website or purchase from us are governed by the following Terms and Conditions.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.title} className="space-y-2">
            <h2 className="text-base font-extrabold text-on-surface">{s.title}</h2>
            <ul className="space-y-1.5">
              {s.points.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-on-surface-variant leading-relaxed">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Additional clauses */}
        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-primary">Additional Terms</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-on-surface-variant leading-relaxed">
            {additionalClauses.map((clause, i) => (
              <li key={i}>{clause}</li>
            ))}
          </ol>
        </section>
      </div>

      <p className="text-xs text-on-surface-variant border-t border-outline-variant/30 pt-6">
        Disclaimer: The above content is created at VKS AUTO SERVICES&apos;s sole discretion.
      </p>
    </div>
  );
}