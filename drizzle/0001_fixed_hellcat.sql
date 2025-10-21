CREATE TABLE `answers` (
	`id` varchar(64) NOT NULL,
	`traineeId` varchar(64) NOT NULL,
	`phase` int NOT NULL,
	`dilemmaIndex` int NOT NULL,
	`selectedOption` int NOT NULL,
	`scoresAwarded` json NOT NULL,
	`answeredAt` timestamp DEFAULT (now()),
	CONSTRAINT `answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` varchar(64) NOT NULL,
	`traineeId` varchar(64) NOT NULL,
	`genius1` varchar(1) NOT NULL,
	`genius2` varchar(1) NOT NULL,
	`frustration1` varchar(1) NOT NULL,
	`frustration2` varchar(1) NOT NULL,
	`dominantTendency` varchar(20) NOT NULL,
	`avgR` int NOT NULL,
	`avgI` int NOT NULL,
	`avgD` int NOT NULL,
	`avgA` int NOT NULL,
	`avgF` int NOT NULL,
	`avgT` int NOT NULL,
	`careerAdvice` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `results_id` PRIMARY KEY(`id`),
	CONSTRAINT `results_traineeId_unique` UNIQUE(`traineeId`)
);
--> statement-breakpoint
CREATE TABLE `trainees` (
	`id` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`currentPhase` int NOT NULL DEFAULT 0,
	`scoreR` int NOT NULL DEFAULT 0,
	`scoreI` int NOT NULL DEFAULT 0,
	`scoreD` int NOT NULL DEFAULT 0,
	`scoreA` int NOT NULL DEFAULT 0,
	`scoreF` int NOT NULL DEFAULT 0,
	`scoreT` int NOT NULL DEFAULT 0,
	`completed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `trainees_id` PRIMARY KEY(`id`)
);
