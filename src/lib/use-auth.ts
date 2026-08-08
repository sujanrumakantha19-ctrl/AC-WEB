"use client";

import { useCallback } from "react";
import { useLogoutMutation } from "@/services/auth-api";
import { useAppDispatch } from "@/redux/hooks";
import { clearUser } from "@/redux/slices/authSlice";

/**
 * Shared logout flow: calls the logout API, clears the Redux session
 * and redirects to the login screen. Used by headers and sidebars.
 */
export function useAuthLogout() {
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
    } catch {}
    dispatch(clearUser());
    window.location.replace("/login?loggedOut=1");
  }, [logout, dispatch]);

  return { handleLogout, loggingOut: isLoading };
}
