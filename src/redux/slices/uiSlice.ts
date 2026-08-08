import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface UIState {
  mobileMenuOpen: boolean;
  toasts: Toast[];
}

const initialState: UIState = {
  mobileMenuOpen: false,
  toasts: [],
};

let toastCounter = 0;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileMenu(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    pushToast(state, action: PayloadAction<{ type: ToastType; message: string }>) {
      const id = `toast-${++toastCounter}`;
      state.toasts.push({ id, type: action.payload.type, message: action.payload.message });
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { setMobileMenu, toggleMobileMenu, pushToast, dismissToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;
