"use client";

import { type ReactNode, useEffect, useRef } from "react";

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type HeaderControllerProps = {
  children: ReactNode;
  className?: string;
};

export function HeaderController({ children, className }: HeaderControllerProps) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;

    if (!header) {
      return;
    }

    const productsRoot = header.querySelector<HTMLElement>("[data-products-root]");
    const productsTrigger = header.querySelector<HTMLButtonElement>("[data-products-trigger]");
    const productsPanel = header.querySelector<HTMLElement>("[data-products-panel]");
    const productsNavigationItems = header.querySelectorAll<HTMLElement>("[data-nav-products]");
    const mobileTrigger = header.querySelector<HTMLButtonElement>("[data-mobile-trigger]");
    const mobileTriggerLabel = header.querySelector<HTMLElement>(
      "[data-mobile-trigger-label]",
    );
    const mobilePanel = header.querySelector<HTMLElement>("[data-mobile-panel]");
    const mobileProductsTrigger = header.querySelector<HTMLButtonElement>(
      "[data-mobile-products-trigger]",
    );
    const mobileProductsPanel = header.querySelector<HTMLElement>(
      "[data-mobile-products-panel]",
    );

    if (
      !productsTrigger ||
      !productsPanel ||
      !mobileTrigger ||
      !mobileTriggerLabel ||
      !mobilePanel ||
      !mobileProductsTrigger ||
      !mobileProductsPanel
    ) {
      return;
    }

    const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

    header.querySelectorAll<HTMLAnchorElement>("[data-nav-link]").forEach((link) => {
      const linkPath = new URL(link.href).pathname.replace(/\/$/, "") || "/";

      const matchesSection = link.hasAttribute("data-nav-section") && currentPath.startsWith(`${linkPath}/`);

      if (linkPath === currentPath || matchesSection) {
        link.setAttribute("aria-current", "page");
      }
    });

    if (currentPath === "/products" || currentPath.startsWith("/products/")) {
      productsNavigationItems.forEach((item) => item.setAttribute("aria-current", "page"));
    }

    let scrollFrame = 0;
    let isScrolled = false;

    const updateScrollState = () => {
      scrollFrame = 0;
      const nextScrolled = window.scrollY > 16;

      if (nextScrolled !== isScrolled) {
        isScrolled = nextScrolled;
        header.toggleAttribute("data-scrolled", isScrolled);
      }
    };

    const handleScroll = () => {
      if (!scrollFrame) {
        scrollFrame = window.requestAnimationFrame(updateScrollState);
      }
    };

    const setProductsOpen = (open: boolean, restoreFocus = false) => {
      productsTrigger.setAttribute("aria-expanded", String(open));
      productsPanel.setAttribute("aria-hidden", String(!open));

      if (restoreFocus) {
        productsTrigger.focus();
      }
    };

    const setMobileProductsOpen = (open: boolean) => {
      mobileProductsTrigger.setAttribute("aria-expanded", String(open));
      mobileProductsPanel.setAttribute("aria-hidden", String(!open));
      mobileProductsPanel.toggleAttribute("inert", !open);
    };

    const setMobileOpen = (open: boolean, restoreFocus = false) => {
      header.toggleAttribute("data-menu-open", open);
      mobileTrigger.setAttribute("aria-expanded", String(open));
      mobileTrigger.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu",
      );
      mobileTriggerLabel.textContent = open ? "Close" : "Menu";
      mobilePanel.setAttribute("aria-hidden", String(!open));
      mobilePanel.toggleAttribute("inert", !open);

      if (open) {
        document.body.style.overflow = "hidden";
        mobilePanel.addEventListener("keydown", handleMobilePanelKeyDown);
        mobilePanel.querySelector<HTMLElement>(focusableSelector)?.focus();
      } else {
        document.body.style.overflow = "";
        mobilePanel.removeEventListener("keydown", handleMobilePanelKeyDown);
        setMobileProductsOpen(false);

        if (restoreFocus) {
          window.requestAnimationFrame(() => mobileTrigger.focus());
        }
      }
    };

    const handleMobilePanelKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false, true);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panelFocusable = Array.from(
        mobilePanel.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const first = panelFocusable.at(0);
      const last = panelFocusable.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        mobileTrigger.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        mobileTrigger.focus();
      }
    };

    const handleProductsTriggerClick = () => {
      setProductsOpen(productsTrigger.getAttribute("aria-expanded") !== "true");
    };

    const handleProductsTriggerKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && productsTrigger.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        setProductsOpen(false, true);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setProductsOpen(true);
        window.requestAnimationFrame(() => productsPanel.querySelector("a")?.focus());
      }
    };

    const handleProductsPanelKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setProductsOpen(false, true);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!productsRoot?.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    };

    const handleMobileTriggerClick = () => {
      const isOpen = mobileTrigger.getAttribute("aria-expanded") === "true";
      setMobileOpen(!isOpen, isOpen);
    };

    const handleMobileTriggerKeyDown = (event: KeyboardEvent) => {
      if (mobileTrigger.getAttribute("aria-expanded") !== "true") {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false, true);
      } else if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        const focusable = mobilePanel.querySelectorAll<HTMLElement>(focusableSelector);
        focusable.item(focusable.length - 1)?.focus();
      }
    };

    const handleMobileProductsClick = () => {
      setMobileProductsOpen(
        mobileProductsTrigger.getAttribute("aria-expanded") !== "true",
      );
    };

    const desktopMediaQuery = window.matchMedia("(min-width: 82.001rem)");

    const handleDesktopMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
      }
    };

    const handleMobileLinkClick = (event: Event) => {
      if ((event.target as Element).closest("a")) {
        setMobileOpen(false);
      }
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    desktopMediaQuery.addEventListener("change", handleDesktopMediaChange);
    document.addEventListener("pointerdown", handlePointerDown);
    productsTrigger.addEventListener("click", handleProductsTriggerClick);
    productsTrigger.addEventListener("keydown", handleProductsTriggerKeyDown);
    productsPanel.addEventListener("keydown", handleProductsPanelKeyDown);
    mobileTrigger.addEventListener("click", handleMobileTriggerClick);
    mobileTrigger.addEventListener("keydown", handleMobileTriggerKeyDown);
    mobileProductsTrigger.addEventListener("click", handleMobileProductsClick);
    mobilePanel.addEventListener("click", handleMobileLinkClick);

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", handleScroll);
      desktopMediaQuery.removeEventListener("change", handleDesktopMediaChange);
      document.removeEventListener("pointerdown", handlePointerDown);
      productsTrigger.removeEventListener("click", handleProductsTriggerClick);
      productsTrigger.removeEventListener("keydown", handleProductsTriggerKeyDown);
      productsPanel.removeEventListener("keydown", handleProductsPanelKeyDown);
      mobileTrigger.removeEventListener("click", handleMobileTriggerClick);
      mobileTrigger.removeEventListener("keydown", handleMobileTriggerKeyDown);
      mobileProductsTrigger.removeEventListener("click", handleMobileProductsClick);
      mobilePanel.removeEventListener("click", handleMobileLinkClick);
      mobilePanel.removeEventListener("keydown", handleMobilePanelKeyDown);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <header ref={headerRef} className={className}>
      {children}
    </header>
  );
}
