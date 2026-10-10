import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_lines_pack_unit_snapshot" AS ENUM('ml', 'l', 'kg', 'g', 'unit', 'other');
  CREATE TYPE "public"."enum_orders_lines_container_snapshot" AS ENUM('bottle', 'can', 'pail', 'drum', 'container', 'other');
  CREATE TYPE "public"."enum_orders_lines_currency" AS ENUM('KES', 'USD', 'UGX', 'TZS', 'RWF');
  CREATE TYPE "public"."enum_orders_lines_tax_class_snapshot" AS ENUM('standard', 'zero-rated', 'exempt', 'unknown');
  CREATE TYPE "public"."enum_orders_lines_tax_treatment_snapshot" AS ENUM('unknown', 'included', 'excluded');
  CREATE TYPE "public"."enum_orders_source" AS ENUM('website-checkout', 'admin');
  CREATE TYPE "public"."enum_orders_delivery_method" AS ENUM('unconfigured', 'delivery', 'pickup');
  CREATE TYPE "public"."enum_orders_currency" AS ENUM('KES', 'USD', 'UGX', 'TZS', 'RWF');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending-payment', 'payment-processing', 'paid', 'processing', 'ready', 'completed', 'cancelled', 'payment-failed', 'refunded');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('unpaid', 'pending', 'paid', 'failed', 'cancelled', 'partially-refunded', 'refunded');
  CREATE TYPE "public"."enum_orders_payment_provider" AS ENUM('mpesa', 'card', 'bank', 'other');
  CREATE TYPE "public"."enum__orders_v_version_lines_pack_unit_snapshot" AS ENUM('ml', 'l', 'kg', 'g', 'unit', 'other');
  CREATE TYPE "public"."enum__orders_v_version_lines_container_snapshot" AS ENUM('bottle', 'can', 'pail', 'drum', 'container', 'other');
  CREATE TYPE "public"."enum__orders_v_version_lines_currency" AS ENUM('KES', 'USD', 'UGX', 'TZS', 'RWF');
  CREATE TYPE "public"."enum__orders_v_version_lines_tax_class_snapshot" AS ENUM('standard', 'zero-rated', 'exempt', 'unknown');
  CREATE TYPE "public"."enum__orders_v_version_lines_tax_treatment_snapshot" AS ENUM('unknown', 'included', 'excluded');
  CREATE TYPE "public"."enum__orders_v_version_source" AS ENUM('website-checkout', 'admin');
  CREATE TYPE "public"."enum__orders_v_version_delivery_method" AS ENUM('unconfigured', 'delivery', 'pickup');
  CREATE TYPE "public"."enum__orders_v_version_currency" AS ENUM('KES', 'USD', 'UGX', 'TZS', 'RWF');
  CREATE TYPE "public"."enum__orders_v_version_status" AS ENUM('pending-payment', 'payment-processing', 'paid', 'processing', 'ready', 'completed', 'cancelled', 'payment-failed', 'refunded');
  CREATE TYPE "public"."enum__orders_v_version_payment_status" AS ENUM('unpaid', 'pending', 'paid', 'failed', 'cancelled', 'partially-refunded', 'refunded');
  CREATE TYPE "public"."enum__orders_v_version_payment_provider" AS ENUM('mpesa', 'card', 'bank', 'other');
  CREATE TYPE "public"."enum_payment_transactions_provider" AS ENUM('mpesa', 'card', 'bank', 'other');
  CREATE TYPE "public"."enum_payment_transactions_currency" AS ENUM('KES', 'USD', 'UGX', 'TZS', 'RWF');
  CREATE TYPE "public"."enum_payment_transactions_status" AS ENUM('unpaid', 'pending', 'paid', 'failed', 'cancelled', 'partially-refunded', 'refunded');
  CREATE TYPE "public"."enum__payment_transactions_v_version_provider" AS ENUM('mpesa', 'card', 'bank', 'other');
  CREATE TYPE "public"."enum__payment_transactions_v_version_currency" AS ENUM('KES', 'USD', 'UGX', 'TZS', 'RWF');
  CREATE TYPE "public"."enum__payment_transactions_v_version_status" AS ENUM('unpaid', 'pending', 'paid', 'failed', 'cancelled', 'partially-refunded', 'refunded');
  CREATE TABLE "orders_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"offer_id" integer,
  	"product_id" integer,
  	"offer_id_snapshot" varchar NOT NULL,
  	"product_id_snapshot" varchar NOT NULL,
  	"product_name_snapshot" varchar NOT NULL,
  	"variant_name_snapshot" varchar,
  	"offer_name_snapshot" varchar NOT NULL,
  	"sku_snapshot" varchar,
  	"pack_size_snapshot" numeric,
  	"pack_unit_snapshot" "enum_orders_lines_pack_unit_snapshot",
  	"container_snapshot" "enum_orders_lines_container_snapshot",
  	"quantity" numeric NOT NULL,
  	"currency" "enum_orders_lines_currency" NOT NULL,
  	"regular_unit_price_minor" numeric NOT NULL,
  	"unit_price_minor" numeric NOT NULL,
  	"unit_discount_minor" numeric NOT NULL,
  	"tax_class_snapshot" "enum_orders_lines_tax_class_snapshot" NOT NULL,
  	"tax_treatment_snapshot" "enum_orders_lines_tax_treatment_snapshot" NOT NULL,
  	"line_subtotal_minor" numeric NOT NULL,
  	"line_discount_minor" numeric NOT NULL,
  	"line_tax_minor" numeric NOT NULL,
  	"line_total_minor" numeric NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference_number" varchar NOT NULL,
  	"idempotency_key" varchar NOT NULL,
  	"source" "enum_orders_source" DEFAULT 'website-checkout' NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"company" varchar,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"delivery_location" varchar NOT NULL,
  	"delivery_instructions" varchar,
  	"delivery_method" "enum_orders_delivery_method" DEFAULT 'unconfigured' NOT NULL,
  	"currency" "enum_orders_currency" NOT NULL,
  	"subtotal_minor" numeric NOT NULL,
  	"discount_total_minor" numeric NOT NULL,
  	"tax_total_minor" numeric NOT NULL,
  	"delivery_total_minor" numeric NOT NULL,
  	"grand_total_minor" numeric NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending-payment' NOT NULL,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'unpaid' NOT NULL,
  	"payment_provider" "enum_orders_payment_provider",
  	"payment_reference" varchar,
  	"internal_notes" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_orders_v_version_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"offer_id" integer,
  	"product_id" integer,
  	"offer_id_snapshot" varchar NOT NULL,
  	"product_id_snapshot" varchar NOT NULL,
  	"product_name_snapshot" varchar NOT NULL,
  	"variant_name_snapshot" varchar,
  	"offer_name_snapshot" varchar NOT NULL,
  	"sku_snapshot" varchar,
  	"pack_size_snapshot" numeric,
  	"pack_unit_snapshot" "enum__orders_v_version_lines_pack_unit_snapshot",
  	"container_snapshot" "enum__orders_v_version_lines_container_snapshot",
  	"quantity" numeric NOT NULL,
  	"currency" "enum__orders_v_version_lines_currency" NOT NULL,
  	"regular_unit_price_minor" numeric NOT NULL,
  	"unit_price_minor" numeric NOT NULL,
  	"unit_discount_minor" numeric NOT NULL,
  	"tax_class_snapshot" "enum__orders_v_version_lines_tax_class_snapshot" NOT NULL,
  	"tax_treatment_snapshot" "enum__orders_v_version_lines_tax_treatment_snapshot" NOT NULL,
  	"line_subtotal_minor" numeric NOT NULL,
  	"line_discount_minor" numeric NOT NULL,
  	"line_tax_minor" numeric NOT NULL,
  	"line_total_minor" numeric NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orders_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_reference_number" varchar NOT NULL,
  	"version_idempotency_key" varchar NOT NULL,
  	"version_source" "enum__orders_v_version_source" DEFAULT 'website-checkout' NOT NULL,
  	"version_customer_name" varchar NOT NULL,
  	"version_company" varchar,
  	"version_phone" varchar NOT NULL,
  	"version_email" varchar,
  	"version_delivery_location" varchar NOT NULL,
  	"version_delivery_instructions" varchar,
  	"version_delivery_method" "enum__orders_v_version_delivery_method" DEFAULT 'unconfigured' NOT NULL,
  	"version_currency" "enum__orders_v_version_currency" NOT NULL,
  	"version_subtotal_minor" numeric NOT NULL,
  	"version_discount_total_minor" numeric NOT NULL,
  	"version_tax_total_minor" numeric NOT NULL,
  	"version_delivery_total_minor" numeric NOT NULL,
  	"version_grand_total_minor" numeric NOT NULL,
  	"version_status" "enum__orders_v_version_status" DEFAULT 'pending-payment' NOT NULL,
  	"version_payment_status" "enum__orders_v_version_payment_status" DEFAULT 'unpaid' NOT NULL,
  	"version_payment_provider" "enum__orders_v_version_payment_provider",
  	"version_payment_reference" varchar,
  	"version_internal_notes" varchar,
  	"version_metadata" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payment_transactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer NOT NULL,
  	"provider" "enum_payment_transactions_provider" NOT NULL,
  	"provider_reference" varchar,
  	"amount_minor" numeric NOT NULL,
  	"currency" "enum_payment_transactions_currency" NOT NULL,
  	"status" "enum_payment_transactions_status" DEFAULT 'unpaid' NOT NULL,
  	"raw_event_reference" varchar,
  	"failure_code" varchar,
  	"failure_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_payment_transactions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_order_id" integer NOT NULL,
  	"version_provider" "enum__payment_transactions_v_version_provider" NOT NULL,
  	"version_provider_reference" varchar,
  	"version_amount_minor" numeric NOT NULL,
  	"version_currency" "enum__payment_transactions_v_version_currency" NOT NULL,
  	"version_status" "enum__payment_transactions_v_version_status" DEFAULT 'unpaid' NOT NULL,
  	"version_raw_event_reference" varchar,
  	"version_failure_code" varchar,
  	"version_failure_message" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payment_transactions_id" integer;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_offer_id_product_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."product_offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orders_v_version_lines" ADD CONSTRAINT "_orders_v_version_lines_offer_id_product_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."product_offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orders_v_version_lines" ADD CONSTRAINT "_orders_v_version_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orders_v_version_lines" ADD CONSTRAINT "_orders_v_version_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orders_v" ADD CONSTRAINT "_orders_v_parent_id_orders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v" ADD CONSTRAINT "_payment_transactions_v_parent_id_payment_transactions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payment_transactions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v" ADD CONSTRAINT "_payment_transactions_v_version_order_id_orders_id_fk" FOREIGN KEY ("version_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "orders_lines_order_idx" ON "orders_lines" USING btree ("_order");
  CREATE INDEX "orders_lines_parent_id_idx" ON "orders_lines" USING btree ("_parent_id");
  CREATE INDEX "orders_lines_offer_idx" ON "orders_lines" USING btree ("offer_id");
  CREATE INDEX "orders_lines_product_idx" ON "orders_lines" USING btree ("product_id");
  CREATE UNIQUE INDEX "orders_reference_number_idx" ON "orders" USING btree ("reference_number");
  CREATE UNIQUE INDEX "orders_idempotency_key_idx" ON "orders" USING btree ("idempotency_key");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "_orders_v_version_lines_order_idx" ON "_orders_v_version_lines" USING btree ("_order");
  CREATE INDEX "_orders_v_version_lines_parent_id_idx" ON "_orders_v_version_lines" USING btree ("_parent_id");
  CREATE INDEX "_orders_v_version_lines_offer_idx" ON "_orders_v_version_lines" USING btree ("offer_id");
  CREATE INDEX "_orders_v_version_lines_product_idx" ON "_orders_v_version_lines" USING btree ("product_id");
  CREATE INDEX "_orders_v_parent_idx" ON "_orders_v" USING btree ("parent_id");
  CREATE INDEX "_orders_v_version_version_reference_number_idx" ON "_orders_v" USING btree ("version_reference_number");
  CREATE INDEX "_orders_v_version_version_idempotency_key_idx" ON "_orders_v" USING btree ("version_idempotency_key");
  CREATE INDEX "_orders_v_version_version_updated_at_idx" ON "_orders_v" USING btree ("version_updated_at");
  CREATE INDEX "_orders_v_version_version_created_at_idx" ON "_orders_v" USING btree ("version_created_at");
  CREATE INDEX "_orders_v_created_at_idx" ON "_orders_v" USING btree ("created_at");
  CREATE INDEX "_orders_v_updated_at_idx" ON "_orders_v" USING btree ("updated_at");
  CREATE INDEX "payment_transactions_order_idx" ON "payment_transactions" USING btree ("order_id");
  CREATE UNIQUE INDEX "payment_transactions_provider_reference_idx" ON "payment_transactions" USING btree ("provider_reference");
  CREATE INDEX "payment_transactions_raw_event_reference_idx" ON "payment_transactions" USING btree ("raw_event_reference");
  CREATE INDEX "payment_transactions_updated_at_idx" ON "payment_transactions" USING btree ("updated_at");
  CREATE INDEX "payment_transactions_created_at_idx" ON "payment_transactions" USING btree ("created_at");
  CREATE INDEX "_payment_transactions_v_parent_idx" ON "_payment_transactions_v" USING btree ("parent_id");
  CREATE INDEX "_payment_transactions_v_version_version_order_idx" ON "_payment_transactions_v" USING btree ("version_order_id");
  CREATE INDEX "_payment_transactions_v_version_version_provider_referen_idx" ON "_payment_transactions_v" USING btree ("version_provider_reference");
  CREATE INDEX "_payment_transactions_v_version_version_raw_event_refere_idx" ON "_payment_transactions_v" USING btree ("version_raw_event_reference");
  CREATE INDEX "_payment_transactions_v_version_version_updated_at_idx" ON "_payment_transactions_v" USING btree ("version_updated_at");
  CREATE INDEX "_payment_transactions_v_version_version_created_at_idx" ON "_payment_transactions_v" USING btree ("version_created_at");
  CREATE INDEX "_payment_transactions_v_created_at_idx" ON "_payment_transactions_v" USING btree ("created_at");
  CREATE INDEX "_payment_transactions_v_updated_at_idx" ON "_payment_transactions_v" USING btree ("updated_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_transactions_fk" FOREIGN KEY ("payment_transactions_id") REFERENCES "public"."payment_transactions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_payment_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_transactions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payment_transactions_fk";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_payment_transactions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payment_transactions_id";
  ALTER TABLE "orders_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_orders_v_version_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_orders_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payment_transactions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_payment_transactions_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders_lines" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "_orders_v_version_lines" CASCADE;
  DROP TABLE "_orders_v" CASCADE;
  DROP TABLE "payment_transactions" CASCADE;
  DROP TABLE "_payment_transactions_v" CASCADE;
  DROP TYPE "public"."enum_orders_lines_pack_unit_snapshot";
  DROP TYPE "public"."enum_orders_lines_container_snapshot";
  DROP TYPE "public"."enum_orders_lines_currency";
  DROP TYPE "public"."enum_orders_lines_tax_class_snapshot";
  DROP TYPE "public"."enum_orders_lines_tax_treatment_snapshot";
  DROP TYPE "public"."enum_orders_source";
  DROP TYPE "public"."enum_orders_delivery_method";
  DROP TYPE "public"."enum_orders_currency";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_payment_provider";
  DROP TYPE "public"."enum__orders_v_version_lines_pack_unit_snapshot";
  DROP TYPE "public"."enum__orders_v_version_lines_container_snapshot";
  DROP TYPE "public"."enum__orders_v_version_lines_currency";
  DROP TYPE "public"."enum__orders_v_version_lines_tax_class_snapshot";
  DROP TYPE "public"."enum__orders_v_version_lines_tax_treatment_snapshot";
  DROP TYPE "public"."enum__orders_v_version_source";
  DROP TYPE "public"."enum__orders_v_version_delivery_method";
  DROP TYPE "public"."enum__orders_v_version_currency";
  DROP TYPE "public"."enum__orders_v_version_status";
  DROP TYPE "public"."enum__orders_v_version_payment_status";
  DROP TYPE "public"."enum__orders_v_version_payment_provider";
  DROP TYPE "public"."enum_payment_transactions_provider";
  DROP TYPE "public"."enum_payment_transactions_currency";
  DROP TYPE "public"."enum_payment_transactions_status";
  DROP TYPE "public"."enum__payment_transactions_v_version_provider";
  DROP TYPE "public"."enum__payment_transactions_v_version_currency";
  DROP TYPE "public"."enum__payment_transactions_v_version_status";`)
}
