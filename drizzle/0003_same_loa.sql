CREATE TABLE `mediaFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`size` int NOT NULL DEFAULT 0,
	`altText` text,
	`folder` varchar(100) NOT NULL DEFAULT 'general',
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mediaFiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `mediaFiles_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `siteContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`label` varchar(255) NOT NULL,
	`type` enum('text','textarea','html') NOT NULL DEFAULT 'text',
	`value` text NOT NULL,
	`section` varchar(100) NOT NULL DEFAULT 'general',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteContent_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteContent_key_unique` UNIQUE(`key`)
);
