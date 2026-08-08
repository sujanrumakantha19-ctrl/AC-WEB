import { redirect } from "next/navigation";

export default function LegacyDashboardRedirect() {
  redirect("/user/dashboard");
}
