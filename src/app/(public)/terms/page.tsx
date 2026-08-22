import React from "react";

const sections = [
  {
    title: "1. General Conditions",
    points: [
      "This service is operated by VKS AUTO SERVICES, Madurai, Tamil Nadu – 625005.",
      "By registering on this website, the customer agrees to all Terms & Conditions mentioned below.",
      "VKS AUTO SERVICES operates an online vehicle auction platform where registered and verified customers place offers on vehicles across scheduled auction rounds.",
      "We provide vehicle information, document verification, auction management, and buyer–seller coordination.",
    ],
  },
  {
    title: "2. Registration & Account",
    points: [
      "Customers must provide genuine, complete, and accurate details during registration, including name, mobile number, email, and address.",
      "A Customer ID is created on successful registration.",
      "Only registered and verified customers can participate in auctions and place offers.",
      "Fake details, wrong mobile numbers, or fraudulent activity will result in immediate account removal.",
    ],
  },
  {
    title: "3. Registration Fee",
    points: [
      "A Registration Fee of ₹499 + 18% GST (Total ₹588.82) per auction (as displayed on the auction listing) is charged to participate in that auction.",
      "This fee is payable through the online payment gateway before offers can be placed.",
      "The fee covers identity verification, access to verified vehicle details, and participation in the auction.",
      "Refunds, if any, are governed by the Refund Policy.",
    ],
  },
  {
    title: "4. Auctions & Offers",
    points: [
      "Auctions run in scheduled rounds with set start and end times.",
      "Customers place offers on vehicles during the active rounds.",
      "The highest valid offer at the close of the auction, subject to the auction rules, is considered the winning offer.",
      "Once placed, an offer is binding on the customer and cannot be withdrawn.",
      "Our platform does not itself buy or sell vehicles; the auction connects verified customers with vehicle owners.",
    ],
  },
  {
    title: "5. Winner & Payment",
    points: [
      "The customer who places the winning offer is declared the winner of the auction.",
      "The winner is required to complete the payment as per the auction terms through the online payment gateway.",
      "VKS Auto Services is not responsible for disputes between buyer and seller after the auction concludes.",
    ],
  },
  {
    title: "6. Refunds",
    points: [
      "Refunds are issued only in the circumstances described in the Refund Policy.",
      "All refunds are processed back to the original payment method within the timelines stated in the Refund Policy.",
    ],
  },
  {
    title: "7. Eligibility & Prohibited Conduct",
    points: [
      "Only registered customers can access verified vehicle information and place offers.",
      "Collusion, price manipulation, fake offers, or any attempt to interfere with the auction process is strictly prohibited.",
      "Cheating attempts, chargebacks, or fraudulent activity will lead to account termination and, if necessary, legal action.",
    ],
  },
  {
    title: "8. Vehicle Information",
    points: [
      "Vehicle details (model, documents, condition, history) are provided as received from the owner.",
      "We verify the information to the best of our ability but do not guarantee the accuracy of every detail.",
      "Customers must inspect the vehicle physically before completing any purchase payment.",
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
  "This service is operated by VKS AUTO SERVICES, Madurai, Tamil Nadu – 625005. VKS AUTO SERVICES operates an online vehicle auction platform and does not itself buy or sell vehicles.",
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Terms and Conditions</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Aug 19th, 2026</p>
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
          shall mean any natural or legal person who is visiting our website or has agreed to participate in an
          auction conducted through our website.
        </p>
        <p className="mt-3">
          Your use of the website or participation in our auctions are governed by the following Terms and
          Conditions.
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