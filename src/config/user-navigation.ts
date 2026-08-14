import { NavItem } from "./public-navigation";

export const USER_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/user/dashboard", icon: "dashboard" },
  { label: "All Auctions", href: "/user/auctions", icon: "gavel" },
  { label: "My Profile", href: "/user/profile", icon: "person" },
  { label: "Notifications", href: "/user/notifications", icon: "notifications", badge: "3" },
  { label: "My Auctions", href: "/user/my-auctions", icon: "history", activePrefixes: ["/user/my-auctions"] },
  { label: "Purchase History", href: "/user/purchases", icon: "receipt" },
  { label: "Payment History", href: "/user/payments", icon: "payments" },
];
