import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export default async function AdminSubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
    redirect("/login?error=" + encodeURIComponent("Admin access required"));
  }

  return <>{children}</>;
}
