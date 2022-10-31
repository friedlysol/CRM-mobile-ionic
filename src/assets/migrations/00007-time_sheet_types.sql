CREATE TABLE `time_sheet_types`
(
    `id`                      INTEGER NOT NULL,
    `reason_type_id`          INTEGER NOT NULL,
    `is_description_required` INTEGER DEFAULT 0,
    `is_work_order_related`   INTEGER DEFAULT 0,
    `name`                    TEXT    NOT NULL,
    PRIMARY KEY (id)
);
