"use client";

import { useCallback } from "react";
import { useLogoutMutation } from "@/services/auth-api";
import { useAppDispatch } from "@/redux/hooks";
import { clearUser } from "@/redux/slices/authSlice";

/**
 * Shared logout flow: calls the logout API, clears the Redux session & RTK query caches,
 * erases browser navigation histories, and redirects to the login screen.
 */
export function useAuthLogout() {
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
    } catch {}

    // 1. Clear Redux session
    dispatch(clearUser());

    // 2. Clear client storage & caches
    try {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
      }
    } catch {}

    // 3. Erase browser history entries so pressing 'Back' will not return to dashboard
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/login?loggedOut=1");
      window.history.replaceState(null, "", "/login?loggedOut=1");
      window.location.replace("/login?loggedOut=1");
    }
  }, [logout, dispatch]);

  return { handleLogout, loggingOut: isLoading };
}
