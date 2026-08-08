import React from "react";
import { PublicHeader } from "@/components/layout/public/public-header";
import { PublicFooter } from "@/components/layout/public/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <PublicHeader />
      <main className="pt-20 flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
