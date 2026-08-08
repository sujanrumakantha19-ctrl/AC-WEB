import { NavItem } from "./public-navigation";

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "All Auctions", href: "/admin/auctions", icon: "gavel", activePrefixes: ["/admin/auctions"] },
  { label: "Auction Room", href: "/admin/live", icon: "sensors", activePrefixes: ["/admin/live", "/admin/auctions/live"] },
  { label: "Completed Auctions", href: "/admin/auctions/completed", icon: "check_circle", activePrefixes: ["/admin/auctions/completed"] },
  { label: "Users", href: "/admin/users", icon: "group" },
  { label: "Reports", href: "/admin/reports", icon: "analytics" },
  { label: "Payment History", href: "/admin/payments", icon: "receipt" },
  { label: "WhatsApp Service", href: "/admin/whatsapp", icon: "chat_bubble" },
  { label: "My Profile", href: "/admin/profile", icon: "person" },
];
