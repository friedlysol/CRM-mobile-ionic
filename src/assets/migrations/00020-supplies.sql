CREATE TABLE `supplies`
(
    `uuid`               TEXT,
    `id`                 INTEGER,
    `route`              TEXT,
    `job_type_id`        INTEGER,
    `type`               TEXT,
    `type_id`            INTEGER,
    `size`               INTEGER,
    `quantity`           INTEGER,
    `comment`            TEXT,
    `acknowledgment`     INTEGER          DEFAULT 0,
    `shipping_date`      TEXT             DEFAULT NULL,
    `delivery_status`    TEXT             DEFAULT NULL,
    `technician_comment` TEXT             DEFAULT NULL,
    `sync`               INTEGER NOT NULL DEFAULT 0,
    `created_at`         TEXT,
    `updated_at`         TEXT             DEFAULT NULL,
    PRIMARY KEY (uuid)
)
