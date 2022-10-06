CREATE TABLE `time_sheet_history`
(
    `id`              INTEGER,
    `time_sheet_uuid` TEXT,
    `time_sheet_id`   INTEGER,
    `object_type`     TEXT,
    `object_uuid`     TEXT,
    `start_at`        TEXT,
    `stop_at`         TEXT,
    `sync`            INTEGER DEFAULT 0,
    `created_at`      TEXT,
    `updated_at`      TEXT NOT NULL,
    PRIMARY KEY (id)
)
