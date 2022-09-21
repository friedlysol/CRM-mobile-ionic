CREATE TABLE `addresses`
(
    `uuid`                TEXT,
    `id`                  INTEGER NOT NULL,
    `address`             TEXT,
    `address2`            TEXT,
    `address_name`        TEXT,
    `address_note`        TEXT,
    `address_store_hours` TEXT,
    `city`                TEXT,
    `state`               TEXT,
    `zip_code`            TEXT,
    `latitude`            TEXT,
    `longitude`           TEXT,
    `hash`                TEXT,
    `created_at`          TEXT,
    `updated_at`          TEXT,
    `sync`                INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (uuid)
)
