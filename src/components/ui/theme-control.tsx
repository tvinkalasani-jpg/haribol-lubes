"use client";

import { useEffect, useState } from "react";

import { normalizeThemeMode, themeModes, themeStorageKey, type ThemeMode } from "@/lib/theme";

import styles from "./theme-control.module.css";

const labels: Record<ThemeMode, string> = { light: "Light", dark: "Dark" };

function applyDocumentTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.dataset.themePreference = mode;
  root.style.colorScheme = mode;
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (mode === "dark") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 15.2A8 8 0 0 1 8.8 4 8 8 0 1 0 20 15.2Z" /></svg>;
  return null;
}

export function ThemeControl({ placement }: { placement: "desktop" | "mobile" }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const root = document.documentElement;
    const apply = (nextMode: ThemeMode) => {
      applyDocumentTheme(nextMode);
      setMode(nextMode);
    };
    apply(normalizeThemeMode(root.dataset.themePreference));
    const handleTheme = (event: Event) => apply(normalizeThemeMode((event as CustomEvent<unknown>).detail));
    window.addEventListener("haribol-theme-change", handleTheme);
    return () => window.removeEventListener("haribol-theme-change", handleTheme);
  }, []);

  const choose = (nextMode: ThemeMode) => {
    applyDocumentTheme(nextMode);
    try { window.localStorage.setItem(themeStorageKey, nextMode); } catch { /* Functional preference storage may be unavailable. */ }
    setMode(nextMode);
    window.dispatchEvent(new CustomEvent("haribol-theme-change", { detail: nextMode }));
  };

  return <div aria-label="Website appearance" className={styles.root} data-placement={placement} role="group">
    <span className={styles.label}>Theme</span>
    <div className={styles.options}>
      {themeModes.map((option) => <button aria-pressed={mode === option} key={option} onClick={() => choose(option)} type="button"><ThemeIcon mode={option} /><span>{labels[option]}</span><i aria-hidden="true">✓</i></button>)}
    </div>
  </div>;
}
