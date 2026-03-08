-- CreateTable
CREATE TABLE `Job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `tags` JSON NULL,
    `location` VARCHAR(255) NULL,
    `remote` BOOLEAN NOT NULL DEFAULT false,
    `jobType` VARCHAR(100) NULL,
    `sourceApi` VARCHAR(100) NOT NULL,
    `sourceUrl` TEXT NULL,
    `externalId` VARCHAR(255) NULL,
    `embedding` JSON NULL,
    `embeddedAt` DATETIME(3) NULL,
    `postedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Job_remote_idx`(`remote`),
    INDEX `Job_location_idx`(`location`),
    INDEX `Job_sourceApi_idx`(`sourceApi`),
    UNIQUE INDEX `Job_sourceApi_externalId_key`(`sourceApi`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserResume` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `originalText` LONGTEXT NOT NULL,
    `embedding` JSON NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserResume_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `resumeId` INTEGER NOT NULL,
    `jobId` INTEGER NOT NULL,
    `similarityScore` DOUBLE NOT NULL,
    `explanation` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MatchResult_userId_idx`(`userId`),
    INDEX `MatchResult_resumeId_idx`(`resumeId`),
    INDEX `MatchResult_jobId_idx`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserResume` ADD CONSTRAINT `UserResume_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchResult` ADD CONSTRAINT `MatchResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchResult` ADD CONSTRAINT `MatchResult_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `UserResume`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchResult` ADD CONSTRAINT `MatchResult_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
