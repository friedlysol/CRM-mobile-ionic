CREATE TABLE `work_order_ahd_options`
(
    `id`                     INTEGER,
    `work_order_uuid`        TEXT,
    `work_order_id`          INTEGER NOT NULL,
    'conditions_type_id'     INTEGER,
    'conditions_comment'     TEXT,
    'covered_area_type_id'   INTEGER,
    `covered_area_comment`   TEXT,
    'exterior_type_id'       INTEGER,
    'exterior_comment'       TEXT,
    'foundation_type_id'     INTEGER,
    'foundation_comment'     TEXT,
    'structure_type_id'      INTEGER,
    'structure_comment'      TEXT,
    `estimated_install_time` INTEGER,
    `created_at`             TEXT,
    `updated_at`             TEXT,
    PRIMARY KEY (id)
)
