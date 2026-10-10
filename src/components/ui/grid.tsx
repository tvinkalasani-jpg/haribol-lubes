import type { PropsWithChildren } from "react";

import styles from "./grid.module.css";

type GridLayout = "two" | "three" | "four" | "products" | "editorial";

type GridProps = PropsWithChildren<{
  className?: string;
  layout?: GridLayout;
}>;

export function Grid({ children, className, layout = "three" }: GridProps) {
  return (
    <div className={[styles.grid, styles[layout], className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
