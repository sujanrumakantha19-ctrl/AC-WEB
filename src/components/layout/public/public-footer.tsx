import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/config/site";

export function PublicFooter() {
  return (
    <footer className="bg-surface-container-highest/60 border-t border-outline-variant/30 py-10 mt-auto text-on-surface">
      <div className="max-w-container-max mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-start justify-between gap-8">
        {/* Brand */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-7 w-7 object-contain" />
            <span className="text-base font-extrabold tracking-tight text-primary">VKS AUTOSERVICES</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs font-medium">
            Verified vehicle information and buyer–seller coordination support.
          </p>
          <p className="text-[11px] text-on-surface-variant font-medium">M/S. VKS AUTO SERVICES</p>
        </div>

        {/* Contact Details — horizontal */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-on-surface-variant font-medium">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Address</p>
            <p className="leading-relaxed max-w-[220px]">{SITE_CONFIG.contact.address}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Support</p>
            <a href={`mailto:${SITE_CONFIG.contact.email}`} className="hover:text-primary transition-colors">{SITE_CONFIG.contact.email}</a>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Call / WhatsApp</p>
            <p>
              <a href={`tel:${SITE_CONFIG.contact.phone}`} className="hover:text-primary transition-colors">{SITE_CONFIG.contact.phone}</a> / 9797177351
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">WhatsApp</p>
            <span>9003991351</span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Website</p>
            <a href="https://www.vksautoservices.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.vksautoservices.org</a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-container-max mx-auto px-4 md:px-8 mt-8 pt-4 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center text-[11px] text-on-surface-variant font-medium gap-2">
        <p>© {new Date().getFullYear()} VKS Auto Services. All rights reserved.</p>
        <div className="flex flex-wrap gap-3 md:gap-4">
          <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors">About Us</Link>
          <Link href="/terms" className="text-on-surface-variant hover:text-primary transition-colors">Terms &amp; Conditions</Link>
          <Link href="/legal-privacy" className="text-on-surface-variant hover:text-primary transition-colors">Legal &amp; Privacy</Link>
          <Link href="/delivery-policy" className="text-on-surface-variant hover:text-primary transition-colors">Delivery Policy</Link>
          <Link href="/refund-policy" className="text-on-surface-variant hover:text-primary transition-colors">Refund Policy</Link>
          <span className="text-on-surface-variant">Auction Rules</span>
        </div>
      </div>
    </footer>
  );
}