CREATE TABLE `time_sheets`
(
    `uuid`              TEXT,
    `id`                INTEGER,
    `type_id`           INTEGER NOT NULL,
    `vehicle_id`        INTEGER DEFAULT NULL,
    `start_at`          TEXT,
    `stop_at`           TEXT    DEFAULT NULL,
    `start_gps`         TEXT,
    `stop_gps`          TEXT    DEFAULT NULL,
    `description`       TEXT    DEFAULT NULL,
    `object_type`       TEXT,
    `object_uuid`       TEXT,
    `work_order_number` TEXT    DEFAULT NULL,
    `changed_in_crm`    INTEGER DEFAULT 0,
    `change_reason`     TEXT    DEFAULT NULL,
    `hash`              TEXT    DEFAULT NULL,
    `sync`              INTEGER DEFAULT 0,
    `auto_close_at`     TEXT    DEFAULT NULL,
    `created_at`        TEXT,
    `updated_at`        TEXT,

    PRIMARY KEY (uuid)
);

CREATE INDEX time_sheets_idx ON time_sheets (object_uuid, stop_at, start_at, sync);
