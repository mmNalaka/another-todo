ALTER TABLE "refresh_tokens" ALTER COLUMN "id" SET DEFAULT 'u0ZN2wZ0HjB7lToiFN9EM';--> statement-breakpoint
ALTER TABLE "tasks_lists" ALTER COLUMN "id" SET DEFAULT 'lst_4Ck51KwAOKve-zi7fYkSF';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" SET DEFAULT 'tsk_B2BeNhSjPuVtrVqjUuxsg';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'usr_Zb_r_CBvW-DUteq2tXzph';--> statement-breakpoint
ALTER TABLE "tasks_lists" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "tasks_lists" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "tasks_lists" ADD COLUMN "schema" jsonb;