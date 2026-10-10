import { getValidSocialProfiles, type SocialNetwork, type SocialProfileLinks } from "@/lib/utils/social-links";

import styles from "./social-links.module.css";

const labels: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

function SocialIcon({ network }: { network: SocialNetwork }) {
  const paths: Record<SocialNetwork, React.ReactNode> = {
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.6" r="1" className={styles.fill} /></>,
    facebook: <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z" />,
    linkedin: <><path d="M5 9v10M5 5.5v.1M10 19V9m0 4c1-3 7-3 7 1v5" /><circle cx="5" cy="5.5" r="1" className={styles.fill} /></>,
    youtube: <><path d="M21 12c0 3-.4 5-1.3 5.7S16.5 19 12 19s-6.8-.4-7.7-1.3S3 15 3 12s.4-5 1.3-5.7S7.5 5 12 5s6.8.4 7.7 1.3S21 9 21 12Z" /><path d="m10 9 5 3-5 3Z" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[network]}</svg>;
}

export function SocialLinks({ links, className }: { links: SocialProfileLinks; className?: string }) {
  const profiles = getValidSocialProfiles(links);
  if (profiles.length === 0) return null;
  return (
    <nav aria-label="Haribol social profiles" className={className}>
      <ul className={styles.list}>
        {profiles.map(({ network, href }) => (
          <li key={network}><a aria-label={`${labels[network]} (opens in a new tab)`} href={href} rel="noopener noreferrer" target="_blank"><SocialIcon network={network} /><span>{labels[network]}</span></a></li>
        ))}
      </ul>
    </nav>
  );
}
