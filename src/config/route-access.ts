export type UserRole = "public" | "user" | "admin";

export interface RoutePermissions {
  path: string;
  allowedRoles: UserRole[];
}

export const ROUTE_PERMISSIONS: RoutePermissions[] = [
  { path: "/", allowedRoles: ["public", "user", "admin"] },
  { path: "/auctions", allowedRoles: ["public", "user", "admin"] },
  { path: "/login", allowedRoles: ["public"] },
  { path: "/register", allowedRoles: ["public"] },
  { path: "/user", allowedRoles: ["user", "admin"] },
  { path: "/admin", allowedRoles: ["admin"] },
];
