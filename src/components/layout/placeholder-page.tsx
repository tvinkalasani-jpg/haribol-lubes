import { PageContainer } from "@/components/ui/page-container";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <PageContainer>
      <section className="placeholder-page">
        <p className="eyebrow">Development placeholder</p>
        <h1>{title}</h1>
        <p>This route is configured and ready for a future project phase.</p>
      </section>
    </PageContainer>
  );
}
