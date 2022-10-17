CREATE TABLE `asset_changes`
(
    `uuid`       TEXT,
    `asset_uuid` TEXT,
    `asset_id`   INTEGER,
    `person_id`  INTEGER,
    `action`     TEXT,
    `sync`       INTEGER NOT NULL DEFAULT 0,
    `created_at` TEXT,
    `updated_at` TEXT,
    PRIMARY KEY (uuid)
)
