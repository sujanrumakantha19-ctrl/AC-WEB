import React from "react";
import Link from "next/link";
import Image from "next/image";

export function AppFooter() {
  return (
    <footer className="bg-primary text-white pt-unit-xl pb-unit-lg border-t border-outline-variant/20 mt-auto">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-unit-xl">
        {/* Brand Summary */}
        <div className="space-y-unit-md">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white">VKS AUTOSERVICES</span>
          </div>
          <p className="text-body-md font-body-md text-white/70 max-w-sm">
            India&apos;s premier transparent automotive auction platform connecting certified dealers and discerning private buyers.
          </p>
          <div className="flex gap-3 text-white/60">
            <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors">verified_user</span>
            <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors">shield</span>
            <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors">support_agent</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-unit-sm">
          <h4 className="text-label-md font-label-md font-bold uppercase tracking-wider text-on-primary-container">
            Quick Links
          </h4>
          <ul className="space-y-2 text-body-md text-white/80">
            <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
            <li><Link href="/notice-board" className="hover:text-white transition-colors">Browse Auctions</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Buyer Dashboard</Link></li>
            <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-unit-sm">
          <h4 className="text-label-md font-label-md font-bold uppercase tracking-wider text-on-primary-container">
            Vehicle Types
          </h4>
          <ul className="space-y-2 text-body-md text-white/80">
            <li><span className="hover:text-white cursor-pointer">Luxury SUVs (Thar, Fortuner, Harrier)</span></li>
            <li><span className="hover:text-white cursor-pointer">Executive Sedans (BMW 3-Series, Audi A4)</span></li>
            <li><span className="hover:text-white cursor-pointer">Premium MPVs (Innova Hycross, Carnival)</span></li>
            <li><span className="hover:text-white cursor-pointer">EVs & Hybrids</span></li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div className="space-y-unit-sm">
          <h4 className="text-label-md font-label-md font-bold uppercase tracking-wider text-on-primary-container">
            Need Assistance?
          </h4>
          <p className="text-body-md text-white/80">24/7 Offering Hotline:</p>
          <p className="text-headline-md font-bold text-on-primary-container">+91 1800-200-BHARAT</p>
          <p className="text-label-sm text-white/60">support@bharatauctions.com</p>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop mt-unit-xl pt-unit-md border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-label-sm text-white/50 gap-4">
        <p>© {new Date().getFullYear()} VKS Autoservices. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <Link href="/terms" className="hover:underline cursor-pointer">Terms of Service</Link>
          <span className="hover:underline cursor-pointer">KYC Guidelines</span>
        </div>
      </div>
    </footer>
  );
}
