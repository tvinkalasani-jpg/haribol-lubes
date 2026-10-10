import { PageContainer } from "@/components/ui/page-container";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Terms", path: "/terms", indexable: false });

export default function TermsPage() {
  return (
    <PageContainer>
      <section className="placeholder-page">
        <p className="eyebrow">Draft for business and legal review</p>
        <h1>Website Terms</h1>
        <p>These terms are a factual launch draft and require business and legal approval before production use.</p>
        <h2>Website use</h2>
        <p>Visitors may use this website to explore the current catalogue, read approved resources and submit legitimate business enquiries. Attempts to disrupt, misuse or gain unauthorised access to the website are prohibited.</p>
        <h2>Product and catalogue information</h2>
        <p>Product information is provided for general catalogue and enquiry purposes. Current labels, approved technical documents and equipment requirements should be verified before selection or use. Website content does not replace manufacturer instructions or professional technical advice.</p>
        <h2>Prices, quotations and availability</h2>
        <p>No price or availability should be assumed unless it is expressly displayed and confirmed. A quotation request is an enquiry and does not by itself create an order or supply commitment.</p>
        <h2>External links and intellectual property</h2>
        <p>External services, including WhatsApp and map directions, operate under their own terms. Website text, brand assets and product materials may be protected by their respective owners and should not be reused without permission.</p>
        <h2>Review required</h2>
        <p>Approved limitation, warranty, governing-law, dispute, amendment and contact clauses must be supplied or reviewed by qualified advisers before launch.</p>
      </section>
    </PageContainer>
  );
}
