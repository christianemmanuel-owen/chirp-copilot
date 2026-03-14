CREATE TABLE `maintenance_overrides` (
	`feature_key` text PRIMARY KEY NOT NULL,
	`is_disabled` integer DEFAULT false NOT NULL,
	`message` text,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `project_features` (
	`project_id` text NOT NULL,
	`feature_key` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`expires_at` integer,
	`metadata` text DEFAULT '{}' NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	PRIMARY KEY(`project_id`, `feature_key`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
