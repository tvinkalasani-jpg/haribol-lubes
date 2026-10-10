import { siteConfig } from "@/config/site";
import { primaryNavigation, productNavigation } from "@/data/site-navigation";

import buttonStyles from "../ui/button.module.css";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
} from "../ui/icons";
import { PageContainer } from "../ui/page-container";
import { ThemeControl } from "../ui/theme-control";
import { HeaderController } from "./header-controller";
import styles from "./site-header.module.css";

const productsMenuId = "desktop-products-menu";
const mobileMenuId = "mobile-navigation-menu";
const mobileProductsId = "mobile-products-menu";

export function SiteHeader() {
  return (
    <HeaderController className={styles.header}>
      <PageContainer size="wide">
        <nav aria-label="Primary navigation" className={styles.navigation}>
          {/* A native anchor keeps the static header outside the client navigation bundle. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className={styles.wordmark} href="/">
            <span>Haribol</span>
            <span>Lubes</span>
          </a>

          <div className={styles.desktopNavigation}>
            <ul className={styles.navigationList}>
              <li className={styles.productsItem} data-products-root>
                <button
                  aria-controls={productsMenuId}
                  aria-expanded="false"
                  className={styles.navigationButton}
                  data-products-trigger
                  type="button"
                >
                  Products
                  <ChevronDownIcon />
                </button>
                <div
                  aria-hidden="true"
                  className={styles.productsDropdown}
                  data-products-panel
                  id={productsMenuId}
                >
                  <div className={styles.dropdownHeading}>
                    <span>Product catalogue</span>
                    <p>Lubrication categories for automotive and industrial applications.</p>
                  </div>
                  <ul>
                    {productNavigation.map((item) => (
                      <li key={item.href}>
                        <a href={item.href}>
                          {item.label}
                          <ArrowRightIcon />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {/* Native anchors keep the static header outside the client router bundle. */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a className={styles.viewAllLink} href="/products">
                    View All Products
                    <ArrowRightIcon />
                  </a>
                </div>
              </li>
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <a className={styles.navigationLink} data-nav-link href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className={styles.desktopActions}>
              <ThemeControl placement="desktop" />
              <a className={styles.contactLink} data-nav-link href="/contact">
                Contact
              </a>
              <a
                className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.small}`}
                href="/request-a-quote"
              >
                <span>Request a Quote</span>
              </a>
            </div>
          </div>

          <button
            aria-controls={mobileMenuId}
            aria-expanded="false"
            aria-label="Open navigation menu"
            className={styles.mobileMenuButton}
            data-mobile-trigger
            type="button"
          >
            <span data-mobile-trigger-label>Menu</span>
            <span className={styles.menuIcon} data-menu-icon>
              <MenuIcon />
            </span>
            <span className={styles.closeIcon} data-close-icon>
              <CloseIcon />
            </span>
          </button>
        </nav>
      </PageContainer>

      <div
        aria-hidden="true"
        aria-label="Mobile navigation"
        aria-modal="true"
        className={styles.mobilePanel}
        data-mobile-panel
        id={mobileMenuId}
        role="dialog"
      >
        <PageContainer>
          <div className={styles.mobilePanelInner}>
            <p className={styles.mobileEyebrow}>Explore Haribol Lubes</p>
            <ul className={styles.mobileNavigationList}>
              <li>
                <button
                  aria-controls={mobileProductsId}
                  aria-expanded="false"
                  className={styles.mobileProductsButton}
                  data-mobile-products-trigger
                  type="button"
                >
                  <span>Products</span>
                  <ChevronDownIcon />
                </button>
                <div
                  aria-hidden="true"
                  className={styles.mobileProductsPanel}
                  data-mobile-products-panel
                  id={mobileProductsId}
                  inert
                >
                  <ul>
                    {productNavigation.map((item) => (
                      <li key={item.href}>
                        <a href={item.href}>{item.label}</a>
                      </li>
                    ))}
                  </ul>
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a className={styles.mobileViewAll} href="/products">
                    View All Products
                    <ArrowRightIcon />
                  </a>
                </div>
              </li>
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <a data-nav-link href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className={styles.mobileActions}>
              <a
                className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`}
                href="/request-a-quote"
              >
                <span>Request a Quote</span>
                <ArrowRightIcon />
              </a>
              <a className={styles.mobileContact} href="/contact">
                Contact Haribol Lubes
                <ArrowRightIcon />
              </a>
            </div>
            <ThemeControl placement="mobile" />
            <p className={styles.mobileLocation}>{siteConfig.city} · {siteConfig.country}</p>
          </div>
        </PageContainer>
      </div>
    </HeaderController>
  );
}
