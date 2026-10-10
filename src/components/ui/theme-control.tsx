"use client";

import { useEffect, useId, useRef, useState } from "react";

import { normalizeThemeMode, resolveTheme, themeModes, themeStorageKey, type ThemeMode } from "@/lib/theme";

import styles from "./theme-control.module.css";

const labels: Record<ThemeMode, string> = { system: "System", light: "Light", dark: "Dark" };

function applyDocumentTheme(mode: ThemeMode, prefersDark: boolean) {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(mode, prefersDark);
  root.dataset.themePreference = mode;
  root.style.colorScheme = root.dataset.theme;
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (mode === "dark") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 15.2A8 8 0 0 1 8.8 4 8 8 0 1 0 20 15.2Z" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="1.5" /><path d="M9 21h6M12 17v4" /></svg>;
}

export function ThemeControl({ placement }: { placement: "desktop" | "mobile" }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (nextMode: ThemeMode, persist = false) => {
      applyDocumentTheme(nextMode, media.matches);
      setMode(nextMode);
      if (persist) {
        try { window.localStorage.setItem(themeStorageKey, nextMode); } catch { /* Functional preference storage may be unavailable. */ }
        window.dispatchEvent(new CustomEvent("haribol-theme-change", { detail: nextMode }));
      }
    };
    apply(normalizeThemeMode(root.dataset.themePreference));
    const handleMedia = () => { if ((root.dataset.themePreference ?? "system") === "system") apply("system"); };
    const handleTheme = (event: Event) => apply(normalizeThemeMode((event as CustomEvent<unknown>).detail));
    media.addEventListener("change", handleMedia);
    window.addEventListener("haribol-theme-change", handleTheme);
    return () => { media.removeEventListener("change", handleMedia); window.removeEventListener("haribol-theme-change", handleTheme); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent | PointerEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
      else if (event instanceof PointerEvent && !rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", close); };
  }, [open]);

  const choose = (nextMode: ThemeMode) => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    applyDocumentTheme(nextMode, media.matches);
    try { window.localStorage.setItem(themeStorageKey, nextMode); } catch { /* Functional preference storage may be unavailable. */ }
    setMode(nextMode); setOpen(false); window.dispatchEvent(new CustomEvent("haribol-theme-change", { detail: nextMode }));
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return <div className={styles.root} data-placement={placement} ref={rootRef}>
    <button aria-controls={id} aria-expanded={open} aria-haspopup="menu" aria-label={`Theme: ${labels[mode]}`} className={styles.trigger} onClick={() => setOpen((value) => !value)} ref={triggerRef} type="button"><ThemeIcon mode={mode} /><span>{labels[mode]}</span></button>
    <div aria-label="Choose website theme" className={styles.menu} hidden={!open} id={id} role="menu">
      {themeModes.map((option) => <button aria-checked={mode === option} key={option} onClick={() => choose(option)} role="menuitemradio" type="button"><ThemeIcon mode={option} /><span>{labels[option]}</span><i aria-hidden="true" /></button>)}
    </div>
  </div>;
}
