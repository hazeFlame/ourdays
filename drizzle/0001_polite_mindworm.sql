CREATE TABLE `anniversaries` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`type` text DEFAULT 'annual' NOT NULL,
	`description` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `anniversaries_date_idx` ON `anniversaries` (`date`);--> statement-breakpoint
CREATE INDEX `anniversaries_primary_idx` ON `anniversaries` (`is_primary`);--> statement-breakpoint
CREATE TABLE `letters` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`author` text,
	`visibility` text DEFAULT 'private' NOT NULL,
	`written_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `letters_visibility_idx` ON `letters` (`visibility`);--> statement-breakpoint
CREATE INDEX `letters_written_at_idx` ON `letters` (`written_at`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`storage_key` text NOT NULL,
	`thumbnail_key` text,
	`taken_at` integer,
	`location` text,
	`visibility` text DEFAULT 'public' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `photos_visibility_idx` ON `photos` (`visibility`);--> statement-breakpoint
CREATE INDEX `photos_sort_order_idx` ON `photos` (`sort_order`);--> statement-breakpoint
CREATE INDEX `photos_taken_at_idx` ON `photos` (`taken_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `timeline_events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`event_date` integer NOT NULL,
	`photo_id` text,
	`location` text,
	`visibility` text DEFAULT 'public' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `timeline_events_visibility_idx` ON `timeline_events` (`visibility`);--> statement-breakpoint
CREATE INDEX `timeline_events_event_date_idx` ON `timeline_events` (`event_date`);--> statement-breakpoint
CREATE INDEX `timeline_events_photo_id_idx` ON `timeline_events` (`photo_id`);