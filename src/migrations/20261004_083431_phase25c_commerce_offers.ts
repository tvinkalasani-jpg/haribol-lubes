import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_product_offers_pack_unit" AS ENUM('ml', 'l', 'kg', 'g', 'unit', 'other');
  CREATE TYPE "public"."enum_product_offers_container_type" AS ENUM('bottle', 'can', 'pail', 'drum', 'container', 'other');
  CREATE TYPE "public"."enum_product_offers_commerce_mode" AS ENUM('quote-only', 'buy-online', 'both');
  CREATE TYPE "public"."enum_product_offers_price_visibility" AS ENUM('public', 'login-only', 'quote-only');
  CREATE TYPE "public"."enum_product_offers_currency" AS ENUM('KES', 'USD', 'UGX', 'TZS', 'RWF');
  CREATE TYPE "public"."enum_product_offers_promotion_label" AS ENUM('special-offer', 'limited-time-price', 'promotion');
  CREATE TYPE "public"."enum_product_offers_inventory_mode" AS ENUM('tracked', 'untracked', 'on-enquiry');
  CREATE TYPE "public"."enum_product_offers_availability_status" AS ENUM('in-stock', 'low-stock', 'out-of-stock', 'available-on-enquiry', 'preorder', 'discontinued');
  CREATE TYPE "public"."enum_product_offers_tax_class" AS ENUM('standard', 'zero-rated', 'exempt', 'unknown');
  CREATE TYPE "public"."enum_product_offers_tax_treatment" AS ENUM('unknown', 'included', 'excluded');
  CREATE TYPE "public"."enum__product_offers_v_version_pack_unit" AS ENUM('ml', 'l', 'kg', 'g', 'unit', 'other');
  CREATE TYPE "public"."enum__product_offers_v_version_container_type" AS ENUM('bottle', 'can', 'pail', 'drum', 'container', 'other');
  CREATE TYPE "public"."enum__product_offers_v_version_commerce_mode" AS ENUM('quote-only', 'buy-online', 'both');
  CREATE TYPE "public"."enum__product_offers_v_version_price_visibility" AS ENUM('public', 'login-only', 'quote-only');
  CREATE TYPE "public"."enum__product_offers_v_version_currency" AS ENUM('KES', 'USD', 'UGX', 'TZS', 'RWF');
  CREATE TYPE "public"."enum__product_offers_v_version_promotion_label" AS ENUM('special-offer', 'limited-time-price', 'promotion');
  CREATE TYPE "public"."enum__product_offers_v_version_inventory_mode" AS ENUM('tracked', 'untracked', 'on-enquiry');
  CREATE TYPE "public"."enum__product_offers_v_version_availability_status" AS ENUM('in-stock', 'low-stock', 'out-of-stock', 'available-on-enquiry', 'preorder', 'discontinued');
  CREATE TYPE "public"."enum__product_offers_v_version_tax_class" AS ENUM('standard', 'zero-rated', 'exempt', 'unknown');
  CREATE TYPE "public"."enum__product_offers_v_version_tax_treatment" AS ENUM('unknown', 'included', 'excluded');
  CREATE TABLE "product_offers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar NOT NULL,
  	"product_id" integer NOT NULL,
  	"variant_id" integer,
  	"sku" varchar,
  	"barcode" varchar,
  	"sort_order" numeric DEFAULT 100 NOT NULL,
  	"pack_size" numeric,
  	"pack_unit" "enum_product_offers_pack_unit",
  	"container_type" "enum_product_offers_container_type",
  	"commerce_mode" "enum_product_offers_commerce_mode" DEFAULT 'quote-only' NOT NULL,
  	"active" boolean DEFAULT false NOT NULL,
  	"price_visibility" "enum_product_offers_price_visibility" DEFAULT 'quote-only' NOT NULL,
  	"currency" "enum_product_offers_currency" DEFAULT 'KES' NOT NULL,
  	"regular_price_minor" numeric,
  	"sale_price_minor" numeric,
  	"promotion_label" "enum_product_offers_promotion_label",
  	"sale_start" timestamp(3) with time zone,
  	"sale_end" timestamp(3) with time zone,
  	"inventory_mode" "enum_product_offers_inventory_mode" DEFAULT 'on-enquiry' NOT NULL,
  	"stock_quantity" numeric,
  	"low_stock_threshold" numeric,
  	"availability_status" "enum_product_offers_availability_status" DEFAULT 'available-on-enquiry' NOT NULL,
  	"minimum_order_quantity" numeric,
  	"maximum_order_quantity" numeric,
  	"tax_class" "enum_product_offers_tax_class" DEFAULT 'unknown' NOT NULL,
  	"tax_treatment" "enum_product_offers_tax_treatment" DEFAULT 'unknown' NOT NULL,
  	"publication_status" "publish_status" DEFAULT 'draft' NOT NULL,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_offers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"markets_id" integer
  );
  
  CREATE TABLE "_product_offers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_display_name" varchar NOT NULL,
  	"version_product_id" integer NOT NULL,
  	"version_variant_id" integer,
  	"version_sku" varchar,
  	"version_barcode" varchar,
  	"version_sort_order" numeric DEFAULT 100 NOT NULL,
  	"version_pack_size" numeric,
  	"version_pack_unit" "enum__product_offers_v_version_pack_unit",
  	"version_container_type" "enum__product_offers_v_version_container_type",
  	"version_commerce_mode" "enum__product_offers_v_version_commerce_mode" DEFAULT 'quote-only' NOT NULL,
  	"version_active" boolean DEFAULT false NOT NULL,
  	"version_price_visibility" "enum__product_offers_v_version_price_visibility" DEFAULT 'quote-only' NOT NULL,
  	"version_currency" "enum__product_offers_v_version_currency" DEFAULT 'KES' NOT NULL,
  	"version_regular_price_minor" numeric,
  	"version_sale_price_minor" numeric,
  	"version_promotion_label" "enum__product_offers_v_version_promotion_label",
  	"version_sale_start" timestamp(3) with time zone,
  	"version_sale_end" timestamp(3) with time zone,
  	"version_inventory_mode" "enum__product_offers_v_version_inventory_mode" DEFAULT 'on-enquiry' NOT NULL,
  	"version_stock_quantity" numeric,
  	"version_low_stock_threshold" numeric,
  	"version_availability_status" "enum__product_offers_v_version_availability_status" DEFAULT 'available-on-enquiry' NOT NULL,
  	"version_minimum_order_quantity" numeric,
  	"version_maximum_order_quantity" numeric,
  	"version_tax_class" "enum__product_offers_v_version_tax_class" DEFAULT 'unknown' NOT NULL,
  	"version_tax_treatment" "enum__product_offers_v_version_tax_treatment" DEFAULT 'unknown' NOT NULL,
  	"version_publication_status" "publish_status" DEFAULT 'draft' NOT NULL,
  	"version_verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_product_offers_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"markets_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "product_offers_id" integer;
  ALTER TABLE "product_offers" ADD CONSTRAINT "product_offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_offers" ADD CONSTRAINT "product_offers_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_offers_rels" ADD CONSTRAINT "product_offers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_offers_rels" ADD CONSTRAINT "product_offers_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_offers_v" ADD CONSTRAINT "_product_offers_v_parent_id_product_offers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_offers_v" ADD CONSTRAINT "_product_offers_v_version_product_id_products_id_fk" FOREIGN KEY ("version_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_offers_v" ADD CONSTRAINT "_product_offers_v_version_variant_id_product_variants_id_fk" FOREIGN KEY ("version_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_offers_v_rels" ADD CONSTRAINT "_product_offers_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_product_offers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_offers_v_rels" ADD CONSTRAINT "_product_offers_v_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "product_offers_product_idx" ON "product_offers" USING btree ("product_id");
  CREATE INDEX "product_offers_variant_idx" ON "product_offers" USING btree ("variant_id");
  CREATE UNIQUE INDEX "product_offers_sku_idx" ON "product_offers" USING btree ("sku");
  CREATE INDEX "product_offers_publication_status_idx" ON "product_offers" USING btree ("publication_status");
  CREATE INDEX "product_offers_updated_at_idx" ON "product_offers" USING btree ("updated_at");
  CREATE INDEX "product_offers_created_at_idx" ON "product_offers" USING btree ("created_at");
  CREATE INDEX "product_offers_rels_order_idx" ON "product_offers_rels" USING btree ("order");
  CREATE INDEX "product_offers_rels_parent_idx" ON "product_offers_rels" USING btree ("parent_id");
  CREATE INDEX "product_offers_rels_path_idx" ON "product_offers_rels" USING btree ("path");
  CREATE INDEX "product_offers_rels_markets_id_idx" ON "product_offers_rels" USING btree ("markets_id");
  CREATE INDEX "_product_offers_v_parent_idx" ON "_product_offers_v" USING btree ("parent_id");
  CREATE INDEX "_product_offers_v_version_version_product_idx" ON "_product_offers_v" USING btree ("version_product_id");
  CREATE INDEX "_product_offers_v_version_version_variant_idx" ON "_product_offers_v" USING btree ("version_variant_id");
  CREATE INDEX "_product_offers_v_version_version_sku_idx" ON "_product_offers_v" USING btree ("version_sku");
  CREATE INDEX "_product_offers_v_version_version_publication_status_idx" ON "_product_offers_v" USING btree ("version_publication_status");
  CREATE INDEX "_product_offers_v_version_version_updated_at_idx" ON "_product_offers_v" USING btree ("version_updated_at");
  CREATE INDEX "_product_offers_v_version_version_created_at_idx" ON "_product_offers_v" USING btree ("version_created_at");
  CREATE INDEX "_product_offers_v_created_at_idx" ON "_product_offers_v" USING btree ("created_at");
  CREATE INDEX "_product_offers_v_updated_at_idx" ON "_product_offers_v" USING btree ("updated_at");
  CREATE INDEX "_product_offers_v_rels_order_idx" ON "_product_offers_v_rels" USING btree ("order");
  CREATE INDEX "_product_offers_v_rels_parent_idx" ON "_product_offers_v_rels" USING btree ("parent_id");
  CREATE INDEX "_product_offers_v_rels_path_idx" ON "_product_offers_v_rels" USING btree ("path");
  CREATE INDEX "_product_offers_v_rels_markets_id_idx" ON "_product_offers_v_rels" USING btree ("markets_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_offers_fk" FOREIGN KEY ("product_offers_id") REFERENCES "public"."product_offers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_product_offers_id_idx" ON "payload_locked_documents_rels" USING btree ("product_offers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_offers_fk";
  DROP INDEX "payload_locked_documents_rels_product_offers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "product_offers_id";
  ALTER TABLE "product_offers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "product_offers_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_product_offers_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_product_offers_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "product_offers" CASCADE;
  DROP TABLE "product_offers_rels" CASCADE;
  DROP TABLE "_product_offers_v" CASCADE;
  DROP TABLE "_product_offers_v_rels" CASCADE;
  DROP TYPE "public"."enum_product_offers_pack_unit";
  DROP TYPE "public"."enum_product_offers_container_type";
  DROP TYPE "public"."enum_product_offers_commerce_mode";
  DROP TYPE "public"."enum_product_offers_price_visibility";
  DROP TYPE "public"."enum_product_offers_currency";
  DROP TYPE "public"."enum_product_offers_promotion_label";
  DROP TYPE "public"."enum_product_offers_inventory_mode";
  DROP TYPE "public"."enum_product_offers_availability_status";
  DROP TYPE "public"."enum_product_offers_tax_class";
  DROP TYPE "public"."enum_product_offers_tax_treatment";
  DROP TYPE "public"."enum__product_offers_v_version_pack_unit";
  DROP TYPE "public"."enum__product_offers_v_version_container_type";
  DROP TYPE "public"."enum__product_offers_v_version_commerce_mode";
  DROP TYPE "public"."enum__product_offers_v_version_price_visibility";
  DROP TYPE "public"."enum__product_offers_v_version_currency";
  DROP TYPE "public"."enum__product_offers_v_version_promotion_label";
  DROP TYPE "public"."enum__product_offers_v_version_inventory_mode";
  DROP TYPE "public"."enum__product_offers_v_version_availability_status";
  DROP TYPE "public"."enum__product_offers_v_version_tax_class";
  DROP TYPE "public"."enum__product_offers_v_version_tax_treatment";`)
}
