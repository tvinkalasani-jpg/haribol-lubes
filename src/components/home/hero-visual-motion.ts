const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const PRECISE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export function enhanceHeroVisual(targetId: string) {
  const visual = document.getElementById(targetId);
  if (!visual) return undefined;

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const precisePointer = window.matchMedia(PRECISE_POINTER_QUERY);
  let frame = 0;

  const resetTransform = () => {
    visual.style.setProperty("--hero-tilt-x", "0deg");
    visual.style.setProperty("--hero-tilt-y", "0deg");
    visual.style.setProperty("--hero-shift-x", "0px");
    visual.style.setProperty("--hero-shift-y", "0px");
    visual.style.setProperty("--hero-light-position", "52%");
  };

  const applyPointerPosition = (event: PointerEvent) => {
    const bounds = visual.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      visual.style.setProperty("--hero-tilt-x", `${(-y * 2.4).toFixed(2)}deg`);
      visual.style.setProperty("--hero-tilt-y", `${(x * 3.2).toFixed(2)}deg`);
      visual.style.setProperty("--hero-shift-x", `${(x * 7).toFixed(2)}px`);
      visual.style.setProperty("--hero-shift-y", `${(y * 5).toFixed(2)}px`);
      visual.style.setProperty(
        "--hero-light-position",
        `${(52 + x * 12).toFixed(1)}%`,
      );
    });
  };

  const syncCapability = () => {
    const motionAllowed = !reducedMotion.matches;
    const pointerAllowed = motionAllowed && precisePointer.matches;

    visual.dataset.motionPreference = motionAllowed ? "standard" : "reduced";
    visual.dataset.pointerResponse = pointerAllowed ? "enabled" : "disabled";

    if (pointerAllowed) {
      visual.addEventListener("pointermove", applyPointerPosition, {
        passive: true,
      });
      visual.addEventListener("pointerleave", resetTransform, { passive: true });
    } else {
      resetTransform();
    }
  };

  const clearPointerListeners = () => {
    visual.removeEventListener("pointermove", applyPointerPosition);
    visual.removeEventListener("pointerleave", resetTransform);
  };

  const handleCapabilityChange = () => {
    clearPointerListeners();
    syncCapability();
  };

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          ([entry]) => {
            visual.dataset.motionState = entry?.isIntersecting
              ? "active"
              : "paused";
          },
          { rootMargin: "120px", threshold: 0.05 },
        )
      : undefined;

  visual.dataset.enhanced = "true";
  syncCapability();
  observer?.observe(visual);
  reducedMotion.addEventListener("change", handleCapabilityChange);
  precisePointer.addEventListener("change", handleCapabilityChange);

  return () => {
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    clearPointerListeners();
    reducedMotion.removeEventListener("change", handleCapabilityChange);
    precisePointer.removeEventListener("change", handleCapabilityChange);
    delete visual.dataset.enhanced;
    delete visual.dataset.motionPreference;
    delete visual.dataset.motionState;
    delete visual.dataset.pointerResponse;
    resetTransform();
  };
}
