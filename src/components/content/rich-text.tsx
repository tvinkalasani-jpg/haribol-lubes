import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react";

import styles from "./content.module.css";

export function RichText({ data }: { data: Record<string, unknown> }) {
  return <PayloadRichText className={styles.richText} data={data as never} />;
}
