export type SocialNetwork = "instagram" | "facebook" | "linkedin" | "youtube";

export type SocialProfileLinks = Readonly<Record<SocialNetwork, string>>;

const permittedHosts: Record<SocialNetwork, readonly string[]> = {
  instagram: ["instagram.com", "www.instagram.com"],
  facebook: ["facebook.com", "www.facebook.com"],
  linkedin: ["linkedin.com", "www.linkedin.com"],
  youtube: ["youtube.com", "www.youtube.com"],
};

export function isValidSocialProfileUrl(network: SocialNetwork, value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && permittedHosts[network].includes(url.hostname.toLowerCase()) && url.pathname !== "/";
  } catch {
    return false;
  }
}

export function getValidSocialProfiles(links: SocialProfileLinks) {
  return (Object.entries(links) as [SocialNetwork, string][])
    .filter(([network, href]) => isValidSocialProfileUrl(network, href))
    .map(([network, href]) => ({ network, href }));
}
