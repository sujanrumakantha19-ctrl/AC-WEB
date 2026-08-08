import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
      state.initialized = true;
    },
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.status = "unauthenticated";
      state.initialized = true;
    },
  },
});

export const { setUser, setAuthStatus, clearUser } = authSlice.actions;
export default authSlice.reducer;
