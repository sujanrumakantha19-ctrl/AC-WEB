import { NavItem } from "./public-navigation";

export const USER_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/user/dashboard", icon: "dashboard" },
  { label: "All Auctions", href: "/user/auctions", icon: "gavel" },
  { label: "My Profile", href: "/user/profile", icon: "person" },
  { label: "Notifications", href: "/user/notifications", icon: "notifications", badge: "3" },
  { label: "Purchase History", href: "/user/purchases", icon: "history" },
];
