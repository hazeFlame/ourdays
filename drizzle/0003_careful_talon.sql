CREATE TABLE `letter_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`letter_id` text NOT NULL,
	`author` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`letter_id`) REFERENCES `letters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `letter_comments_letter_id_idx` ON `letter_comments` (`letter_id`);--> statement-breakpoint
CREATE INDEX `letter_comments_created_at_idx` ON `letter_comments` (`created_at`);