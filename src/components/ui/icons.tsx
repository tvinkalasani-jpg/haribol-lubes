import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const sharedProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.75,
  "aria-hidden": true,
};

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function GaugeIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M4.9 19a9 9 0 1 1 14.2 0M12 13l4-4" />
      <path d="M7.5 16.5h9" />
    </svg>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h4M9 13h6M9 17h4" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M20 11.6a8 8 0 0 1-11.8 7L4 19.7l1.1-4.1A8 8 0 1 1 20 11.6Z" />
      <path d="M9.1 8.1c.2-.4.4-.4.7-.4h.3c.1 0 .3.1.4.4l.8 1.8c.1.3.1.4 0 .6l-.6.8c-.2.2-.1.4 0 .6.5.8 1.2 1.4 2 1.9.2.1.4.2.6 0l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.3.4.5 0 .3-.2 1.3-.9 1.8-.5.4-1.2.6-2 .4-1.1-.2-2.5-.8-4-2.1-1.7-1.5-2.8-3.4-3.1-4.6-.2-.9 0-1.5.3-1.9.5-.5 1.2-.8 1.9-.6Z" />
    </svg>
  );
}
