CREATE TABLE `files`
(
    `uuid`              TEXT NOT NULL,
    `id`                INTEGER,
    `link_person_wo_id` INTEGER DEFAULT NULL,
    `type`              TEXT,
    `path`              TEXT,
    `crc`               TEXT,
    `thumbnail`         TEXT,
    `description`       TEXT,
    `gps_coords`        TEXT,
    `object_type`       TEXT,
    `object_uuid`       TEXT NOT NULL,
    `object_id`         INTEGER,
    `type_id`           INTEGER,
    `is_downloaded`     INTEGER DEFAULT 0,
    `download_attempts` INTEGER DEFAULT 0,
    `is_deleted`        INTEGER DEFAULT 0,
    `hash`              TEXT    DEFAULT NULL,
    `sync`              INTEGER DEFAULT 0,
    `sync_bg_status`    TEXT    DEFAULT NULL,
    `created_at`        TEXT,
    `updated_at`        TEXT,
    PRIMARY KEY (uuid)
);


