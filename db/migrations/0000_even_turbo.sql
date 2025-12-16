CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"logo" varchar
);
--> statement-breakpoint
CREATE TABLE "rawjobs" (
	"job_id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"company" varchar,
	"deadline" varchar,
	"date_posted" varchar,
	"url" text,
	"job_description" text
);
