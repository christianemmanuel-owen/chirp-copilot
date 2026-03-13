CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_project_unique` ON `brands` (`project_id`,`name`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_project_unique` ON `categories` (`project_id`,`name`);--> statement-breakpoint
CREATE TABLE `chatbot_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`connection_id` text NOT NULL,
	`instagram_user_id` text NOT NULL,
	`instagram_username` text,
	`stage` text DEFAULT 'initial' NOT NULL,
	`context` text DEFAULT '{}' NOT NULL,
	`cart` text DEFAULT '[]' NOT NULL,
	`last_user_message` text,
	`last_bot_message` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`connection_id`) REFERENCES `instagram_connections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `discount_campaign_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`campaign_id` text NOT NULL,
	`variant_id` integer NOT NULL,
	`discount_percent` real NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`campaign_id`) REFERENCES `discount_campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dc_variant_unique` ON `discount_campaign_variants` (`campaign_id`,`variant_id`);--> statement-breakpoint
CREATE TABLE `discount_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`banner_image_url` text,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `instagram_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`page_id` text NOT NULL,
	`page_name` text,
	`page_access_token` text NOT NULL,
	`instagram_business_account_id` text NOT NULL,
	`instagram_username` text,
	`user_access_token` text NOT NULL,
	`user_access_token_expires_at` integer,
	`scopes` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'connected' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`connected_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instagram_connections_page_id_unique` ON `instagram_connections` (`page_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `instagram_connections_instagram_business_account_id_unique` ON `instagram_connections` (`instagram_business_account_id`);--> statement-breakpoint
CREATE TABLE `instagram_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`connection_id` text NOT NULL,
	`conversation_id` text NOT NULL,
	`instagram_message_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`sender_name` text,
	`sender_username` text,
	`is_from_page` integer DEFAULT false NOT NULL,
	`message_text` text,
	`attachments` text DEFAULT '[]' NOT NULL,
	`sent_at` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`connection_id`) REFERENCES `instagram_connections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instagram_messages_unique_msg` ON `instagram_messages` (`connection_id`,`instagram_message_id`);--> statement-breakpoint
CREATE INDEX `instagram_messages_conversation_idx` ON `instagram_messages` (`connection_id`,`conversation_id`);--> statement-breakpoint
CREATE INDEX `instagram_messages_sent_at_idx` ON `instagram_messages` (`sent_at`);--> statement-breakpoint
CREATE TABLE `instagram_oauth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`state` text NOT NULL,
	`long_lived_user_token` text NOT NULL,
	`long_lived_user_token_expires_at` integer,
	`pages` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instagram_oauth_sessions_state_unique` ON `instagram_oauth_sessions` (`state`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`payment_method` text NOT NULL,
	`proof_of_payment_url` text,
	`customer_first_name` text NOT NULL,
	`customer_last_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_email` text NOT NULL,
	`instagram_handle` text,
	`delivery_unit` text,
	`delivery_lot` text,
	`delivery_street` text NOT NULL,
	`delivery_city` text NOT NULL,
	`delivery_region` text NOT NULL,
	`delivery_zip_code` text NOT NULL,
	`delivery_country` text NOT NULL,
	`fulfillment_method` text DEFAULT 'delivery' NOT NULL,
	`pickup_location_name` text,
	`pickup_location_unit` text,
	`pickup_location_lot` text,
	`pickup_location_street` text,
	`pickup_location_city` text,
	`pickup_location_region` text,
	`pickup_location_zip_code` text,
	`pickup_location_country` text DEFAULT 'Philippines',
	`pickup_location_notes` text,
	`pickup_scheduled_date` text,
	`pickup_scheduled_time` text,
	`order_items` text DEFAULT '[]' NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`vat` real DEFAULT 0 NOT NULL,
	`shipping_fee` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`tracking_id` text,
	`status` text DEFAULT 'For Evaluation' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`inventory_adjusted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`provider` text NOT NULL,
	`account_name` text,
	`instructions` text,
	`qr_code_url` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_methods_provider_project_unique` ON `payment_methods` (`project_id`,`provider`);--> statement-breakpoint
CREATE TABLE `product_categories` (
	`product_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	PRIMARY KEY(`product_id`, `category_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`sku` text,
	`color` text,
	`image_url` text,
	`description` text,
	`is_preorder` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`preorder_down_payment_type` text DEFAULT 'none' NOT NULL,
	`preorder_down_payment_value` real,
	`preorder_message` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`image_url` text,
	`brand_id` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `storefront_settings` (
	`project_id` text PRIMARY KEY NOT NULL,
	`home_collection_mode` text DEFAULT 'brand' NOT NULL,
	`home_banner_manual_product_ids` text DEFAULT '[]' NOT NULL,
	`highlight_popular_hero` integer DEFAULT true NOT NULL,
	`highlight_latest_hero` integer DEFAULT true NOT NULL,
	`nav_collections_enabled` integer DEFAULT true NOT NULL,
	`favicon_url` text,
	`theme_config` text DEFAULT '{}' NOT NULL,
	`shipping_default_fee` real DEFAULT 0 NOT NULL,
	`shipping_region_overrides` text DEFAULT '{}' NOT NULL,
	`vat_enabled` integer DEFAULT true NOT NULL,
	`pickup_enabled` integer DEFAULT false NOT NULL,
	`pickup_location_name` text,
	`pickup_location_unit` text,
	`pickup_location_lot` text,
	`pickup_location_street` text,
	`pickup_location_city` text,
	`pickup_location_region` text,
	`pickup_location_zip_code` text,
	`pickup_location_country` text DEFAULT 'Philippines',
	`pickup_location_notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_projects` (
	`user_id` text NOT NULL,
	`project_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	PRIMARY KEY(`user_id`, `project_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`hashed_password` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `variant_sizes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`variant_id` integer NOT NULL,
	`size` text,
	`price` real NOT NULL,
	`stock_quantity` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
