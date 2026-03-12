-- CreateTable
CREATE TABLE `UserContactInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `phone` VARCHAR(20) NULL,
    `countryCode` VARCHAR(10) NULL,
    `city` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserContactInfo_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobScreeningQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobId` INTEGER NOT NULL,
    `questions` JSON NOT NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `JobScreeningQuestion_jobId_key`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `jobId` INTEGER NOT NULL,
    `resumeId` INTEGER NOT NULL,
    `contactSnapshot` JSON NOT NULL,
    `answers` JSON NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JobApplication_userId_idx`(`userId`),
    INDEX `JobApplication_jobId_idx`(`jobId`),
    UNIQUE INDEX `JobApplication_userId_jobId_key`(`userId`, `jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserContactInfo` ADD CONSTRAINT `UserContactInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobScreeningQuestion` ADD CONSTRAINT `JobScreeningQuestion_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `UserResume`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
