CREATE TABLE `work_order_status_history`
(
    `id`                           INTEGER,
    `work_order_uuid`              TEXT NOT NULL,
    `current_tech_status_type_id`  INTEGER,
    `previous_tech_status_type_id` INTEGER,
    `sync`                         INTEGER,
    `created_at`                   TEXT NOT NULL,
    `updated_at`                   TEXT NOT NULL,
    PRIMARY KEY (id)
);
