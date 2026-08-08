import React from "react";

export default function LegalPrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Legal &amp; Privacy Disclaimer Policy</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">Last updated on Nov 23rd, 2025</p>
      </div>

      {/* ============================ LEGAL DISCLAIMER ============================ */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-primary">Legal Disclaimer</h2>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            VKS AUTO SERVICES is a vehicle verification and information provider platform. We are{" "}
            <span className="font-extrabold text-on-surface">NOT</span> an auction company and do not
            conduct bidding or online vehicle sales.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Our Role</h3>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>We collect and share verified vehicle information, including photos, documents, RC, insurance, service history, and owner-provided details.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>We help customers by providing buyer–seller coordination support.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>We do not buy or sell vehicles ourselves.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>We do not take commission or brokerage from buyers or sellers.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>We do not guarantee seller behaviour, vehicle availability, or final sale completion.</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Customer Responsibility</h3>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Customers must inspect the vehicle directly at the seller&apos;s location.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Customers must verify RC, insurance, chassis/engine numbers before payment.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>We are not responsible for any misunderstanding or issues between buyer and seller.</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Fee Policy</h3>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Registration fee is collected only for identity verification + vehicle information service.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>This fee is <span className="font-extrabold text-error">100% NON-REFUNDABLE</span>.</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Liability</h3>
          <p className="text-sm text-on-surface-variant">VKS Auto Services is not liable for:</p>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="text-red-500 font-bold shrink-0">✕</span>
              <span>Payment disputes between buyer and seller</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold shrink-0">✕</span>
              <span>Vehicle quality or damages</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold shrink-0">✕</span>
              <span>Incorrect documents or miscommunication</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold shrink-0">✕</span>
              <span>Fraud done by buyer or seller</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Contact</h3>
          <div className="text-sm text-on-surface-variant leading-relaxed">
            <p className="font-bold text-on-surface">M/S. VKS AUTO SERVICES.</p>
            <p>185/1A, Kodangi Thoppu Street,</p>
            <p>Thirupparankundram,</p>
            <p>Madurai - 625005.</p>
            <p className="mt-2">
              E-mail id:{" "}
              <a href="mailto:sales@vksautoservices.org" className="text-primary hover:underline">
                owner@vksautosettleeauctions.com
              </a>
            </p>
            <p>
              WhatsApp: <a href="tel:9003991351" className="text-primary hover:underline">9003991351</a>
            </p>
          </div>
        </section>
      </section>

      {/* ============================ PRIVACY POLICY ============================ */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-on-surface">Privacy Policy</h2>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            VKS Auto Services values your privacy and follows strict protection rules.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed mt-2">
            This privacy policy sets out how VKS AUTO SERVICES uses and protects any information that
            you give VKS AUTO SERVICES when you visit their website and/or agree to purchase from them.
            VKS AUTO SERVICES is committed to ensuring that your privacy is protected. Should we ask you
            to provide certain information by which you can be identified when using this website, you
            can be assured that it will only be used in accordance with this privacy statement.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            VKS AUTO SERVICES may change this policy from time to time by updating this page. You should
            check this page from time to time to ensure that you adhere to these changes.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Information We Collect</h3>
          <p className="text-sm text-on-surface-variant">We collect only what is needed:</p>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Full Name</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Mobile Number</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Email Address</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Address, City, Pincode</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Payment information processed securely through Razorpay</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Communication records with our support team</span>
            </li>
          </ul>
          <p className="text-sm text-on-surface-variant leading-relaxed pt-1">
            Other information relevant to customer surveys and/or offers may be collected where required.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Payment Information</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            All payments are processed securely through ONLINE PAYMENT. We do not store your:
          </p>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Debit/Credit card numbers</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>UPI PIN</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>CVV</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Banking passwords</span>
            </li>
          </ul>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            ONLINE PAYMENT handles all financial data with 256-bit encryption.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">How We Use Your Information</h3>
          <p className="text-sm text-on-surface-variant">Your data is used only for:</p>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Creating Customer ID</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Identity verification</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Delivering verified vehicle information</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Coordinating between buyer and seller</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Sending confirmation messages and service updates</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Legal compliance and fraud prevention</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Internal record keeping and improving our products and services</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Data Protection</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We store customer data in secure servers with restricted access. We follow strict protection
            as per the Indian IT Act (2000). In order to prevent unauthorised access or disclosure, we
            have put in place suitable measures.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Data Sharing</h3>
          <p className="text-sm text-on-surface-variant">We may share data only in the following cases:</p>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Government authorities (GST/Legal requirement)</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>ONLINE PAYMENT (Payment verification)</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>Court order or law enforcement</span>
            </li>
          </ul>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Other than these, data will never be shared. We will not sell, distribute or lease your
            personal information to third parties unless we have your permission or are required by law.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">How We Use Cookies</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            A cookie is a small file which asks permission to be placed on your computer&apos;s hard drive.
            Once you agree, the file is added and the cookie helps analyze web traffic or lets you know
            when you visit a particular site. Cookies allow web applications to respond to you as an
            individual, tailor its operations to your needs, likes and dislikes.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We use traffic log cookies to identify which pages are being used. This helps us analyze data
            about webpage traffic and improve our website. We only use this information for statistical
            analysis purposes and then the data is removed from the system. A cookie in no way gives us
            access to your computer or any information about you, other than the data you choose to share
            with us.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            You can choose to accept or decline cookies. Most web browsers automatically accept cookies,
            but you can usually modify your browser setting to decline cookies if you prefer. This may
            prevent you from taking full advantage of the website.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Controlling Your Personal Information</h3>
          <ul className="space-y-1.5 text-sm text-on-surface-variant leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>
                Whenever you are asked to fill in a form on the website, look for the box that you can
                click to indicate that you do not want the information to be used by anybody for direct
                marketing purposes.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
              <span>
                If you have previously agreed to us using your personal information for direct marketing
                purposes, you may change your mind at any time by writing to or emailing us.
              </span>
            </li>
          </ul>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            If you believe that any information we are holding on you is incorrect or incomplete, please
            write to KODANGI THOPPU STREET, THIRUPPARANKUNDRAM 625005, Thiruparankundram SO, Tamil Nadu
            625005. We will promptly correct any information found to be incorrect.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-sm font-extrabold text-on-surface">Updates &amp; Changes to This Policy</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We may update this policy anytime. Updates will be posted on this website.
          </p>
        </section>
      </section>

      <p className="text-xs text-on-surface-variant border-t border-outline-variant/30 pt-6">
        Disclaimer: The above content is created at VKS AUTO SERVICES&apos;s sole discretion.
      </p>
    </div>
  );
}