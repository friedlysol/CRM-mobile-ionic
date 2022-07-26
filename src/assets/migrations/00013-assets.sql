CREATE TABLE `assets`
(
    `uuid`                                TEXT,
    `id`                                  INTEGER,
    `type_id`                             INTEGER          DEFAULT NULL,
    `address_uuid`                        TEXT,
    `address_id`                          INTEGER          DEFAULT NULL,
    `address_name`                        TEXT             DEFAULT NULL,
    `work_order_uuid`                     TEXT,
    `status_type_id`                      INTEGER,
    `name`                                TEXT             DEFAULT NULL,
    `system_type`                         TEXT             DEFAULT NULL,
    `manufacturer`                        TEXT             DEFAULT NULL,
    `model_number`                        TEXT             DEFAULT NULL,
    `model_not_readable`                  INTEGER          DEFAULT 0,
    `serial_number`                       TEXT             DEFAULT NULL,
    `serial_number_not_readable`          INTEGER          DEFAULT 0,
    `source`                              TEXT             DEFAULT 'mobile',
    `identifier`                          TEXT             DEFAULT NULL,
    `heat_type`                           TEXT             DEFAULT NULL,
    `voltage_type`                        TEXT             DEFAULT NULL,
    `refrigerant_type`                    TEXT             DEFAULT NULL,
    `other_refrigerant_type`              TEXT             DEFAULT NULL,
    `fresh_air`                           TEXT             DEFAULT NULL,
    `filter_quantity`                     TEXT             DEFAULT NULL,
    `filter_size`                         TEXT             DEFAULT NULL,
    `belt`                                INTEGER          DEFAULT NULL,
    `belt_size`                           TEXT             DEFAULT NULL,
    `unit_condition`                      TEXT             DEFAULT NULL,
    `recommendations`                     TEXT             DEFAULT NULL,
    `coords_accuracy`                     TEXT             DEFAULT NULL,
    `location`                            TEXT             DEFAULT NULL,
    `latitude`                            TEXT             DEFAULT NULL,
    `longitude`                           TEXT             DEFAULT NULL,
    `area_served_type_id`                 INTEGER          DEFAULT NULL,
    `thermostat_make`                     TEXT             DEFAULT NULL,
    `thermostat_model`                    TEXT             DEFAULT NULL,
    `tonnage`                             TEXT             DEFAULT NULL,
    `level_type_id`                       INTEGER          DEFAULT NULL,
    `level_comment`                       TEXT             DEFAULT NULL,
    `exterior_side_type_id`               INTEGER          DEFAULT NULL,
    `exterior_side_comment`               TEXT             DEFAULT NULL,
    `room_type_id`                        INTEGER          DEFAULT NULL,
    `room_comment`                        TEXT             DEFAULT NULL,
    `unit_number`                         INTEGER          DEFAULT NULL,
    `dimension_width`                     INTEGER          DEFAULT NULL,
    `dimension_height`                    INTEGER          DEFAULT NULL,
    `dimension_depth`                     INTEGER          DEFAULT NULL,
    `replacement_type_id`                 INTEGER          DEFAULT NULL,
    `material_type_id`                    INTEGER          DEFAULT NULL,
    `material_color_type_id`              INTEGER          DEFAULT NULL,
    `grid_pattern_type_id`                INTEGER          DEFAULT NULL,
    `condition_type_id`                   INTEGER          DEFAULT NULL,
    `floor_type_id`                       INTEGER          DEFAULT NULL,
    `floor_comment`                       TEXT             DEFAULT NULL,
    `wall_material_type_id`               INTEGER          DEFAULT NULL,
    `existing_bath_wall_material_type_id` INTEGER          DEFAULT NULL,
    `removal_of_material_type_id`         INTEGER          DEFAULT NULL,
    `condo_conditions_type_id`            INTEGER          DEFAULT NULL,
    `dimension_bath_door`                 TEXT             DEFAULT NULL,
    `dimension_bath_hallway`              TEXT             DEFAULT NULL,
    `bath_door_type_id`                   INTEGER          DEFAULT NULL,
    `bath_conditions_type_id`             INTEGER          DEFAULT NULL,
    `comment`                             TEXT             DEFAULT NULL,
    `hash`                                TEXT,
    `sync`                                INTEGER NOT NULL DEFAULT 0,
    `created_at`                          TEXT,
    `updated_at`                          TEXT,
    PRIMARY KEY (uuid)
);

CREATE INDEX assets_idx ON assets (uuid, address_uuid, id, source);
