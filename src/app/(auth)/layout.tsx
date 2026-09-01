import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <main className="flex-1 flex justify-center items-start px-4 md:px-8 py-12 bg-gradient-to-b from-surface-container-low/60 to-background min-h-screen">
        {children}
      </main>
    </div>
  );
}
