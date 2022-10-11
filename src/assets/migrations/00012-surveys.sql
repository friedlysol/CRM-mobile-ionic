CREATE TABLE `surveys`
(
    `uuid`                TEXT    DEFAULT NULL,
    `id`                  INTEGER,
    `survey_id`           INTEGER,
    `type_id`             INTEGER DEFAULT NULL,
    `name`                TEXT,
    `table_name`          TEXT,
    `record_id`           INTEGER,
    `number_of_questions` INTEGER DEFAULT 0,
    `require_every_day`   INTEGER DEFAULT 0,
    `scheduled_date`      TEXT    DEFAULT NULL,
    `address_name`        TEXT    DEFAULT NULL,
    `status_type_id`      INTEGER DEFAULT NULL,
    `technician`          TEXT    DEFAULT NULL,
    `comment`             TEXT    DEFAULT NULL,
    `hash`                TEXT,
    `sync`                INTEGER,
    `created_at`          TEXT,
    `updated_at`          TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE `survey_questions`
(
    `uuid`          TEXT    DEFAULT NULL,
    `id`            INTEGER,
    `survey_id`     INTEGER,
    `group_type_id` INTEGER DEFAULT NULL,
    `title`         TEXT,
    `help_text`     TEXT,
    `type`          TEXT,
    `options`       TEXT,
    `order_by`      TEXT,
    `required`      INTEGER,
    `photo`         TEXT,
    `active`        INTEGER DEFAULT 1,
    `hash`          TEXT,
    `sync`          INTEGER,
    `created_at`    TEXT,
    `updated_at`    TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE `survey_results`
(
    `uuid`                 TEXT,
    `id`                   INTEGER,
    `survey_instance_uuid` TEXT DEFAULT NULL,
    `survey_instance_id`   INTEGER,
    `survey_question_id`   INTEGER,
    `answer`               TEXT,
    `comment`              TEXT DEFAULT NULL,
    `object_type`          TEXT,
    `object_uuid`          TEXT,
    `object_id`            INTEGER,
    `sync`                 INTEGER,
    `hash`                 TEXT,
    `created_at`           TEXT,
    `updated_at`           TEXT,
    PRIMARY KEY (uuid)
);
