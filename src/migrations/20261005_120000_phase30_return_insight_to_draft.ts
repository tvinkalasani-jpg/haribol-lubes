import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

const slug = "understanding-sae-viscosity-grades";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "insights"
    SET "publication_status" = 'draft', "published_at" = NULL, "seo_indexable" = false, "updated_at" = now()
    WHERE "slug" = ${slug};

    UPDATE "_insights_v"
    SET "version_publication_status" = 'draft', "version_published_at" = NULL, "version_seo_indexable" = false, "updated_at" = now()
    WHERE "version_slug" = ${slug};
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "insights"
    SET "publication_status" = 'published', "published_at" = '2026-10-04T00:00:00.000Z', "seo_indexable" = true, "updated_at" = now()
    WHERE "slug" = ${slug};

    UPDATE "_insights_v"
    SET "version_publication_status" = 'published', "version_published_at" = '2026-10-04T00:00:00.000Z', "version_seo_indexable" = true, "updated_at" = now()
    WHERE "version_slug" = ${slug};
  `);
}
