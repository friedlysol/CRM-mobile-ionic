CREATE TABLE `work_orders`
(
    `uuid`                             TEXT,
    `id`                               INTEGER NOT NULL,
    `wo_type_id`                       INTEGER          DEFAULT NULL,
    `trade_type_id`                    INTEGER          DEFAULT NULL,
    `link_person_wo_id`                INTEGER,
    `tech_status_type_id`              INTEGER,
    `work_order_id`                    INTEGER,
    `work_order_number`                TEXT    NOT NULL,
    `address_uuid`                     TEXT,
    `address_id`                       INTEGER          DEFAULT NULL,
    `address_name`                     TEXT             DEFAULT NULL,
    `address_store_hours`              TEXT             DEFAULT NULL,
    `company_person_id`                INTEGER          DEFAULT null,
    `customer_id`                      TEXT             DEFAULT null,
    `client`                           TEXT,
    `phone`                            TEXT,
    `fax`                              TEXT,
    `current_time_sheet_reason`        TEXT,
    `primary_technician`               INTEGER,
    `status`                           TEXT,
    `priority`                         TEXT,
    `description`                      TEXT,
    `instruction`                      TEXT,
    `ivr_instructions`                 TEXT,
    `ivr_number`                       TEXT,
    `ivr_pin`                          TEXT,
    `ivr_button_url`                   TEXT,
    `ivr_button_label`                 TEXT,
    `ivr_from_store`                   INTEGER          DEFAULT 0,
    `ivr_number_forward`               TEXT,
    `required_completion_code`         INTEGER NOT NULL DEFAULT 0,
    `hazard_assessment`                TEXT             DEFAULT NULL,
    `assigned_techs_vendors`           TEXT,
    `purchase_orders`                  TEXT,
    `parts_needed`                     INTEGER,
    `parts_needed_at`                  TEXT,
    `quote_needed`                     INTEGER,
    `quote_needed_at`                  TEXT,
    `required_work_order_signature`    INTEGER          DEFAULT 0,
    `required_work_order_files`        TEXT,
    `required_asset_files`             TEXT,
    `required_labor_files`             TEXT,
    `required_validate`                TEXT,
    `unit_info_required`               INTEGER          DEFAULT 0,
    `unit_photo_required`              INTEGER          DEFAULT 0,
    `unit_tag_photo_required`          INTEGER          DEFAULT 0,
    `unit_filter_photo_required`       INTEGER          DEFAULT 0,
    `unit_coil_photo_required`         INTEGER          DEFAULT 0,
    `site_issue_required`              INTEGER          DEFAULT 0,
    `external_app_url`                 TEXT,
    `qb_info`                          TEXT,
    `count_files`                      INTEGER          DEFAULT NULL,
    `site_note`                        TEXT,
    `call_status`                      TEXT,
    `call_type`                        TEXT,
    `date_gps_confirm`                 TEXT             DEFAULT NULL,
    `integration_info`                 INTEGER          DEFAULT -1,
    `pleatlink_approved`               INTEGER          DEFAULT null,
    `is_deleted`                       INTEGER          DEFAULT 0,
    `estimated_time`                   TEXT,
    `scheduled_date`                   TEXT,
    `received_date`                    TEXT,
    `expected_completion_date`         TEXT,
    `canceled_at`                      TEXT,
    `confirmed_at`                     TEXT,
    `completed_at`                     TEXT,
    `created_at`                       TEXT,
    `updated_at`                       TEXT,
    `hash`                             TEXT,
    `sync`                             INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (uuid)
)