CREATE TABLE `contact_message` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`role` text DEFAULT 'requester' NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `contact_ticket`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_contact_message_ticket` ON `contact_message` (`ticket_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `contact_ticket` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`requester_name` text NOT NULL,
	`requester_email` text NOT NULL,
	`category` text NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`ip_hash` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_contact_ticket_status` ON `contact_ticket` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_ticket_email` ON `contact_ticket` (`requester_email`);--> statement-breakpoint
CREATE TABLE `discount` (
	`id` text PRIMARY KEY NOT NULL,
	`internal_name` text NOT NULL,
	`display_name_en` text NOT NULL,
	`display_name_zh` text NOT NULL,
	`percentage` integer NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_discount_active_window` ON `discount` (`enabled`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE TABLE `discount_product` (
	`id` text PRIMARY KEY NOT NULL,
	`discount_id` text NOT NULL,
	`product_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`discount_id`) REFERENCES `discount`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_discount_product` ON `discount_product` (`discount_id`,`product_id`);--> statement-breakpoint
CREATE INDEX `idx_discount_product_product` ON `discount_product` (`product_id`);--> statement-breakpoint
CREATE TABLE `fastclaw_usage_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`days` integer NOT NULL,
	`totals_json` text NOT NULL,
	`daily_json` text NOT NULL,
	`fetched_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_fastclaw_usage_user_days` ON `fastclaw_usage_cache` (`user_id`,`days`);--> statement-breakpoint
CREATE INDEX `idx_fastclaw_usage_fetched` ON `fastclaw_usage_cache` (`fetched_at`);--> statement-breakpoint
CREATE TABLE `fastclaw_user_mapping` (
	`user_id` text PRIMARY KEY NOT NULL,
	`external_id` text NOT NULL,
	`fastclaw_user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_fastclaw_mapping_external` ON `fastclaw_user_mapping` (`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_fastclaw_mapping_remote` ON `fastclaw_user_mapping` (`fastclaw_user_id`);--> statement-breakpoint
CREATE TABLE `notification_event` (
	`id` text PRIMARY KEY NOT NULL,
	`event_key` text NOT NULL,
	`type` text NOT NULL,
	`recipient` text NOT NULL,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`sent_at` integer,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_notification_event_key` ON `notification_event` (`event_key`);--> statement-breakpoint
CREATE INDEX `idx_notification_delivery` ON `notification_event` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `post_translation` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`locale` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_post_translation_locale_slug` ON `post_translation` (`locale`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_post_translation_post_locale` ON `post_translation` (`post_id`,`locale`);--> statement-breakpoint
CREATE INDEX `idx_post_translation_listing` ON `post_translation` (`post_id`,`locale`,`status`);--> statement-breakpoint
CREATE TABLE `pricing_override` (
	`product_id` text PRIMARY KEY NOT NULL,
	`price_in_cents` integer NOT NULL,
	`credits` integer NOT NULL,
	`credits_valid_days` integer NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`updated_by` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_pricing_override_enabled` ON `pricing_override` (`enabled`);
