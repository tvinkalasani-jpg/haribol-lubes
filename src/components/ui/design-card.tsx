import type { ReactNode } from "react";

import { ActionLink } from "./action-link";
import styles from "./design-card.module.css";

type CardVariant = "product" | "industry" | "feature" | "resource" | "metric";

type DesignCardProps = {
  children?: ReactNode;
  description?: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  metric?: string;
  title: string;
  variant?: CardVariant;
};

export function DesignCard({
  children,
  description,
  eyebrow,
  href,
  linkLabel = "Explore",
  metric,
  title,
  variant = "feature",
}: DesignCardProps) {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      {children ? <div className={styles.visual}>{children}</div> : null}
      <div className={styles.content}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        {metric ? <p className={styles.metric}>{metric}</p> : null}
        <h3>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}
        {href ? (
          <div className={styles.link}>
            <ActionLink href={href} variant="action">
              {linkLabel}
            </ActionLink>
          </div>
        ) : null}
      </div>
    </article>
  );
}
