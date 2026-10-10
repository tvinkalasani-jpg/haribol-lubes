import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$
   BEGIN
     IF EXISTS (SELECT 1 FROM "technical_documents" WHERE "file_id" IS NOT NULL) THEN
       RAISE EXCEPTION 'Phase 30B requires existing Technical Document files to be migrated into private storage before this schema migration can run.';
     END IF;
   END $$;

  CREATE TYPE "public"."enum_private_documents_source_type" AS ENUM('supplier-original', 'catalogue-extract', 'project-generated', 'cms');
  CREATE TABLE "private_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"source_type" "enum_private_documents_source_type" DEFAULT 'cms' NOT NULL,
  	"verification_status" "verify_status" DEFAULT 'needs-review' NOT NULL,
  	"prefix" varchar DEFAULT 'private-documents',
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
  
  ALTER TABLE "technical_documents" DROP CONSTRAINT "technical_documents_file_id_media_id_fk";
  
  ALTER TABLE "_technical_documents_v" DROP CONSTRAINT "_technical_documents_v_version_file_id_media_id_fk";
  
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'media';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "private_documents_id" integer;
  CREATE INDEX "private_documents_updated_at_idx" ON "private_documents" USING btree ("updated_at");
  CREATE INDEX "private_documents_created_at_idx" ON "private_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "private_documents_filename_idx" ON "private_documents" USING btree ("filename");
  ALTER TABLE "technical_documents" ADD CONSTRAINT "technical_documents_file_id_private_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."private_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technical_documents_v" ADD CONSTRAINT "_technical_documents_v_version_file_id_private_documents_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."private_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_private_documents_fk" FOREIGN KEY ("private_documents_id") REFERENCES "public"."private_documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_private_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("private_documents_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "technical_documents" DROP CONSTRAINT "technical_documents_file_id_private_documents_id_fk";
  
  ALTER TABLE "_technical_documents_v" DROP CONSTRAINT "_technical_documents_v_version_file_id_private_documents_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_private_documents_fk";
  
  DROP INDEX "payload_locked_documents_rels_private_documents_id_idx";
  ALTER TABLE "private_documents" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "private_documents";
  ALTER TABLE "technical_documents" ADD CONSTRAINT "technical_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technical_documents_v" ADD CONSTRAINT "_technical_documents_v_version_file_id_media_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "private_documents_id";
  DROP TYPE "public"."enum_private_documents_source_type";`)
}
