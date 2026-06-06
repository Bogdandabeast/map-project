CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`language` text DEFAULT 'es' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`notifications_enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
