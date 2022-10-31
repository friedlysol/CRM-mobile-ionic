CREATE TABLE `persons`
(
    `uuid`           TEXT NOT NULL,
    `id`             INTEGER,
    `kind`           TEXT,
    `type`           TEXT,
    `first_name`     TEXT,
    `last_name`      TEXT,
    `status_type_id` INTEGER,
    `created_at`     TEXT,
    `updated_at`     TEXT,
    PRIMARY KEY (uuid)
);
