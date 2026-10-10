import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon } from "./icons";
import styles from "./action-link.module.css";

type LinkVariant = "standard" | "navigation" | "action" | "inline";

type ActionLinkProps = {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
  variant?: LinkVariant;
};

export function ActionLink({
  children,
  href,
  icon,
  variant = "standard",
}: ActionLinkProps) {
  const resolvedIcon = variant === "action" ? (icon ?? <ArrowRightIcon />) : icon;

  return (
    <Link className={`${styles.link} ${styles[variant]}`} href={href}>
      <span>{children}</span>
      {resolvedIcon}
    </Link>
  );
}
