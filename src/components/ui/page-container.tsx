import type { PropsWithChildren } from "react";

import styles from "./page-container.module.css";

type ContainerSize = "standard" | "wide" | "narrow" | "full";

type PageContainerProps = PropsWithChildren<{
  className?: string;
  size?: ContainerSize;
}>;

export function PageContainer({
  children,
  className,
  size = "standard",
}: PageContainerProps) {
  const classNames = [styles.container, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classNames}>{children}</div>;
}
