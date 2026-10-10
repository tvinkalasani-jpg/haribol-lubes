import Link from "next/link";

import { insightCategoryLabel } from "@/features/content/presentation";
import { getReadingTime } from "@/features/content/content-repository";
import type { InsightRecord } from "@/features/content/types";

import styles from "./content.module.css";

export function InsightCard({ insight, featured = false }: { insight: InsightRecord; featured?: boolean }) {
  return (
    <article className={featured ? styles.featuredCard : styles.articleCard}>
      <div className={styles.cardMeta}>
        <span>{insightCategoryLabel(insight.category)}</span>
        <span>{getReadingTime(insight.content)} min read</span>
      </div>
      <h2><Link href={`/insights/${insight.slug}`}>{insight.title}</Link></h2>
      <p>{insight.excerpt}</p>
      <Link className={styles.textLink} href={`/insights/${insight.slug}`}>
        Read insight <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
