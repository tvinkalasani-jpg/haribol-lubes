import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { ActionLink } from "@/components/ui/action-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { DesignCard } from "@/components/ui/design-card";
import {
  ChoiceField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/ui/form-controls";
import { Grid } from "@/components/ui/grid";
import {
  ArrowRightIcon,
  CheckIcon,
  DocumentIcon,
  GaugeIcon,
} from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { createMetadata } from "@/lib/seo/metadata";

import styles from "./page.module.css";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Design System",
    description: "Development preview of the Haribol Lubes design system.",
    path: "/design-system",
    indexable: false,
  }),
};

const colourTokens = [
  ["Background", "--color-background"],
  ["Background elevated", "--color-background-elevated"],
  ["Surface", "--color-surface"],
  ["Surface hover", "--color-surface-hover"],
  ["Foreground", "--color-foreground"],
  ["Foreground muted", "--color-foreground-muted"],
  ["Border", "--color-border"],
  ["Border strong", "--color-border-strong"],
  ["Accent", "--color-accent"],
  ["Accent hover", "--color-accent-hover"],
  ["Success", "--color-success"],
  ["Warning", "--color-warning"],
  ["Danger", "--color-danger"],
] as const;

const spacingTokens = [
  ["01", "4", "--space-1"],
  ["02", "8", "--space-2"],
  ["03", "12", "--space-3"],
  ["04", "16", "--space-4"],
  ["05", "24", "--space-5"],
  ["06", "32", "--space-6"],
  ["07", "48", "--space-7"],
  ["08", "64", "--space-8"],
] as const;

function SpecimenHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className={styles.specimenHeader}>
      <p className={styles.sectionIndex}>{eyebrow}</p>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

export default function DesignSystemPage() {
  return (
    <div className={styles.page}>
      <Section className={styles.hero} container="wide" variant="promotional">
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.heroEyebrow}>HARIBOL / DESIGN SYSTEM 01</p>
            <h1>Engineered for performance.</h1>
            <p className={styles.heroLead}>
              A precise visual language for automotive, industrial and energy
              applications across East Africa.
            </p>
            <div className={styles.heroActions}>
              <ButtonLink href="#colours" iconRight={<ArrowRightIcon />} size="large">
                Explore the system
              </ButtonLink>
              <ButtonLink href="/" size="large" variant="ghost">
                Development home
              </ButtonLink>
            </div>
          </div>
          <div aria-label="Design system principles" className={styles.heroPanel}>
            <div className={styles.instrumentMark}>
              <span>H</span>
              <div aria-hidden className={styles.instrumentRing} />
            </div>
            <dl className={styles.heroMetrics}>
              <div>
                <dt>Character</dt>
                <dd>Technical</dd>
              </div>
              <div>
                <dt>Expression</dt>
                <dd>Restrained</dd>
              </div>
              <div>
                <dt>Standard</dt>
                <dd>WCAG 2.2 AA</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section id="colours" variant="standard">
        <SpecimenHeader
          description="Graphite layers create depth while a controlled brass accent signals energy, precision and action."
          eyebrow="01 / Foundation"
          title="Colour system"
        />
        <div className={styles.swatchGrid}>
          {colourTokens.map(([label, token]) => (
            <div className={styles.swatch} key={token}>
              <div
                className={styles.swatchColour}
                style={{ "--swatch-color": `var(${token})` } as CSSProperties}
              />
              <div className={styles.swatchMeta}>
                <strong>{label}</strong>
                <code>{token}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className={styles.typographySection} id="typography" variant="elevated">
        <SpecimenHeader
          description="Barlow Condensed gives the brand its automotive editorial voice. Manrope carries technical information with clarity."
          eyebrow="02 / Foundation"
          title="Typography"
        />
        <div className={styles.typeSpecimens}>
          <div className={`${styles.typeRow} ${styles.displayXl}`}>
            <span>Display XL</span>
            <p>Pure performance</p>
          </div>
          <div className={`${styles.typeRow} ${styles.displayLarge}`}>
            <span>Display Large</span>
            <p>Power in motion</p>
          </div>
          <div className={`${styles.typeRow} ${styles.typeH1}`}>
            <span>Heading 01</span>
            <p>Engineered reliability</p>
          </div>
          <div className={`${styles.typeRow} ${styles.typeH2}`}>
            <span>Heading 02</span>
            <p>Industrial confidence</p>
          </div>
          <div className={`${styles.typeRow} ${styles.typeH3}`}>
            <span>Heading 03</span>
            <p>Technical performance</p>
          </div>
          <div className={`${styles.typeRow} ${styles.typeH4}`}>
            <span>Heading 04</span>
            <p>Precision at every scale</p>
          </div>
          <div className={`${styles.typeRow} ${styles.bodyLarge}`}>
            <span>Body Large</span>
            <p>
              Lubrication solutions specified for demanding automotive and
              industrial environments.
            </p>
          </div>
          <div className={`${styles.typeRow} ${styles.body}`}>
            <span>Body</span>
            <p>
              Clear, measured communication keeps technical information easy to
              evaluate across every device.
            </p>
          </div>
          <div className={`${styles.typeRow} ${styles.bodySmall}`}>
            <span>Body Small</span>
            <p>Supporting details and compact product information.</p>
          </div>
          <div className={`${styles.typeRow} ${styles.eyebrowType}`}>
            <span>Eyebrow</span>
            <p>AUTOMOTIVE / INDUSTRIAL / ENERGY</p>
          </div>
          <div className={`${styles.typeRow} ${styles.labelType}`}>
            <span>Label</span>
            <p>ISO VISCOSITY GRADE</p>
          </div>
          <div className={`${styles.typeRow} ${styles.captionType}`}>
            <span>Caption</span>
            <p>Technical data reviewed September 2026</p>
          </div>
        </div>
      </Section>

      <Section className={styles.controlsSection} id="controls" variant="standard">
        <SpecimenHeader
          description="Controls are compact, decisive and legible. Their states communicate through more than colour alone."
          eyebrow="03 / Components"
          title="Buttons & links"
        />
        <div className={styles.controlGroups}>
          <div className={styles.controlGroup}>
            <h3>Variants</h3>
            <div className={styles.controlRow}>
              <Button iconRight={<ArrowRightIcon />}>Primary action</Button>
              <Button iconLeft={<GaugeIcon />} variant="secondary">
                Secondary
              </Button>
              <Button variant="ghost">Ghost</Button>
              <Button iconRight={<ArrowRightIcon />} variant="text">
                Text action
              </Button>
            </div>
          </div>
          <div className={styles.controlGroup}>
            <h3>Sizes & states</h3>
            <div className={styles.controlRow}>
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
              <Button isLoading>Processing</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
          <div className={styles.controlGroup}>
            <h3>Link language</h3>
            <div className={styles.linkRow}>
              <ActionLink href="#controls">Standard link</ActionLink>
              <ActionLink href="#controls" variant="navigation">
                Navigation link
              </ActionLink>
              <ActionLink href="#controls" variant="action">
                Explore products
              </ActionLink>
              <p>
                Technical copy can contain an{" "}
                <ActionLink href="#controls" variant="inline">
                  inline content link
                </ActionLink>
                .
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className={styles.cardsSection} id="cards" variant="elevated">
        <SpecimenHeader
          description="A single industrial surface language adapts to products, industries, features, editorial resources and metrics."
          eyebrow="04 / Components"
          title="Card system"
        />
        <Grid layout="products">
          <DesignCard
            description="High-performance protection for severe-duty diesel engines."
            eyebrow="Engine oils"
            href="#cards"
            title="Heavy Duty 15W-40"
            variant="product"
          >
            <GaugeIcon />
          </DesignCard>
          <DesignCard
            description="Lubrication systems for fleets operating across demanding routes."
            eyebrow="Industry"
            href="#cards"
            title="Transport & fleet"
            variant="industry"
          />
          <DesignCard
            description="Structured data, approvals and documentation remain easy to evaluate."
            eyebrow="Capability"
            title="Technical clarity"
            variant="feature"
          >
            <CheckIcon />
          </DesignCard>
          <DesignCard
            description="A practical guide to selecting the correct industrial viscosity grade."
            eyebrow="Technical guide"
            href="#cards"
            linkLabel="Read guide"
            title="Understanding ISO VG"
            variant="resource"
          >
            <DocumentIcon />
          </DesignCard>
        </Grid>
        <div className={styles.metricRow}>
          <DesignCard
            description="A concise statistic treatment designed for credible business facts."
            eyebrow="Metric"
            metric="24/7"
            title="Operational confidence"
            variant="metric"
          />
          <DesignCard
            description="Regional architecture ready to support future market expansion."
            eyebrow="Market readiness"
            metric="04"
            title="East African markets"
            variant="metric"
          />
        </div>
      </Section>

      <Section className={styles.formsSection} id="forms" variant="standard">
        <SpecimenHeader
          description="Form controls favour high contrast, direct labelling and visible feedback without decorative noise."
          eyebrow="05 / Components"
          title="Form system"
        />
        <form className={styles.formPreview}>
          <Grid layout="two">
            <TextField
              id="preview-name"
              label="Full name"
              placeholder="Enter your name"
            />
            <TextField
              helperText="We will use this only to respond to the enquiry."
              id="preview-email"
              label="Email address"
              placeholder="name@company.com"
              type="email"
            />
            <TextField
              helperText="Use an international or Kenyan mobile format."
              id="preview-phone"
              label="Phone number"
              placeholder="+254"
              type="tel"
            />
            <SelectField id="preview-sector" label="Industry">
              <option value="">Select an industry</option>
              <option>Transport and fleet</option>
              <option>Manufacturing</option>
              <option>Construction</option>
            </SelectField>
            <TextField
              defaultValue="procurement@company.com"
              helperText="Email address is ready to use."
              id="preview-success"
              label="Success state"
              state="success"
              type="email"
            />
            <TextField
              defaultValue="invalid-address"
              helperText="Enter a valid business email address."
              id="preview-error"
              label="Validation error"
              state="error"
              type="email"
            />
          </Grid>
          <TextareaField
            helperText="Include the product, pack size and estimated quantity."
            id="preview-message"
            label="Enquiry details"
            placeholder="Tell us what you need..."
          />
          <TextField
            disabled
            id="preview-disabled"
            label="Disabled field"
            placeholder="Unavailable in this state"
          />
          <fieldset className={styles.choiceGroup}>
            <legend>Preferred response</legend>
            <ChoiceField defaultChecked id="choice-email" label="Email" name="response" type="radio" />
            <ChoiceField id="choice-phone" label="Phone call" name="response" type="radio" />
            <ChoiceField id="choice-terms" label="I agree to the enquiry terms" type="checkbox" />
            <ChoiceField disabled id="choice-disabled" label="Unavailable option" type="checkbox" />
          </fieldset>
          <div className={styles.formActions}>
            <Button iconRight={<ArrowRightIcon />} size="large">
              Submit visual example
            </Button>
            <p>Visual demonstration only. No information is submitted.</p>
          </div>
        </form>
      </Section>

      <Section className={styles.layoutSection} id="layout" variant="elevated">
        <SpecimenHeader
          description="A mobile-first container and grid system balances generous desktop space with efficient smaller-screen layouts."
          eyebrow="06 / Composition"
          title="Layout & grid"
        />
        <div className={styles.containerDemos}>
          <div className={styles.containerDemoWide}>Wide · 90rem</div>
          <div className={styles.containerDemoStandard}>Standard · 75rem</div>
          <div className={styles.containerDemoNarrow}>Editorial · 48rem</div>
        </div>
        <div className={styles.gridDemos}>
          <div>
            <p className={styles.demoLabel}>Two columns</p>
            <Grid layout="two">
              <div className={styles.gridCell}>01</div>
              <div className={styles.gridCell}>02</div>
            </Grid>
          </div>
          <div>
            <p className={styles.demoLabel}>Three columns</p>
            <Grid layout="three">
              <div className={styles.gridCell}>01</div>
              <div className={styles.gridCell}>02</div>
              <div className={styles.gridCell}>03</div>
            </Grid>
          </div>
          <div>
            <p className={styles.demoLabel}>Four columns</p>
            <Grid layout="four">
              <div className={styles.gridCell}>01</div>
              <div className={styles.gridCell}>02</div>
              <div className={styles.gridCell}>03</div>
              <div className={styles.gridCell}>04</div>
            </Grid>
          </div>
          <div>
            <p className={styles.demoLabel}>Editorial split</p>
            <Grid layout="editorial">
              <div className={styles.gridCell}>Primary narrative</div>
              <div className={styles.gridCell}>Technical detail</div>
            </Grid>
          </div>
        </div>
      </Section>

      <Section id="spacing" variant="standard">
        <SpecimenHeader
          description="A 4px base scale creates consistent component, card, layout, section and hero rhythm."
          eyebrow="07 / Foundation"
          title="Spacing"
        />
        <div className={styles.spacingScale}>
          {spacingTokens.map(([index, pixels, token]) => (
            <div className={styles.spacingItem} key={token}>
              <span>{index}</span>
              <div
                className={styles.spacingBar}
                style={{ "--spacing-width": `var(${token})` } as CSSProperties}
              />
              <code>{pixels}px</code>
            </div>
          ))}
        </div>
      </Section>

      <Section className={styles.surfacesSection} id="surfaces" variant="elevated">
        <SpecimenHeader
          description="Layer contrast, restrained radii and crisp shadows provide depth without soft floating-card styling."
          eyebrow="08 / Foundation"
          title="Borders, radius & surfaces"
        />
        <Grid layout="four">
          <div className={`${styles.surfaceSample} ${styles.subtleBorder}`}>
            <span>Subtle border</span>
            <code>1px / border</code>
          </div>
          <div className={`${styles.surfaceSample} ${styles.strongBorder}`}>
            <span>Strong border</span>
            <code>1px / border strong</code>
          </div>
          <div className={`${styles.surfaceSample} ${styles.smallRadius}`}>
            <span>Small radius</span>
            <code>4px</code>
          </div>
          <div className={`${styles.surfaceSample} ${styles.mediumRadius}`}>
            <span>Medium radius</span>
            <code>8px</code>
          </div>
        </Grid>
        <div className={styles.depthSamples}>
          <div className={styles.depthBase}>Background</div>
          <div className={styles.depthElevated}>Elevated</div>
          <div className={styles.depthSurface}>Surface + controlled shadow</div>
        </div>
      </Section>

      <Section className={styles.closing} container="narrow" variant="promotional">
        <p className={styles.heroEyebrow}>SYSTEM STATUS / PHASE 03</p>
        <h2>Built for clarity under pressure.</h2>
        <p>
          The visual foundation is ready for future navigation, homepage and
          catalogue work without pre-empting those phases.
        </p>
        <ButtonLink href="#colours" iconRight={<ArrowRightIcon />} variant="secondary">
          Review from the top
        </ButtonLink>
      </Section>
    </div>
  );
}
