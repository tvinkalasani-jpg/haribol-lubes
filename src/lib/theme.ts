export const themeStorageKey = "haribol-theme";
export const themeModes = ["light", "dark"] as const;
export type ThemeMode = (typeof themeModes)[number];

export function normalizeThemeMode(value: unknown): ThemeMode {
  return typeof value === "string" && themeModes.includes(value as ThemeMode)
    ? (value as ThemeMode)
    : "light";
}

export const themeInitializationScript = `(()=>{const e=document.documentElement,k="${themeStorageKey}";let m="light";try{const v=localStorage.getItem(k);if(v==="dark")m="dark";else if(v!==null&&v!=="light")localStorage.setItem(k,"light")}catch{}e.dataset.theme=m;e.dataset.themePreference=m;e.style.colorScheme=m})()`;
