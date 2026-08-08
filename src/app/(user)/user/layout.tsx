import React from "react";
import { UserSidebar } from "@/components/layout/user/user-sidebar";
import { UserHeader } from "@/components/layout/user/user-header";
import { PublicFooter } from "@/components/layout/public/public-footer";

export default function UserAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* Fixed Left Sidebar (w-64) */}
      <UserSidebar />

      {/* Main Content Area pushed right by lg:ml-64 */}
      <div className="flex-1 lg:ml-64 bg-background min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Sticky Fixed Top Header */}
        <UserHeader />
        
        {/* Page Content with explicit top padding pt-24 lg:pt-24 px-5 lg:px-8 pb-8 for header clearance */}
        <main className="pt-24 lg:pt-24 px-5 lg:px-8 pb-8 max-w-container-max mx-auto space-y-6 flex-1 w-full overflow-x-hidden">
          {children}
        </main>
        
        <PublicFooter />
      </div>
    </div>
  );
}
