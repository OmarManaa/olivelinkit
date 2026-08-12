CREATE TABLE `admins` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text,
	`role` text,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text
);
--> statement-breakpoint
INSERT INTO `admins` (`email`, `name`, `role`, `active`, `created_at`, `created_by`)
VALUES ('omar.manaa@gmail.com', 'Omar Manaa', 'owner', 1, strftime('%s','now'), NULL);
--> statement-breakpoint
