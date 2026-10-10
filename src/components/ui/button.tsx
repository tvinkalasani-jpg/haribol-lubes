import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "text";
type ButtonSize = "small" | "medium" | "large";

type SharedButtonProps = {
  children: ReactNode;
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type ButtonProps = SharedButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    isLoading?: boolean;
  };

type ButtonLinkProps = SharedButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> & {
    href: string;
  };

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  className,
  disabled,
  iconLeft,
  iconRight,
  isLoading = false,
  size = "medium",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={isLoading || undefined}
      className={buttonClassName(variant, size, className)}
      disabled={disabled || isLoading}
      type={type}
    >
      {isLoading ? <span aria-hidden className={styles.spinner} /> : iconLeft}
      <span>{children}</span>
      {!isLoading && iconRight}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  href,
  iconLeft,
  iconRight,
  size = "medium",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link {...props} className={buttonClassName(variant, size, className)} href={href}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </Link>
  );
}
