CREATE TABLE IF NOT EXISTS `accounts` (
    `uuid`  TEXT,
    `person_id` INTEGER,
    `username`  TEXT,
    `phone`  TEXT,
    `token`  TEXT,
    `is_active` INTEGER,
    `created_at`  TEXT,
    PRIMARY KEY(uuid)
);

CREATE TABLE IF NOT EXISTS `files` (
   `uuid`	TEXT NOT NULL,
   `id`	INTEGER,
   `filename` TEXT,
   `url` TEXT,
   `referenceType` TEXT,
   `referenceId` INTEGER,
   `referenceUuid` TEXT NOT NULL,
   `crc` TEXT,
   `hash` TEXT,
   `isInQueue` INTEGER DEFAULT 0,
   `isDeleted` INTEGER DEFAULT 0,
   `sync` INTEGER DEFAULT 0,
   `createdAt`	TEXT,
   `updatedAt`	TEXT,
   PRIMARY KEY(uuid)
);

CREATE TABLE IF NOT EXISTS `services` (
    `id` INTEGER NOT NULL,
    `categoryTypeId` INTEGER NOT NULL,
    `name`  TEXT NOT NULL,
    `description`  TEXT NULL,
    `requireComment`  INTEGER DEFAULT 0,
    `enabled`  INTEGER DEFAULT 1,
    `options` TEXT DEFAULT NULL,
    `hash` TEXT,
    `createdAt` TEXT,
    `updatedAt` TEXT,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS `types` (
    `id`  INTEGER NOT NULL,
    `parentTypeId`  INTEGER DEFAULT NULL,
    `type`  TEXT NOT NULL,
    `typeKey`  TEXT NOT NULL,
    `typeValue`  TEXT,
    `color` TEXT,
    `hash` TEXT,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS `works` (
    `uuid` TEXT NOT NULL,
    `id` INTEGER DEFAULT NULL,
    `propertyId` INTEGER DEFAULT NULL,
    `clientId` INTEGER DEFAULT NULL,
    'clientName' TEXT NOT NULL,
    `statusTypeId` INTEGER DEFAULT NULL,
    `address1` TEXT NULL,
    `address2` TEXT NULL,
    `city` TEXT NULL,
    `state` TEXT NULL,
    `zip` TEXT NULL,
    `country` TEXT NULL,
    `assetReo` TEXT NULL,
    `brokerName` TEXT NULL,
    `brokerContact` TEXT NULL,
    `brokerEmail` TEXT NULL,
    `brokerPhone` TEXT NULL,
    `lockBoxCode` TEXT NULL,
    `lockBoxComment` TEXT NULL,
    `occupantName` TEXT NULL,
    `occupantPhone` TEXT NULL,
    `hoaName` TEXT NULL,
    `hoaContact` TEXT NULL,
    `hoaEmail` TEXT NULL,
    `hoaPhone` TEXT NULL,
    'clientComment' TEXT NULL,
    'comment' TEXT NULL,
    `sync` INTEGER NOT NULL DEFAULT 0,
    `hash` TEXT,
    `isDeleted` INTEGER DEFAULT 0,
    `requestedDate` TEXT DEFAULT NULL,
    `dueDate` TEXT DEFAULT NULL,
    `completedDate` TEXT DEFAULT NULL,
    `createdAt` TEXT,
    `updatedAt` TEXT,
    PRIMARY KEY(uuid)
);

CREATE TABLE IF NOT EXISTS `work_rooms` (
    `uuid` TEXT NOT NULL,
    `id` INTEGER,
    `workUuid` TEXT NOT NULL,
    `workId` INTEGER,
    `name` TEXT NOT NULL,
    `exterior` INTEGER DEFAULT 0,
    `width` REAL DEFAULT NULL,
    `height` REAL DEFAULT NULL,
    `length` REAL DEFAULT NULL,
    `hash` TEXT,
    `sync` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` INTEGER NOT NULL DEFAULT 0,
    `createdAt` TEXT,
    `updatedAt` TEXT,
    PRIMARY KEY(uuid)
);

CREATE TABLE IF NOT EXISTS `work_room_repairs` (
    `uuid` TEXT NOT NULL,
    `id` INTEGER,
    `workRoomUuid` TEXT NOT NULL,
    `workRoomId` INTEGER,
    `serviceId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `description` TEXT,
    `options` TEXT DEFAULT NULL,
    `hash` TEXT,
    `isDeleted` INTEGER DEFAULT 0,
    `sync` INTEGER NOT NULL DEFAULT 0,
    `createdAt` TEXT,
    `updatedAt` TEXT,
    PRIMARY KEY(uuid)
);
