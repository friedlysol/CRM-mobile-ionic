CREATE TABLE `tech_statuses`
(
    `id`                        INTEGER,
    `time_sheet_reason_type_id` INTEGER,
    `key`                       TEXT,
    `name`                      TEXT,
    `description_required`      INTEGER DEFAULT 0,
    `use_vehicle`               INTEGER DEFAULT 0,
    `start_after_stop`          INTEGER DEFAULT 0,
    `created_at`                TEXT,
    `updated_at`                TEXT,
    PRIMARY KEY (id)
);
