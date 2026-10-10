import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_resources_resource_type" AS ENUM('technical-data-sheet', 'safety-data-sheet', 'brochure', 'product-guide', 'technical-guide', 'specification-guide', 'catalogue', 'other');
  CREATE TYPE "public"."enum__resources_v_version_resource_type" AS ENUM('technical-data-sheet', 'safety-data-sheet', 'brochure', 'product-guide', 'technical-guide', 'specification-guide', 'catalogue', 'other');
  CREATE TYPE "public"."enum_insights_related_industries" AS ENUM('automotive', 'garages-workshops', 'transport-logistics', 'fleet-operators', 'manufacturing', 'construction', 'agriculture', 'industrial-machinery', 'wholesale-retail');
  CREATE TYPE "public"."enum_insights_category" AS ENUM('lubricant-basics', 'automotive', 'industrial', 'maintenance', 'product-selection', 'technical-guides', 'business-procurement');
  CREATE TYPE "public"."enum__insights_v_version_related_industries" AS ENUM('automotive', 'garages-workshops', 'transport-logistics', 'fleet-operators', 'manufacturing', 'construction', 'agriculture', 'industrial-machinery', 'wholesale-retail');
  CREATE TYPE "public"."enum__insights_v_version_category" AS ENUM('lubricant-basics', 'automotive', 'industrial', 'maintenance', 'product-selection', 'technical-guides', 'business-procurement');
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"resource_type" "enum_resources_resource_type" NOT NULL,
  	"technical_document_id" integer,
  	"file_id" integer,
  	"thumbnail_id" integer,
  	"featured" boolean DEFAULT false,
  	"language" varchar DEFAULT 'en' NOT NULL,
  	"version" varchar,
  	"effective_date" timestamp(3) with time zone,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_override" varchar,
  	"seo_indexable" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"publication_status" "publish_status" DEFAULT 'draft' NOT NULL,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"product_categories_id" integer,
  	"brands_id" integer,
  	"markets_id" integer
  );
  
  CREATE TABLE "_resources_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_description" varchar NOT NULL,
  	"version_resource_type" "enum__resources_v_version_resource_type" NOT NULL,
  	"version_technical_document_id" integer,
  	"version_file_id" integer,
  	"version_thumbnail_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_language" varchar DEFAULT 'en' NOT NULL,
  	"version_version" varchar,
  	"version_effective_date" timestamp(3) with time zone,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_override" varchar,
  	"version_seo_indexable" boolean DEFAULT false,
  	"version_seo_open_graph_image_id" integer,
  	"version_publication_status" "publish_status" DEFAULT 'draft' NOT NULL,
  	"version_verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_resources_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"product_categories_id" integer,
  	"brands_id" integer,
  	"markets_id" integer
  );
  
  CREATE TABLE "insights_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE "insights_related_industries" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_insights_related_industries",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "insights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar NOT NULL,
  	"hero_image_id" integer,
  	"content" jsonb NOT NULL,
  	"byline" varchar DEFAULT 'Haribol Lubes Limited' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"category" "enum_insights_category" NOT NULL,
  	"featured" boolean DEFAULT false,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_override" varchar,
  	"seo_indexable" boolean DEFAULT false,
  	"seo_open_graph_image_id" integer,
  	"technically_sensitive" boolean DEFAULT true,
  	"publication_status" "publish_status" DEFAULT 'draft' NOT NULL,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "insights_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"product_categories_id" integer,
  	"applications_id" integer,
  	"resources_id" integer
  );
  
  CREATE TABLE "_insights_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_insights_v_version_related_industries" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__insights_v_version_related_industries",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_insights_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_excerpt" varchar NOT NULL,
  	"version_hero_image_id" integer,
  	"version_content" jsonb NOT NULL,
  	"version_byline" varchar DEFAULT 'Haribol Lubes Limited' NOT NULL,
  	"version_published_at" timestamp(3) with time zone,
  	"version_category" "enum__insights_v_version_category" NOT NULL,
  	"version_featured" boolean DEFAULT false,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_override" varchar,
  	"version_seo_indexable" boolean DEFAULT false,
  	"version_seo_open_graph_image_id" integer,
  	"version_technically_sensitive" boolean DEFAULT true,
  	"version_publication_status" "publish_status" DEFAULT 'draft' NOT NULL,
  	"version_verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_insights_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"product_categories_id" integer,
  	"applications_id" integer,
  	"resources_id" integer
  );
  
  ALTER TABLE "technical_documents" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "technical_documents" ADD COLUMN "publication_status" "publish_status" DEFAULT 'draft' NOT NULL;
  ALTER TABLE "_technical_documents_v" ADD COLUMN "version_slug" varchar NOT NULL;
  ALTER TABLE "_technical_documents_v" ADD COLUMN "version_publication_status" "publish_status" DEFAULT 'draft' NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "resources_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "insights_id" integer;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_technical_document_id_technical_documents_id_fk" FOREIGN KEY ("technical_document_id") REFERENCES "public"."technical_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_parent_id_resources_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_technical_document_id_technical_documents_id_fk" FOREIGN KEY ("version_technical_document_id") REFERENCES "public"."technical_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_file_id_media_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("version_seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v_rels" ADD CONSTRAINT "_resources_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_resources_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v_rels" ADD CONSTRAINT "_resources_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v_rels" ADD CONSTRAINT "_resources_v_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v_rels" ADD CONSTRAINT "_resources_v_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v_rels" ADD CONSTRAINT "_resources_v_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_tags" ADD CONSTRAINT "insights_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_related_industries" ADD CONSTRAINT "insights_related_industries_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_version_tags" ADD CONSTRAINT "_insights_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_version_related_industries" ADD CONSTRAINT "_insights_v_version_related_industries_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_parent_id_insights_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("version_seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");
  CREATE INDEX "resources_technical_document_idx" ON "resources" USING btree ("technical_document_id");
  CREATE INDEX "resources_file_idx" ON "resources" USING btree ("file_id");
  CREATE INDEX "resources_thumbnail_idx" ON "resources" USING btree ("thumbnail_id");
  CREATE INDEX "resources_seo_seo_open_graph_image_idx" ON "resources" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "resources_publication_status_idx" ON "resources" USING btree ("publication_status");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "resources_rels_order_idx" ON "resources_rels" USING btree ("order");
  CREATE INDEX "resources_rels_parent_idx" ON "resources_rels" USING btree ("parent_id");
  CREATE INDEX "resources_rels_path_idx" ON "resources_rels" USING btree ("path");
  CREATE INDEX "resources_rels_products_id_idx" ON "resources_rels" USING btree ("products_id");
  CREATE INDEX "resources_rels_product_categories_id_idx" ON "resources_rels" USING btree ("product_categories_id");
  CREATE INDEX "resources_rels_brands_id_idx" ON "resources_rels" USING btree ("brands_id");
  CREATE INDEX "resources_rels_markets_id_idx" ON "resources_rels" USING btree ("markets_id");
  CREATE INDEX "_resources_v_parent_idx" ON "_resources_v" USING btree ("parent_id");
  CREATE INDEX "_resources_v_version_version_slug_idx" ON "_resources_v" USING btree ("version_slug");
  CREATE INDEX "_resources_v_version_version_technical_document_idx" ON "_resources_v" USING btree ("version_technical_document_id");
  CREATE INDEX "_resources_v_version_version_file_idx" ON "_resources_v" USING btree ("version_file_id");
  CREATE INDEX "_resources_v_version_version_thumbnail_idx" ON "_resources_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_resources_v_version_seo_version_seo_open_graph_image_idx" ON "_resources_v" USING btree ("version_seo_open_graph_image_id");
  CREATE INDEX "_resources_v_version_version_publication_status_idx" ON "_resources_v" USING btree ("version_publication_status");
  CREATE INDEX "_resources_v_version_version_updated_at_idx" ON "_resources_v" USING btree ("version_updated_at");
  CREATE INDEX "_resources_v_version_version_created_at_idx" ON "_resources_v" USING btree ("version_created_at");
  CREATE INDEX "_resources_v_created_at_idx" ON "_resources_v" USING btree ("created_at");
  CREATE INDEX "_resources_v_updated_at_idx" ON "_resources_v" USING btree ("updated_at");
  CREATE INDEX "_resources_v_rels_order_idx" ON "_resources_v_rels" USING btree ("order");
  CREATE INDEX "_resources_v_rels_parent_idx" ON "_resources_v_rels" USING btree ("parent_id");
  CREATE INDEX "_resources_v_rels_path_idx" ON "_resources_v_rels" USING btree ("path");
  CREATE INDEX "_resources_v_rels_products_id_idx" ON "_resources_v_rels" USING btree ("products_id");
  CREATE INDEX "_resources_v_rels_product_categories_id_idx" ON "_resources_v_rels" USING btree ("product_categories_id");
  CREATE INDEX "_resources_v_rels_brands_id_idx" ON "_resources_v_rels" USING btree ("brands_id");
  CREATE INDEX "_resources_v_rels_markets_id_idx" ON "_resources_v_rels" USING btree ("markets_id");
  CREATE INDEX "insights_tags_order_idx" ON "insights_tags" USING btree ("_order");
  CREATE INDEX "insights_tags_parent_id_idx" ON "insights_tags" USING btree ("_parent_id");
  CREATE INDEX "insights_related_industries_order_idx" ON "insights_related_industries" USING btree ("order");
  CREATE INDEX "insights_related_industries_parent_idx" ON "insights_related_industries" USING btree ("parent_id");
  CREATE UNIQUE INDEX "insights_slug_idx" ON "insights" USING btree ("slug");
  CREATE INDEX "insights_hero_image_idx" ON "insights" USING btree ("hero_image_id");
  CREATE INDEX "insights_seo_seo_open_graph_image_idx" ON "insights" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "insights_publication_status_idx" ON "insights" USING btree ("publication_status");
  CREATE INDEX "insights_updated_at_idx" ON "insights" USING btree ("updated_at");
  CREATE INDEX "insights_created_at_idx" ON "insights" USING btree ("created_at");
  CREATE INDEX "insights_rels_order_idx" ON "insights_rels" USING btree ("order");
  CREATE INDEX "insights_rels_parent_idx" ON "insights_rels" USING btree ("parent_id");
  CREATE INDEX "insights_rels_path_idx" ON "insights_rels" USING btree ("path");
  CREATE INDEX "insights_rels_products_id_idx" ON "insights_rels" USING btree ("products_id");
  CREATE INDEX "insights_rels_product_categories_id_idx" ON "insights_rels" USING btree ("product_categories_id");
  CREATE INDEX "insights_rels_applications_id_idx" ON "insights_rels" USING btree ("applications_id");
  CREATE INDEX "insights_rels_resources_id_idx" ON "insights_rels" USING btree ("resources_id");
  CREATE INDEX "_insights_v_version_tags_order_idx" ON "_insights_v_version_tags" USING btree ("_order");
  CREATE INDEX "_insights_v_version_tags_parent_id_idx" ON "_insights_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_insights_v_version_related_industries_order_idx" ON "_insights_v_version_related_industries" USING btree ("order");
  CREATE INDEX "_insights_v_version_related_industries_parent_idx" ON "_insights_v_version_related_industries" USING btree ("parent_id");
  CREATE INDEX "_insights_v_parent_idx" ON "_insights_v" USING btree ("parent_id");
  CREATE INDEX "_insights_v_version_version_slug_idx" ON "_insights_v" USING btree ("version_slug");
  CREATE INDEX "_insights_v_version_version_hero_image_idx" ON "_insights_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_insights_v_version_seo_version_seo_open_graph_image_idx" ON "_insights_v" USING btree ("version_seo_open_graph_image_id");
  CREATE INDEX "_insights_v_version_version_publication_status_idx" ON "_insights_v" USING btree ("version_publication_status");
  CREATE INDEX "_insights_v_version_version_updated_at_idx" ON "_insights_v" USING btree ("version_updated_at");
  CREATE INDEX "_insights_v_version_version_created_at_idx" ON "_insights_v" USING btree ("version_created_at");
  CREATE INDEX "_insights_v_created_at_idx" ON "_insights_v" USING btree ("created_at");
  CREATE INDEX "_insights_v_updated_at_idx" ON "_insights_v" USING btree ("updated_at");
  CREATE INDEX "_insights_v_rels_order_idx" ON "_insights_v_rels" USING btree ("order");
  CREATE INDEX "_insights_v_rels_parent_idx" ON "_insights_v_rels" USING btree ("parent_id");
  CREATE INDEX "_insights_v_rels_path_idx" ON "_insights_v_rels" USING btree ("path");
  CREATE INDEX "_insights_v_rels_products_id_idx" ON "_insights_v_rels" USING btree ("products_id");
  CREATE INDEX "_insights_v_rels_product_categories_id_idx" ON "_insights_v_rels" USING btree ("product_categories_id");
  CREATE INDEX "_insights_v_rels_applications_id_idx" ON "_insights_v_rels" USING btree ("applications_id");
  CREATE INDEX "_insights_v_rels_resources_id_idx" ON "_insights_v_rels" USING btree ("resources_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "technical_documents_slug_idx" ON "technical_documents" USING btree ("slug");
  CREATE INDEX "technical_documents_publication_status_idx" ON "technical_documents" USING btree ("publication_status");
  CREATE INDEX "_technical_documents_v_version_version_slug_idx" ON "_technical_documents_v" USING btree ("version_slug");
  CREATE INDEX "_technical_documents_v_version_version_publication_statu_idx" ON "_technical_documents_v" USING btree ("version_publication_status");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("insights_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights_related_industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v_version_related_industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_resources_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_insights_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_resources_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_insights_id_idx";
  DROP TABLE "resources" CASCADE;
  DROP TABLE "resources_rels" CASCADE;
  DROP TABLE "_resources_v" CASCADE;
  DROP TABLE "_resources_v_rels" CASCADE;
  DROP TABLE "insights_tags" CASCADE;
  DROP TABLE "insights_related_industries" CASCADE;
  DROP TABLE "insights" CASCADE;
  DROP TABLE "insights_rels" CASCADE;
  DROP TABLE "_insights_v_version_tags" CASCADE;
  DROP TABLE "_insights_v_version_related_industries" CASCADE;
  DROP TABLE "_insights_v" CASCADE;
  DROP TABLE "_insights_v_rels" CASCADE;
  DROP INDEX "technical_documents_slug_idx";
  DROP INDEX "technical_documents_publication_status_idx";
  DROP INDEX "_technical_documents_v_version_version_slug_idx";
  DROP INDEX "_technical_documents_v_version_version_publication_statu_idx";
  ALTER TABLE "technical_documents" DROP COLUMN "slug";
  ALTER TABLE "technical_documents" DROP COLUMN "publication_status";
  ALTER TABLE "_technical_documents_v" DROP COLUMN "version_slug";
  ALTER TABLE "_technical_documents_v" DROP COLUMN "version_publication_status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "resources_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "insights_id";
  DROP TYPE "public"."enum_resources_resource_type";
  DROP TYPE "public"."enum__resources_v_version_resource_type";
  DROP TYPE "public"."enum_insights_related_industries";
  DROP TYPE "public"."enum_insights_category";
  DROP TYPE "public"."enum__insights_v_version_related_industries";
  DROP TYPE "public"."enum__insights_v_version_category";`)
}
