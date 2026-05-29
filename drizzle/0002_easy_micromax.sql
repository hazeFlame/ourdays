ALTER TABLE `anniversaries` ADD `created_by_user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `letters` ADD `created_by_user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `photos` ADD `created_by_user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `timeline_events` ADD `created_by_user_id` text REFERENCES user(id);