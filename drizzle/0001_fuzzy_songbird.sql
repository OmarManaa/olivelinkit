CREATE TABLE `app_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `support_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_type` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`details` text NOT NULL,
	`business_context` text,
	`selected_service` text,
	`selected_item` text,
	`status` text DEFAULT 'New' NOT NULL,
	`created_at` text NOT NULL,
	`last_action` text
);
