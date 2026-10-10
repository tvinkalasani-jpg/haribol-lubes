import { PageContainer } from "@/components/ui/page-container";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Privacy Policy", path: "/privacy", indexable: false });

export default function PrivacyPage() {
  return (
    <PageContainer>
      <section className="placeholder-page">
        <p className="eyebrow">Draft for business and legal review</p>
        <h1>Privacy Policy</h1>
        <p>This page describes the website’s current data handling. It is a structured launch draft and must be approved before production launch.</p>
        <h2>Information currently collected</h2>
        <p>Quotation requests may include a name, company, phone number or email address, business type, location, product requirements and a message. These details are used to record, review and respond to the enquiry.</p>
        <p>The Contact form currently checks information in the browser but does not transmit or store it. The interface identifies this limitation.</p>
        <h2>Website preferences and external services</h2>
        <p>The public website stores only the selected colour-theme preference in local browser storage. Future cart test architecture stores offer identifiers and quantities only and remains disabled.</p>
        <p>WhatsApp links open an external service. Information a visitor chooses to send through WhatsApp is then handled under WhatsApp’s terms and privacy practices.</p>
        <h2>Administration, retention and access</h2>
        <p>Authorised CMS administrators may process account information and private enquiry records. Access is role restricted. Retention periods, deletion procedures and the approved privacy contact must be confirmed as part of the production policy.</p>
        <h2>Analytics and cookies</h2>
        <p>Marketing analytics is not currently installed and the public website does not currently set marketing analytics cookies. Any future analytics service must follow the approved consent policy and must not receive enquiry or other identifying information.</p>
        <h2>Review required</h2>
        <p>The business must confirm applicable rights procedures, retention periods, third-party processors, international transfers where relevant, and the public privacy contact before this draft is approved.</p>
      </section>
    </PageContainer>
  );
}
