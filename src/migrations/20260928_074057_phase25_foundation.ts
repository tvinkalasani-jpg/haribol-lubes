import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_media_source_type" AS ENUM('supplier-original', 'catalogue-extract', 'project-generated', 'cms');
  CREATE TYPE "public"."verify_status" AS ENUM('verified', 'catalogue-derived', 'needs-review', 'unverified', 'deprecated');
  CREATE TYPE "public"."enum_brands_status" AS ENUM('active', 'provisional', 'inactive');
  CREATE TYPE "public"."enum_brands_brand_type" AS ENUM('owned', 'partner', 'distributed', 'unverified');
  CREATE TYPE "public"."enum__brands_v_version_status" AS ENUM('active', 'provisional', 'inactive');
  CREATE TYPE "public"."enum__brands_v_version_brand_type" AS ENUM('owned', 'partner', 'distributed', 'unverified');
  CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_specifications_classification_type" AS ENUM('viscosity-grade', 'api-performance', 'gl', 'dexron', 'to-4', 'mt-1', 'oem-approval', 'technical-classification');
  CREATE TYPE "public"."enum__specifications_v_version_classification_type" AS ENUM('viscosity-grade', 'api-performance', 'gl', 'dexron', 'to-4', 'mt-1', 'oem-approval', 'technical-classification');
  CREATE TYPE "public"."enum_markets_status" AS ENUM('active', 'planned', 'inactive');
  CREATE TYPE "public"."enum__markets_v_version_status" AS ENUM('active', 'planned', 'inactive');
  CREATE TYPE "public"."enum_products_images_role" AS ENUM('hero', 'packshot', 'label', 'technical', 'gallery');
  CREATE TYPE "public"."enum__products_v_version_images_role" AS ENUM('hero', 'packshot', 'label', 'technical', 'gallery');
  CREATE TYPE "public"."enum_product_variants_kind" AS ENUM('formulation', 'packaging', 'formulation-and-packaging');
  CREATE TYPE "public"."enum_product_variants_pack_unit" AS ENUM('ml', 'l', 'kg', 'g', 'unit');
  CREATE TYPE "public"."enum_product_variants_availability_status" AS ENUM('available', 'enquiry-only', 'coming-soon', 'unavailable', 'needs-confirmation');
  CREATE TYPE "public"."enum__product_variants_v_version_kind" AS ENUM('formulation', 'packaging', 'formulation-and-packaging');
  CREATE TYPE "public"."enum__product_variants_v_version_pack_unit" AS ENUM('ml', 'l', 'kg', 'g', 'unit');
  CREATE TYPE "public"."enum__product_variants_v_version_availability_status" AS ENUM('available', 'enquiry-only', 'coming-soon', 'unavailable', 'needs-confirmation');
  CREATE TYPE "public"."enum_technical_documents_document_type" AS ENUM('tds', 'sds', 'certificate', 'brochure', 'approval', 'other');
  CREATE TYPE "public"."enum__technical_documents_v_version_document_type" AS ENUM('tds', 'sds', 'certificate', 'brochure', 'approval', 'other');
  CREATE TYPE "public"."enum_enquiries_status" AS ENUM('received', 'reviewing', 'contacted', 'quoted', 'closed');
  CREATE TYPE "public"."enum_enquiries_notification_status" AS ENUM('pending', 'sent', 'failed', 'unavailable');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"source_type" "enum_media_source_type" DEFAULT 'cms' NOT NULL,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"short_description" varchar NOT NULL,
  	"status" "enum_brands_status" NOT NULL,
  	"featured" boolean DEFAULT false,
  	"brand_type" "enum_brands_brand_type" NOT NULL,
  	"logo_id" integer,
  	"accent" varchar,
  	"notes" varchar,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_brands_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_short_description" varchar NOT NULL,
  	"version_status" "enum__brands_v_version_status" NOT NULL,
  	"version_featured" boolean DEFAULT false,
  	"version_brand_type" "enum__brands_v_version_brand_type" NOT NULL,
  	"version_logo_id" integer,
  	"version_accent" varchar,
  	"version_notes" varchar,
  	"version_verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"parent_id" integer,
  	"display_order" numeric DEFAULT 100 NOT NULL,
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
  
  CREATE TABLE "_product_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_description" varchar NOT NULL,
  	"version_parent_id" integer,
  	"version_display_order" numeric DEFAULT 100 NOT NULL,
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
  
  CREATE TABLE "applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"display_order" numeric DEFAULT 100 NOT NULL,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_applications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_description" varchar NOT NULL,
  	"version_display_order" numeric DEFAULT 100 NOT NULL,
  	"version_verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "specifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"classification_type" "enum_specifications_classification_type" NOT NULL,
  	"description" varchar,
  	"issuing_body" varchar,
  	"is_approval" boolean DEFAULT false,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_specifications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_code" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_classification_type" "enum__specifications_v_version_classification_type" NOT NULL,
  	"version_description" varchar,
  	"version_issuing_body" varchar,
  	"version_is_approval" boolean DEFAULT false,
  	"version_verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "markets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"region" varchar DEFAULT 'East Africa' NOT NULL,
  	"status" "enum_markets_status" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_markets_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_code" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_region" varchar DEFAULT 'East Africa' NOT NULL,
  	"version_status" "enum__markets_v_version_status" NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "tech_props" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"property_name" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"unit" varchar,
  	"test_method" varchar,
  	"conditions" varchar,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL
  );
  
  CREATE TABLE "products_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"role" "enum_products_images_role" NOT NULL,
  	"display_order" numeric DEFAULT 100
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"brand_id" integer NOT NULL,
  	"primary_category_id" integer NOT NULL,
  	"product_family" varchar,
  	"short_description" varchar NOT NULL,
  	"description" varchar,
  	"lubricant_type" varchar,
  	"base_oil_type" varchar,
  	"source_reference" varchar NOT NULL,
  	"last_reviewed_at" timestamp(3) with time zone,
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
  
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"product_categories_id" integer,
  	"applications_id" integer,
  	"specifications_id" integer,
  	"markets_id" integer,
  	"technical_documents_id" integer
  );
  
  CREATE TABLE "_products_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tech_props_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"property_name" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"unit" varchar,
  	"test_method" varchar,
  	"conditions" varchar,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"role" "enum__products_v_version_images_role" NOT NULL,
  	"display_order" numeric DEFAULT 100,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_brand_id" integer NOT NULL,
  	"version_primary_category_id" integer NOT NULL,
  	"version_product_family" varchar,
  	"version_short_description" varchar NOT NULL,
  	"version_description" varchar,
  	"version_lubricant_type" varchar,
  	"version_base_oil_type" varchar,
  	"version_source_reference" varchar NOT NULL,
  	"version_last_reviewed_at" timestamp(3) with time zone,
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
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"product_categories_id" integer,
  	"applications_id" integer,
  	"specifications_id" integer,
  	"markets_id" integer,
  	"technical_documents_id" integer
  );
  
  CREATE TABLE "product_variants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"product_id" integer NOT NULL,
  	"kind" "enum_product_variants_kind" NOT NULL,
  	"sku" varchar,
  	"product_code" varchar,
  	"viscosity_grade" varchar,
  	"pack_size" numeric,
  	"pack_unit" "enum_product_variants_pack_unit",
  	"container_type" varchar,
  	"availability_status" "enum_product_variants_availability_status" DEFAULT 'needs-confirmation' NOT NULL,
  	"source_reference" varchar,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_variants_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"specifications_id" integer,
  	"markets_id" integer
  );
  
  CREATE TABLE "_product_variants_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_product_id" integer NOT NULL,
  	"version_kind" "enum__product_variants_v_version_kind" NOT NULL,
  	"version_sku" varchar,
  	"version_product_code" varchar,
  	"version_viscosity_grade" varchar,
  	"version_pack_size" numeric,
  	"version_pack_unit" "enum__product_variants_v_version_pack_unit",
  	"version_container_type" varchar,
  	"version_availability_status" "enum__product_variants_v_version_availability_status" DEFAULT 'needs-confirmation' NOT NULL,
  	"version_source_reference" varchar,
  	"version_verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_product_variants_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"specifications_id" integer,
  	"markets_id" integer
  );
  
  CREATE TABLE "technical_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"document_type" "enum_technical_documents_document_type" NOT NULL,
  	"file_id" integer NOT NULL,
  	"version" varchar,
  	"language" varchar DEFAULT 'en' NOT NULL,
  	"effective_date" timestamp(3) with time zone,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "technical_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"markets_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_technical_documents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_document_type" "enum__technical_documents_v_version_document_type" NOT NULL,
  	"version_file_id" integer NOT NULL,
  	"version_version" varchar,
  	"version_language" varchar DEFAULT 'en' NOT NULL,
  	"version_effective_date" timestamp(3) with time zone,
  	"version_verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_technical_documents_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"markets_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference_number" varchar NOT NULL,
  	"idempotency_key" varchar NOT NULL,
  	"status" "enum_enquiries_status" NOT NULL,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"business_type" varchar,
  	"source" varchar NOT NULL,
  	"source_page" varchar NOT NULL,
  	"product_id" integer,
  	"product_id_snapshot" varchar,
  	"product_slug_snapshot" varchar,
  	"category_snapshot" varchar,
  	"grade_or_viscosity" varchar,
  	"specification" varchar,
  	"application" varchar,
  	"quantity" numeric,
  	"quantity_unit" varchar,
  	"location" varchar NOT NULL,
  	"message" varchar,
  	"consent_recorded_at" timestamp(3) with time zone NOT NULL,
  	"notification_status" "enum_enquiries_notification_status" NOT NULL,
  	"notification_attempts" numeric DEFAULT 0 NOT NULL,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"brands_id" integer,
  	"product_categories_id" integer,
  	"applications_id" integer,
  	"specifications_id" integer,
  	"markets_id" integer,
  	"products_id" integer,
  	"product_variants_id" integer,
  	"technical_documents_id" integer,
  	"enquiries_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_parent_id_brands_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_categories_v" ADD CONSTRAINT "_product_categories_v_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_categories_v" ADD CONSTRAINT "_product_categories_v_version_parent_id_product_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_categories_v" ADD CONSTRAINT "_product_categories_v_version_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("version_seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_applications_v" ADD CONSTRAINT "_applications_v_parent_id_applications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."applications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_specifications_v" ADD CONSTRAINT "_specifications_v_parent_id_specifications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."specifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_markets_v" ADD CONSTRAINT "_markets_v_parent_id_markets_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."markets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_benefits" ADD CONSTRAINT "products_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tech_props" ADD CONSTRAINT "tech_props_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_primary_category_id_product_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_specifications_fk" FOREIGN KEY ("specifications_id") REFERENCES "public"."specifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_technical_documents_fk" FOREIGN KEY ("technical_documents_id") REFERENCES "public"."technical_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_benefits" ADD CONSTRAINT "_products_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tech_props_v" ADD CONSTRAINT "_tech_props_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_primary_category_id_product_categories_id_fk" FOREIGN KEY ("version_primary_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_seo_open_graph_image_id_media_id_fk" FOREIGN KEY ("version_seo_open_graph_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_specifications_fk" FOREIGN KEY ("specifications_id") REFERENCES "public"."specifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_technical_documents_fk" FOREIGN KEY ("technical_documents_id") REFERENCES "public"."technical_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_variants_rels" ADD CONSTRAINT "product_variants_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_variants_rels" ADD CONSTRAINT "product_variants_rels_specifications_fk" FOREIGN KEY ("specifications_id") REFERENCES "public"."specifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_variants_rels" ADD CONSTRAINT "product_variants_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_variants_v" ADD CONSTRAINT "_product_variants_v_parent_id_product_variants_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_variants_v" ADD CONSTRAINT "_product_variants_v_version_product_id_products_id_fk" FOREIGN KEY ("version_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_variants_v_rels" ADD CONSTRAINT "_product_variants_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_product_variants_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_variants_v_rels" ADD CONSTRAINT "_product_variants_v_rels_specifications_fk" FOREIGN KEY ("specifications_id") REFERENCES "public"."specifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_variants_v_rels" ADD CONSTRAINT "_product_variants_v_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technical_documents" ADD CONSTRAINT "technical_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technical_documents_rels" ADD CONSTRAINT "technical_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."technical_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technical_documents_rels" ADD CONSTRAINT "technical_documents_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technical_documents_rels" ADD CONSTRAINT "technical_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technical_documents_v" ADD CONSTRAINT "_technical_documents_v_parent_id_technical_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."technical_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technical_documents_v" ADD CONSTRAINT "_technical_documents_v_version_file_id_media_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technical_documents_v_rels" ADD CONSTRAINT "_technical_documents_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_technical_documents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technical_documents_v_rels" ADD CONSTRAINT "_technical_documents_v_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technical_documents_v_rels" ADD CONSTRAINT "_technical_documents_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_specifications_fk" FOREIGN KEY ("specifications_id") REFERENCES "public"."specifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_variants_fk" FOREIGN KEY ("product_variants_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_technical_documents_fk" FOREIGN KEY ("technical_documents_id") REFERENCES "public"."technical_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "_brands_v_parent_idx" ON "_brands_v" USING btree ("parent_id");
  CREATE INDEX "_brands_v_version_version_slug_idx" ON "_brands_v" USING btree ("version_slug");
  CREATE INDEX "_brands_v_version_version_logo_idx" ON "_brands_v" USING btree ("version_logo_id");
  CREATE INDEX "_brands_v_version_version_updated_at_idx" ON "_brands_v" USING btree ("version_updated_at");
  CREATE INDEX "_brands_v_version_version_created_at_idx" ON "_brands_v" USING btree ("version_created_at");
  CREATE INDEX "_brands_v_created_at_idx" ON "_brands_v" USING btree ("created_at");
  CREATE INDEX "_brands_v_updated_at_idx" ON "_brands_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "product_categories_slug_idx" ON "product_categories" USING btree ("slug");
  CREATE INDEX "product_categories_parent_idx" ON "product_categories" USING btree ("parent_id");
  CREATE INDEX "product_categories_seo_seo_open_graph_image_idx" ON "product_categories" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "product_categories_publication_status_idx" ON "product_categories" USING btree ("publication_status");
  CREATE INDEX "product_categories_updated_at_idx" ON "product_categories" USING btree ("updated_at");
  CREATE INDEX "product_categories_created_at_idx" ON "product_categories" USING btree ("created_at");
  CREATE INDEX "_product_categories_v_parent_idx" ON "_product_categories_v" USING btree ("parent_id");
  CREATE INDEX "_product_categories_v_version_version_slug_idx" ON "_product_categories_v" USING btree ("version_slug");
  CREATE INDEX "_product_categories_v_version_version_parent_idx" ON "_product_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_product_categories_v_version_seo_version_seo_open_graph_idx" ON "_product_categories_v" USING btree ("version_seo_open_graph_image_id");
  CREATE INDEX "_product_categories_v_version_version_publication_status_idx" ON "_product_categories_v" USING btree ("version_publication_status");
  CREATE INDEX "_product_categories_v_version_version_updated_at_idx" ON "_product_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_product_categories_v_version_version_created_at_idx" ON "_product_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_product_categories_v_created_at_idx" ON "_product_categories_v" USING btree ("created_at");
  CREATE INDEX "_product_categories_v_updated_at_idx" ON "_product_categories_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "applications_slug_idx" ON "applications" USING btree ("slug");
  CREATE INDEX "applications_updated_at_idx" ON "applications" USING btree ("updated_at");
  CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");
  CREATE INDEX "_applications_v_parent_idx" ON "_applications_v" USING btree ("parent_id");
  CREATE INDEX "_applications_v_version_version_slug_idx" ON "_applications_v" USING btree ("version_slug");
  CREATE INDEX "_applications_v_version_version_updated_at_idx" ON "_applications_v" USING btree ("version_updated_at");
  CREATE INDEX "_applications_v_version_version_created_at_idx" ON "_applications_v" USING btree ("version_created_at");
  CREATE INDEX "_applications_v_created_at_idx" ON "_applications_v" USING btree ("created_at");
  CREATE INDEX "_applications_v_updated_at_idx" ON "_applications_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "specifications_code_idx" ON "specifications" USING btree ("code");
  CREATE UNIQUE INDEX "specifications_slug_idx" ON "specifications" USING btree ("slug");
  CREATE INDEX "specifications_updated_at_idx" ON "specifications" USING btree ("updated_at");
  CREATE INDEX "specifications_created_at_idx" ON "specifications" USING btree ("created_at");
  CREATE INDEX "_specifications_v_parent_idx" ON "_specifications_v" USING btree ("parent_id");
  CREATE INDEX "_specifications_v_version_version_code_idx" ON "_specifications_v" USING btree ("version_code");
  CREATE INDEX "_specifications_v_version_version_slug_idx" ON "_specifications_v" USING btree ("version_slug");
  CREATE INDEX "_specifications_v_version_version_updated_at_idx" ON "_specifications_v" USING btree ("version_updated_at");
  CREATE INDEX "_specifications_v_version_version_created_at_idx" ON "_specifications_v" USING btree ("version_created_at");
  CREATE INDEX "_specifications_v_created_at_idx" ON "_specifications_v" USING btree ("created_at");
  CREATE INDEX "_specifications_v_updated_at_idx" ON "_specifications_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "markets_code_idx" ON "markets" USING btree ("code");
  CREATE UNIQUE INDEX "markets_slug_idx" ON "markets" USING btree ("slug");
  CREATE INDEX "markets_updated_at_idx" ON "markets" USING btree ("updated_at");
  CREATE INDEX "markets_created_at_idx" ON "markets" USING btree ("created_at");
  CREATE INDEX "_markets_v_parent_idx" ON "_markets_v" USING btree ("parent_id");
  CREATE INDEX "_markets_v_version_version_code_idx" ON "_markets_v" USING btree ("version_code");
  CREATE INDEX "_markets_v_version_version_slug_idx" ON "_markets_v" USING btree ("version_slug");
  CREATE INDEX "_markets_v_version_version_updated_at_idx" ON "_markets_v" USING btree ("version_updated_at");
  CREATE INDEX "_markets_v_version_version_created_at_idx" ON "_markets_v" USING btree ("version_created_at");
  CREATE INDEX "_markets_v_created_at_idx" ON "_markets_v" USING btree ("created_at");
  CREATE INDEX "_markets_v_updated_at_idx" ON "_markets_v" USING btree ("updated_at");
  CREATE INDEX "products_benefits_order_idx" ON "products_benefits" USING btree ("_order");
  CREATE INDEX "products_benefits_parent_id_idx" ON "products_benefits" USING btree ("_parent_id");
  CREATE INDEX "tech_props_order_idx" ON "tech_props" USING btree ("_order");
  CREATE INDEX "tech_props_parent_id_idx" ON "tech_props" USING btree ("_parent_id");
  CREATE INDEX "products_images_order_idx" ON "products_images" USING btree ("_order");
  CREATE INDEX "products_images_parent_id_idx" ON "products_images" USING btree ("_parent_id");
  CREATE INDEX "products_images_image_idx" ON "products_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "products_primary_category_idx" ON "products" USING btree ("primary_category_id");
  CREATE INDEX "products_seo_seo_open_graph_image_idx" ON "products" USING btree ("seo_open_graph_image_id");
  CREATE INDEX "products_publication_status_idx" ON "products" USING btree ("publication_status");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_product_categories_id_idx" ON "products_rels" USING btree ("product_categories_id");
  CREATE INDEX "products_rels_applications_id_idx" ON "products_rels" USING btree ("applications_id");
  CREATE INDEX "products_rels_specifications_id_idx" ON "products_rels" USING btree ("specifications_id");
  CREATE INDEX "products_rels_markets_id_idx" ON "products_rels" USING btree ("markets_id");
  CREATE INDEX "products_rels_technical_documents_id_idx" ON "products_rels" USING btree ("technical_documents_id");
  CREATE INDEX "_products_v_version_benefits_order_idx" ON "_products_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_products_v_version_benefits_parent_id_idx" ON "_products_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_tech_props_v_order_idx" ON "_tech_props_v" USING btree ("_order");
  CREATE INDEX "_tech_props_v_parent_id_idx" ON "_tech_props_v" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_images_order_idx" ON "_products_v_version_images" USING btree ("_order");
  CREATE INDEX "_products_v_version_images_parent_id_idx" ON "_products_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_images_image_idx" ON "_products_v_version_images" USING btree ("image_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_version_primary_category_idx" ON "_products_v" USING btree ("version_primary_category_id");
  CREATE INDEX "_products_v_version_seo_version_seo_open_graph_image_idx" ON "_products_v" USING btree ("version_seo_open_graph_image_id");
  CREATE INDEX "_products_v_version_version_publication_status_idx" ON "_products_v" USING btree ("version_publication_status");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_product_categories_id_idx" ON "_products_v_rels" USING btree ("product_categories_id");
  CREATE INDEX "_products_v_rels_applications_id_idx" ON "_products_v_rels" USING btree ("applications_id");
  CREATE INDEX "_products_v_rels_specifications_id_idx" ON "_products_v_rels" USING btree ("specifications_id");
  CREATE INDEX "_products_v_rels_markets_id_idx" ON "_products_v_rels" USING btree ("markets_id");
  CREATE INDEX "_products_v_rels_technical_documents_id_idx" ON "_products_v_rels" USING btree ("technical_documents_id");
  CREATE UNIQUE INDEX "product_variants_slug_idx" ON "product_variants" USING btree ("slug");
  CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");
  CREATE UNIQUE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");
  CREATE INDEX "product_variants_updated_at_idx" ON "product_variants" USING btree ("updated_at");
  CREATE INDEX "product_variants_created_at_idx" ON "product_variants" USING btree ("created_at");
  CREATE INDEX "product_variants_rels_order_idx" ON "product_variants_rels" USING btree ("order");
  CREATE INDEX "product_variants_rels_parent_idx" ON "product_variants_rels" USING btree ("parent_id");
  CREATE INDEX "product_variants_rels_path_idx" ON "product_variants_rels" USING btree ("path");
  CREATE INDEX "product_variants_rels_specifications_id_idx" ON "product_variants_rels" USING btree ("specifications_id");
  CREATE INDEX "product_variants_rels_markets_id_idx" ON "product_variants_rels" USING btree ("markets_id");
  CREATE INDEX "_product_variants_v_parent_idx" ON "_product_variants_v" USING btree ("parent_id");
  CREATE INDEX "_product_variants_v_version_version_slug_idx" ON "_product_variants_v" USING btree ("version_slug");
  CREATE INDEX "_product_variants_v_version_version_product_idx" ON "_product_variants_v" USING btree ("version_product_id");
  CREATE INDEX "_product_variants_v_version_version_sku_idx" ON "_product_variants_v" USING btree ("version_sku");
  CREATE INDEX "_product_variants_v_version_version_updated_at_idx" ON "_product_variants_v" USING btree ("version_updated_at");
  CREATE INDEX "_product_variants_v_version_version_created_at_idx" ON "_product_variants_v" USING btree ("version_created_at");
  CREATE INDEX "_product_variants_v_created_at_idx" ON "_product_variants_v" USING btree ("created_at");
  CREATE INDEX "_product_variants_v_updated_at_idx" ON "_product_variants_v" USING btree ("updated_at");
  CREATE INDEX "_product_variants_v_rels_order_idx" ON "_product_variants_v_rels" USING btree ("order");
  CREATE INDEX "_product_variants_v_rels_parent_idx" ON "_product_variants_v_rels" USING btree ("parent_id");
  CREATE INDEX "_product_variants_v_rels_path_idx" ON "_product_variants_v_rels" USING btree ("path");
  CREATE INDEX "_product_variants_v_rels_specifications_id_idx" ON "_product_variants_v_rels" USING btree ("specifications_id");
  CREATE INDEX "_product_variants_v_rels_markets_id_idx" ON "_product_variants_v_rels" USING btree ("markets_id");
  CREATE INDEX "technical_documents_file_idx" ON "technical_documents" USING btree ("file_id");
  CREATE INDEX "technical_documents_updated_at_idx" ON "technical_documents" USING btree ("updated_at");
  CREATE INDEX "technical_documents_created_at_idx" ON "technical_documents" USING btree ("created_at");
  CREATE INDEX "technical_documents_rels_order_idx" ON "technical_documents_rels" USING btree ("order");
  CREATE INDEX "technical_documents_rels_parent_idx" ON "technical_documents_rels" USING btree ("parent_id");
  CREATE INDEX "technical_documents_rels_path_idx" ON "technical_documents_rels" USING btree ("path");
  CREATE INDEX "technical_documents_rels_markets_id_idx" ON "technical_documents_rels" USING btree ("markets_id");
  CREATE INDEX "technical_documents_rels_products_id_idx" ON "technical_documents_rels" USING btree ("products_id");
  CREATE INDEX "_technical_documents_v_parent_idx" ON "_technical_documents_v" USING btree ("parent_id");
  CREATE INDEX "_technical_documents_v_version_version_file_idx" ON "_technical_documents_v" USING btree ("version_file_id");
  CREATE INDEX "_technical_documents_v_version_version_updated_at_idx" ON "_technical_documents_v" USING btree ("version_updated_at");
  CREATE INDEX "_technical_documents_v_version_version_created_at_idx" ON "_technical_documents_v" USING btree ("version_created_at");
  CREATE INDEX "_technical_documents_v_created_at_idx" ON "_technical_documents_v" USING btree ("created_at");
  CREATE INDEX "_technical_documents_v_updated_at_idx" ON "_technical_documents_v" USING btree ("updated_at");
  CREATE INDEX "_technical_documents_v_rels_order_idx" ON "_technical_documents_v_rels" USING btree ("order");
  CREATE INDEX "_technical_documents_v_rels_parent_idx" ON "_technical_documents_v_rels" USING btree ("parent_id");
  CREATE INDEX "_technical_documents_v_rels_path_idx" ON "_technical_documents_v_rels" USING btree ("path");
  CREATE INDEX "_technical_documents_v_rels_markets_id_idx" ON "_technical_documents_v_rels" USING btree ("markets_id");
  CREATE INDEX "_technical_documents_v_rels_products_id_idx" ON "_technical_documents_v_rels" USING btree ("products_id");
  CREATE UNIQUE INDEX "enquiries_reference_number_idx" ON "enquiries" USING btree ("reference_number");
  CREATE UNIQUE INDEX "enquiries_idempotency_key_idx" ON "enquiries" USING btree ("idempotency_key");
  CREATE INDEX "enquiries_product_idx" ON "enquiries" USING btree ("product_id");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_product_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("product_categories_id");
  CREATE INDEX "payload_locked_documents_rels_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("applications_id");
  CREATE INDEX "payload_locked_documents_rels_specifications_id_idx" ON "payload_locked_documents_rels" USING btree ("specifications_id");
  CREATE INDEX "payload_locked_documents_rels_markets_id_idx" ON "payload_locked_documents_rels" USING btree ("markets_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_product_variants_id_idx" ON "payload_locked_documents_rels" USING btree ("product_variants_id");
  CREATE INDEX "payload_locked_documents_rels_technical_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("technical_documents_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "_brands_v" CASCADE;
  DROP TABLE "product_categories" CASCADE;
  DROP TABLE "_product_categories_v" CASCADE;
  DROP TABLE "applications" CASCADE;
  DROP TABLE "_applications_v" CASCADE;
  DROP TABLE "specifications" CASCADE;
  DROP TABLE "_specifications_v" CASCADE;
  DROP TABLE "markets" CASCADE;
  DROP TABLE "_markets_v" CASCADE;
  DROP TABLE "products_benefits" CASCADE;
  DROP TABLE "tech_props" CASCADE;
  DROP TABLE "products_images" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_benefits" CASCADE;
  DROP TABLE "_tech_props_v" CASCADE;
  DROP TABLE "_products_v_version_images" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "product_variants" CASCADE;
  DROP TABLE "product_variants_rels" CASCADE;
  DROP TABLE "_product_variants_v" CASCADE;
  DROP TABLE "_product_variants_v_rels" CASCADE;
  DROP TABLE "technical_documents" CASCADE;
  DROP TABLE "technical_documents_rels" CASCADE;
  DROP TABLE "_technical_documents_v" CASCADE;
  DROP TABLE "_technical_documents_v_rels" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_media_source_type";
  DROP TYPE "public"."verify_status";
  DROP TYPE "public"."enum_brands_status";
  DROP TYPE "public"."enum_brands_brand_type";
  DROP TYPE "public"."enum__brands_v_version_status";
  DROP TYPE "public"."enum__brands_v_version_brand_type";
  DROP TYPE "public"."publish_status";
  DROP TYPE "public"."enum_specifications_classification_type";
  DROP TYPE "public"."enum__specifications_v_version_classification_type";
  DROP TYPE "public"."enum_markets_status";
  DROP TYPE "public"."enum__markets_v_version_status";
  DROP TYPE "public"."enum_products_images_role";
  DROP TYPE "public"."enum__products_v_version_images_role";
  DROP TYPE "public"."enum_product_variants_kind";
  DROP TYPE "public"."enum_product_variants_pack_unit";
  DROP TYPE "public"."enum_product_variants_availability_status";
  DROP TYPE "public"."enum__product_variants_v_version_kind";
  DROP TYPE "public"."enum__product_variants_v_version_pack_unit";
  DROP TYPE "public"."enum__product_variants_v_version_availability_status";
  DROP TYPE "public"."enum_technical_documents_document_type";
  DROP TYPE "public"."enum__technical_documents_v_version_document_type";
  DROP TYPE "public"."enum_enquiries_status";
  DROP TYPE "public"."enum_enquiries_notification_status";`)
}
