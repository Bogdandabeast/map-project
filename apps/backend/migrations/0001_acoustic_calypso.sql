ALTER TABLE `game` ADD `min_players` integer;--> statement-breakpoint
ALTER TABLE `game` ADD `max_players` integer;--> statement-breakpoint
ALTER TABLE `game` ADD `duration` integer;--> statement-breakpoint
ALTER TABLE `game` ADD `cover_image` text;--> statement-breakpoint
ALTER TABLE `game` ADD `bgg_id` integer;--> statement-breakpoint
ALTER TABLE `game` ADD `access_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `game` ADD `source` text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `game` ADD `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `game_bgg_id_unique` ON `game` (`bgg_id`);