import type { ElementType, PropsWithChildren } from "react";

import { PageContainer } from "./page-container";
import styles from "./section.module.css";

type SectionVariant = "standard" | "elevated" | "full" | "compact" | "promotional";
type SectionContainer = "standard" | "wide" | "narrow" | "full";

type SectionProps = PropsWithChildren<{
  as?: ElementType;
  className?: string;
  container?: SectionContainer;
  id?: string;
  variant?: SectionVariant;
}>;

export function Section({
  as: Component = "section",
  children,
  className,
  container = "standard",
  id,
  variant = "standard",
}: SectionProps) {
  return (
    <Component className={[styles.section, styles[variant], className].filter(Boolean).join(" ")} id={id}>
      <PageContainer size={container}>{children}</PageContainer>
    </Component>
  );
}
