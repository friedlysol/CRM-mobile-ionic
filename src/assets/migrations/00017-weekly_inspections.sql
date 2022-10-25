CREATE TABLE `weekly_inspections`
(
    `uuid`                           TEXT,
    `id`                             INTEGER,
    `route`                          TEXT,
    `vehicle_number`                 TEXT,
    `odometer_reading`               TEXT,
    `oil`                            INTEGER NOT NULL DEFAULT 0,
    `brake`                          INTEGER NOT NULL DEFAULT 0,
    `washer`                         INTEGER NOT NULL DEFAULT 0,
    `jack`                           INTEGER NOT NULL DEFAULT 0,
    `tread`                          INTEGER NOT NULL DEFAULT 0,
    `spare_tire`                     INTEGER NOT NULL DEFAULT 0,
    `tires_pressure_front_driver`    NUMERIC NOT NULL DEFAULT 0,
    `tires_pressure_front_passenger` NUMERIC NOT NULL DEFAULT 0,
    `tires_pressure_rear_driver`     NUMERIC NOT NULL DEFAULT 0,
    `tires_pressure_rear_passenger`  NUMERIC NOT NULL DEFAULT 0,
    `card_in_vehicle`                INTEGER NOT NULL DEFAULT 0,
    `registration_in_vehicle`        INTEGER NOT NULL DEFAULT 0,
    `sync`                           INTEGER NOT NULL DEFAULT 0,
    `created_at`                     TEXT,
    `updated_at`                     TEXT,
    PRIMARY KEY (uuid)
);

CREATE INDEX weekly_inspections_idx ON weekly_inspections (created_at, id, sync);
