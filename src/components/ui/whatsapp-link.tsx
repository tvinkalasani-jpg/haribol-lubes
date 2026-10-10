import type { AnchorHTMLAttributes, ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { whatsappAnalyticsEvent, type WhatsAppContext, type WhatsAppSource } from "@/types/whatsapp";

type WhatsAppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  context: WhatsAppContext;
  source: WhatsAppSource;
};

export function WhatsAppLink({ children, context, source, ...props }: WhatsAppLinkProps) {
  const href = buildWhatsAppUrl(siteConfig.whatsapp, context);
  if (!href) return null;

  return (
    <a
      {...props}
      aria-label={typeof children === "string" ? `${children} on WhatsApp` : props["aria-label"]}
      data-analytics-event={whatsappAnalyticsEvent}
      data-whatsapp-source={source}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
