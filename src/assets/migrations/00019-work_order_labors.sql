CREATE TABLE `work_order_labors`
(
    `uuid`             TEXT,
    `id`               INTEGER DEFAULT NULL,
    `work_order_uuid`  INTEGER DEFAULT NULL,
    `work_order_id`    INTEGER DEFAULT NULL,
    `inventory_id`     TEXT,
    `reason_type_id`   INTEGER DEFAULT null,
    `name`             TEXT,
    `description`      TEXT,
    `comment`          TEXT    DEFAULT null,
    `quantity`         NUMERIC DEFAULT 0,
    `quantity_from_sl` NUMERIC DEFAULT 0,
    `seq_number`       TEXT    DEFAULT NULL,
    `auto_created`     INTEGER DEFAULT 0,
    `price`            TEXT    DEFAULT NULL,
    `is_deleted`       INTEGER DEFAULT 0,
    `hash`             TEXT    DEFAULT NULL,
    `sync`             INTEGER DEFAULT 0,
    `created_at`       TEXT    DEFAULT NULL,
    `updated_at`       TEXT    DEFAULT NULL,
    PRIMARY KEY (uuid)
)

CREATE INDEX work_order_labors_idx ON work_order_labors (work_order_uuid, inventory_id, sync)
