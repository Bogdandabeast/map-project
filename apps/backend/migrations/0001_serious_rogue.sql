CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_games` (
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`skill_level` text,
	`owned` integer DEFAULT true,
	`added_at` integer,
	PRIMARY KEY(`user_id`, `game_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade
);
