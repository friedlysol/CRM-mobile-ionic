CREATE TABLE `messages`
(
    `uuid`                 TEXT,
    `id`                   INTEGER,
    `person_id`            INTEGER,
    `creator_person_id`    INTEGER,
    `subject`              TEXT,
    `description`          TEXT,
    `hot`                  INTEGER NOT NULL DEFAULT 0,
    `object_type`          TEXT,
    `object_uuid`          TEXT,
    `object_id`            INTEGER,
    `address_id`           INTEGER          DEFAULT null,
    `address_name`         TEXT             DEFAULT NULL,
    `customer_ids`         TEXT             DEFAULT NULL,
    `type`                 TEXT,
    `work_order_number`    TEXT,
    `client_and_address`   TEXT,
    `view_type_id`         INTEGER          DEFAULT null,
    `interval_type_id`     INTEGER          DEFAULT null,
    `limit_of_repetitions` INTEGER          DEFAULT 0,
    `hash`                 TEXT,
    `sync`                 INTEGER          DEFAULT 0,
    `completed`            INTEGER NOT NULL DEFAULT 0,
    `completed_at`         TEXT,
    `created_at`           TEXT,
    `updated_at`           TEXT             DEFAULT NULL,
    PRIMARY KEY (uuid)
);

CREATE TABLE `message_repeats`
(
    `uuid`                  TEXT,
    `message_id`            INTEGER,
    `customer_id`           INTEGER,
    `number_of_repetitions` INTEGER DEFAULT 0,
    `created_at`            TEXT,
    `updated_at`            TEXT,
    PRIMARY KEY (uuid)
);
