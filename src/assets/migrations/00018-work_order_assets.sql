CREATE TABLE `work_order_assets`
(
    `uuid`                    TEXT,
    `work_order_uuid`         TEXT,
    `work_order_id`           TEXT,
    `asset_uuid`              TEXT,
    `asset_id`                TEXT,
    `link_asset_person_wo_id` TEXT,
    `service_type_id`         INTEGER DEFAULT NULL,
    `skipped_asset_service`   INTEGER DEFAULT NULL,
    `work_requested`          TEXT,
    `work_performed`          TEXT,
    `hash`                    TEXT,
    `sync`                    INTEGER DEFAULT 0,
    `created_at`              TEXT,
    `updated_at`              TEXT
);

CREATE INDEX work_order_assets_idx ON work_order_assets (work_order_uuid, asset_uuid, work_performed, sync);
