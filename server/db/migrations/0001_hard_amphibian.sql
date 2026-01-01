CREATE TABLE "jobs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"company" varchar,
	"logo" varchar,
	"location" varchar,
	"date_posted" varchar,
	"deadline" varchar,
	"company_email" varchar,
	"description" text,
	"level" varchar,
	"website" varchar,
	"slug" varchar,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "location" varchar;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "website" varchar;