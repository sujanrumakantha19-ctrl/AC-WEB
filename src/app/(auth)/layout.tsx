import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (payload) {
    if (payload.role === "admin" || payload.role === "superadmin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/user/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <main className="flex-1 flex justify-center items-start px-4 md:px-8 py-12 bg-gradient-to-b from-surface-container-low/60 to-background min-h-screen">
        {children}
      </main>
    </div>
  );
}
