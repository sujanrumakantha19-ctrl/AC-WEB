import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

export interface ThemeState {
  mode: ThemeMode;
  fontScale: number;
}

const STORAGE_KEY = "vks-theme";
const SCALE_KEY = "vks-font-scale";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / privacy errors */
  }
}

function getInitialMode(): ThemeMode {
  const stored = readStorage(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function getInitialScale(): number {
  const stored = readStorage(SCALE_KEY);
  const parsed = stored ? parseFloat(stored) : NaN;
  return !isNaN(parsed) && parsed >= 0.8 && parsed <= 1.2 ? parsed : 1;
}

const initialState: ThemeState = {
  mode: getInitialMode(),
  fontScale: getInitialScale(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      writeStorage(STORAGE_KEY, action.payload);
    },
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      writeStorage(STORAGE_KEY, state.mode);
    },
    setFontScale(state, action: PayloadAction<number>) {
      state.fontScale = action.payload;
      writeStorage(SCALE_KEY, String(action.payload));
    },
  },
});

export const { setThemeMode, toggleTheme, setFontScale } = themeSlice.actions;
export default themeSlice.reducer;
