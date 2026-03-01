-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `gender` ENUM('male', 'female', 'other') NOT NULL,
    `profileImage` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `provider` ENUM('EMAIL', 'PHONE', 'APPLE', 'GOOGLE') NOT NULL DEFAULT 'EMAIL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoggedDevices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `fcmToken` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `deviceModel` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `purpose` ENUM('VERIFYPHONE', 'VERIFYEMAIL', 'LOGIN', 'FORGOTPASSWORD', 'UPDATEPASSWORD', 'DELETEACCOUNT') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LoggedDevices` ADD CONSTRAINT `LoggedDevices_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
