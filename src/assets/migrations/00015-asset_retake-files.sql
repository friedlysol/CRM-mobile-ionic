CREATE TABLE `asset_retake_file`
(
    `uuid`         TEXT,
    `id`           INTEGER UNIQUE DEFAULT NULL,
    `asset_id`     INTEGER,
    `file_type_id` INTEGER,
    `file_uuid`    TEXT           DEFAULT null,
    `file_id`      INTEGER        DEFAULT null,
    `sync`         INTEGER        DEFAULT 0,
    `created_at`   TEXT,
    `updated_at`   TEXT,
    PRIMARY KEY (uuid)
)
