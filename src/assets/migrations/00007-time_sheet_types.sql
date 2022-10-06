CREATE TABLE `time_sheet_types`
(
    `id`                      INTEGER NOT NULL,
    `is_description_required` INTEGER NOT NULL,
    `is_work_order_related`   INTEGER NOT NULL,
    `label`                   TEXT    NOT NULL,
    PRIMARY KEY (id)
)
