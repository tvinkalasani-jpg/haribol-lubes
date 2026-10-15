"use client";

import { useEffect } from "react";

type HeroVisualEnhancerProps = {
  targetId: string;
};

export function HeroVisualEnhancer({ targetId }: HeroVisualEnhancerProps) {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const loadEnhancer = () => {
      void import("./hero-visual-motion")
        .then(({ enhanceHeroVisual }) => {
          if (!cancelled) cleanup = enhanceHeroVisual(targetId);
        })
        .catch(() => {
          // The complete server-rendered fallback remains visible if enhancement fails.
        });
    };

    const supportsIdleCallback = "requestIdleCallback" in window;
    const idleHandle = supportsIdleCallback
      ? window.requestIdleCallback(loadEnhancer, { timeout: 1200 })
      : window.setTimeout(loadEnhancer, 350);

    return () => {
      cancelled = true;
      cleanup?.();

      if (supportsIdleCallback) {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle);
      }
    };
  }, [targetId]);

  return null;
}
