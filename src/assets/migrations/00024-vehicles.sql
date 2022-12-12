CREATE TABLE `vehicles`
(
    `id`             INTEGER,
    `store_id`       INTEGER DEFAULT NULL,
    `vehicle_number` TEXT    DEFAULT NULL,
    `plate`          TEXT    DEFAULT NULL,
    `vin`            TEXT    DEFAULT NULL,
    `hash`           TEXT    DEFAULT NULL,
    `created_at`     TEXT    DEFAULT NULL,
    `updated_at`     TEXT    DEFAULT NULL,
    PRIMARY KEY (id)
)
