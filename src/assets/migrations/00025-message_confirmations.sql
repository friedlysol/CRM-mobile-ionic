CREATE TABLE `message_confirmations`
(
    `uuid`          TEXT,
    `id`            INTEGER          DEFAULT NULL,
    `message_uuid`  TEXT,
    `message_id`    INTEGER          DEFAULT NULL,
    `work_order_id` INTEGER,
    `created_at`    TEXT,
    `sync`          INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (uuid)
)
