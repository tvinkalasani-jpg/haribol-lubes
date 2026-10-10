export const themeStorageKey = "haribol-theme";
export const themeModes = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof themeModes)[number];
export type ResolvedTheme = Exclude<ThemeMode, "system">;

export function normalizeThemeMode(value: unknown): ThemeMode {
  return typeof value === "string" && themeModes.includes(value as ThemeMode)
    ? (value as ThemeMode)
    : "system";
}

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  return mode === "system" ? (prefersDark ? "dark" : "light") : mode;
}

export const themeInitializationScript = `(()=>{const e=document.documentElement,k="${themeStorageKey}";let m="system";try{const v=localStorage.getItem(k);if(v==="light"||v==="dark"||v==="system")m=v}catch{}const d=m==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;e.dataset.theme=d;e.dataset.themePreference=m})()`;
