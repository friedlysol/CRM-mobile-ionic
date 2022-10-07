CREATE TABLE `gps_locations`
(
    `uuid`              TEXT,
    `latitude`          NUMERIC,
    `longitude`         NUMERIC,
    `accuracy`          NUMERIC,
    `altitude`          NUMERIC,
    `altitude_accuracy` NUMERIC,
    `bearing`           NUMERIC,
    `speed`             NUMERIC,
    `simulated`         INTEGER NOT NULL DEFAULT 0,
    `timestamp`         TEXT,
    `sync`              INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (uuid)
)
