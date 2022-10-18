CREATE TABLE IF NOT EXISTS `accounts`
(
    `person_id`              INTEGER,
    `username`               TEXT,
    `phone`                  TEXT,
    `token`                  TEXT,
    `is_active`              INTEGER,
    `api_url`                TEXT,
    `api_fallback_url`       TEXT,
    `imei`                   TEXT,
    `device_id_auth`         TEXT,
    `device_id`              TEXT,
    `device_token`           TEXT,
    `device_token_type`      TEXT,
    `default_country_prefix` TEXT,
    `created_at`             TEXT,
    `update_at`              TEXT,
    PRIMARY KEY (person_id)
);

CREATE TABLE IF NOT EXISTS `logs`
(
    `id`         INTEGER NOT NULL,
    `type`       TEXT    NOT NULL,
    `message`    TEXT,
    `stack`      TEXT DEFAULT NULL,
    `data`       TEXT DEFAULT NULL,
    `created_at` TEXT,
    PRIMARY KEY (id)
);

CREATE INDEX logs_created_at_idx ON logs (created_at);

CREATE TABLE IF NOT EXISTS `migration_errors`
(
    `name`       TEXT,
    `query`      TEXT,
    `error`      TEXT,
    `created_at` TEXT,
    PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS `permissions`
(
    `name`   TEXT,
    `access` INTEGER,
    PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS `settings`
(
    `name`  TEXT,
    `value` TEXT,
    PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS `types`
(
    `id`         INTEGER NOT NULL,
    `type`       TEXT    NOT NULL,
    `type_key`   TEXT    NOT NULL,
    `type_value` TEXT,
    `type_order` TEXT,
    `type_color` TEXT,
    `hash`       TEXT,
    PRIMARY KEY (id)
);

CREATE INDEX types_idx ON types (type_key);
