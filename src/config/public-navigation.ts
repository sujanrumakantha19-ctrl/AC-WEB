export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  activePrefixes?: string[];
}

export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Browse Auctions", href: "/login?redirect=/auctions" },
  { label: "About Us", href: "/#about" },
  { label: "Contact Us", href: "/#contact" },
];
