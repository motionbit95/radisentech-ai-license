-- 1. Drop the table if it exists
DROP TABLE IF EXISTS auth_codes;
DROP TABLE IF EXISTS generate_history;
DROP TABLE IF EXISTS license_history;
DROP TABLE IF EXISTS LicenseManagement;
DROP TABLE IF EXISTS company;
DROP TABLE IF EXISTS product;

-- 2. Create the company table
CREATE TABLE `company` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` varchar(50) NOT NULL,
    `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    `email` varchar(100) NOT NULL,
    `company_name` varchar(100) NOT NULL,
    `user_name` varchar(100) NOT NULL,
    `address` varchar(255) DEFAULT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `license_cnt` int DEFAULT '0',
    `unique_code` varchar(50) NOT NULL,
    `permission_flag` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'N',
    `product` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_id` (`user_id`),
    UNIQUE KEY `unique_code` (`unique_code`),
    UNIQUE KEY `email` (`email`),
    UNIQUE KEY `phone` (`phone`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

-- 3. Insert dummy data into the company table
INSERT INTO company
    (user_id, password, email, company_name, user_name, address, phone, license_cnt, unique_code, permission_flag)
VALUES
    ('Radisen', '$2a$10$ulZf3DC57/eaIznOPTQyfODkgHhg49alXkag9vBv80jKBxZTY5D4K', 'motionbit.dev@gmail.com', 'Radisen Tech', 'John Doe', 'Seoul, South Korea', '01012341234', 0, 'RADISENTECH', 'D')

-- 4. Create the LicenseManagement table
CREATE TABLE `LicenseManagement` (
    `pk` bigint NOT NULL AUTO_INCREMENT,
    `DealerCompany` varchar(255) NOT NULL,
    `Company` varchar(255) NOT NULL,
    `Country` varchar(255) NOT NULL,
    `AIType` varchar(255) NOT NULL,
    `Hospital` varchar(255) NOT NULL,
    `UserEmail` varchar(255) DEFAULT NULL,
    `HardWareInfo` varchar(255) DEFAULT NULL,
    `DetectorSerialNumber` varchar(255) DEFAULT NULL,
    `LocalActivateStartDate` datetime NOT NULL,
    `LocalTerminateDate` date NOT NULL,
    `UTCActivateStartDate` datetime NOT NULL,
    `UTCTerminateDate` date NOT NULL,
    `ActivateCount` bigint NOT NULL DEFAULT '0',
    `UpdatedAt` datetime DEFAULT NULL,
    `UserName` varchar(255) DEFAULT NULL,
    `UniqueCode` varchar(255) NOT NULL,
    `Deleted` int NOT NULL DEFAULT '0',
    `ProductType` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`pk`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

-- 5. Create the auth_codes table
CREATE TABLE `auth_codes` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `code` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` timestamp NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_id` (`user_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

-- 6. Create the generate_history table
CREATE TABLE `generate_history` (
    `id` int NOT NULL AUTO_INCREMENT COMMENT 'pk',
    `create_time` datetime DEFAULT NULL COMMENT 'Create Time',
    `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `company_pk` int NOT NULL COMMENT 'FK',
    `prev_cnt` int NOT NULL DEFAULT '0',
    `new_cnt` int NOT NULL DEFAULT '0',
    `canceled` int DEFAULT '0',
    `source` int DEFAULT NULL,
    `target` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `company_pk` (`company_pk`),
    CONSTRAINT `generate_history_ibfk_1` FOREIGN KEY (`company_pk`) REFERENCES `company` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

-- 7. Create the license_history table
CREATE TABLE `license_history` (
    `id` int NOT NULL AUTO_INCREMENT,
    `license_pk` bigint NOT NULL,
    `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `previous_expire_date` date DEFAULT NULL,
    `new_expire_date` date DEFAULT NULL,
    `deleted` bigint NOT NULL DEFAULT '0',
    `description` varchar(255) DEFAULT NULL,
    `unique_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    PRIMARY KEY (`id`),
    KEY `license_pk` (`license_pk`),
    CONSTRAINT `license_history_ibfk_1` FOREIGN KEY (`license_pk`) REFERENCES `LicenseManagement` (`pk`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

-- 8. Create the product table
CREATE TABLE `product` (
    `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
    `created_at` timestamp NULL DEFAULT NULL COMMENT 'Create Time',
    `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci