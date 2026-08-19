import { redirect } from "next/navigation";

export default function PublicHomeRedirect() {
  redirect("/login");
}