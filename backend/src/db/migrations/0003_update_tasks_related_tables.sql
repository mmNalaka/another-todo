CREATE TABLE IF NOT EXISTS "list_collaborators" (
	"list_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'editor',
	CONSTRAINT "list_collaborators_list_id_user_id_pk" PRIMARY KEY("list_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks_lists" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks_lists" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks_lists" ADD COLUMN "is_shared" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "list_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "parent_task_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "value" numeric;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "is_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_collaborators" ADD CONSTRAINT "list_collaborators_list_id_tasks_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."tasks_lists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_collaborators" ADD CONSTRAINT "list_collaborators_user_id_tasks_lists_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tasks_lists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_list_collaborators_user_id" ON "list_collaborators" USING btree ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_list_id_tasks_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."tasks_lists"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "parent_task_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lists_owner_id" ON "tasks_lists" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_user_id" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_list_id" ON "tasks" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_parent_task_id" ON "tasks" USING btree ("parent_task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_list_parent_position" ON "tasks" USING btree ("list_id","parent_task_id","position");--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "order_index";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "completed";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "created_by";