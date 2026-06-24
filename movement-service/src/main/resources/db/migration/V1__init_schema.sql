-- ============================================================
-- movement-service V1 — initial schema
-- ============================================================

CREATE TABLE IF NOT EXISTS movements (
    id                      UUID        NOT NULL DEFAULT gen_random_uuid(),
    type                    VARCHAR(50) NOT NULL
                                CONSTRAINT chk_movement_type CHECK (type IN (
                                    'RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT',
                                    'PICKING', 'PUTAWAY', 'RETURN', 'CYCLE_COUNT',
                                    'QUARANTINE', 'RELOCATION'
                                )),
    movement_date           TIMESTAMP   NOT NULL,
    status                  VARCHAR(50) NOT NULL
                                CONSTRAINT chk_movement_status CHECK (status IN (
                                    'DRAFT', 'PENDING', 'IN_PROGRESS', 'COMPLETED',
                                    'CANCELLED', 'ON_HOLD', 'PARTIALLY_COMPLETED'
                                )),
    priority                VARCHAR(20) NOT NULL DEFAULT 'NORMAL'
                                CONSTRAINT chk_movement_priority CHECK (priority IN (
                                    'LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'
                                )),
    expected_date           TIMESTAMP,
    actual_date             TIMESTAMP,
    scheduled_date          TIMESTAMP,
    source_location_id      UUID,
    destination_location_id UUID,
    source_user_id          UUID,
    destination_user_id     UUID,
    warehouse_id            UUID        NOT NULL,
    reference_number        VARCHAR(100),
    notes                   TEXT,
    reason                  VARCHAR(500),
    created_by              UUID        NOT NULL,
    created_at              TIMESTAMP   NOT NULL,
    updated_at              TIMESTAMP,
    completed_by            UUID,
    completed_at            TIMESTAMP,
    CONSTRAINT pk_movements PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_movement_status_type   ON movements (status, type);
CREATE INDEX IF NOT EXISTS idx_movement_warehouse      ON movements (warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_movement_date           ON movements (movement_date);
CREATE INDEX IF NOT EXISTS idx_movement_locations      ON movements (source_location_id, destination_location_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS movement_lines (
    id                 UUID        NOT NULL DEFAULT gen_random_uuid(),
    movement_id        UUID        NOT NULL,
    item_id            UUID        NOT NULL,
    requested_quantity DOUBLE PRECISION NOT NULL,
    actual_quantity    DOUBLE PRECISION,
    uom                VARCHAR(20),
    lot_id             UUID,
    serial_id          UUID,
    from_location_id   UUID,
    to_location_id     UUID,
    status             VARCHAR(50) NOT NULL DEFAULT 'PENDING'
                           CONSTRAINT chk_line_status CHECK (status IN (
                               'PENDING', 'ALLOCATED', 'PICKED', 'PACKED',
                               'IN_TRANSIT', 'RECEIVED', 'COMPLETED',
                               'CANCELLED', 'SHORT_PICKED'
                           )),
    line_number        INTEGER     NOT NULL,
    notes              TEXT,
    reason             VARCHAR(500),
    created_at         TIMESTAMP   NOT NULL,
    updated_at         TIMESTAMP,
    CONSTRAINT pk_movement_lines   PRIMARY KEY (id),
    CONSTRAINT fk_ml_movement      FOREIGN KEY (movement_id)
                                   REFERENCES movements (id)
                                   ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_line_movement ON movement_lines (movement_id);
CREATE INDEX IF NOT EXISTS idx_line_item     ON movement_lines (item_id, status);
CREATE INDEX IF NOT EXISTS idx_line_lot      ON movement_lines (lot_id);
CREATE INDEX IF NOT EXISTS idx_line_serial   ON movement_lines (serial_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS movement_tasks (
    id                       UUID        NOT NULL DEFAULT gen_random_uuid(),
    movement_id              UUID        NOT NULL,
    movement_line_id         UUID,
    assigned_user_id         UUID,
    task_type                VARCHAR(50) NOT NULL
                                 CONSTRAINT chk_task_type CHECK (task_type IN (
                                     'PICK', 'PACK', 'PUT_AWAY', 'COUNT',
                                     'LOAD', 'UNLOAD', 'STAGE', 'REPLENISH'
                                 )),
    status                   VARCHAR(50) NOT NULL DEFAULT 'PENDING'
                                 CONSTRAINT chk_task_status CHECK (status IN (
                                     'PENDING', 'ASSIGNED', 'IN_PROGRESS',
                                     'COMPLETED', 'CANCELLED', 'FAILED'
                                 )),
    priority                 INTEGER     NOT NULL DEFAULT 5,
    scheduled_start_time     TIMESTAMP,
    actual_start_time        TIMESTAMP,
    expected_completion_time TIMESTAMP,
    actual_completion_time   TIMESTAMP,
    location_id              UUID,
    instructions             TEXT,
    notes                    TEXT,
    created_at               TIMESTAMP   NOT NULL,
    updated_at               TIMESTAMP,
    CONSTRAINT pk_movement_tasks  PRIMARY KEY (id),
    CONSTRAINT fk_mt_movement     FOREIGN KEY (movement_id)
                                  REFERENCES movements (id)
                                  ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_movement  ON movement_tasks (movement_id);
CREATE INDEX IF NOT EXISTS idx_task_user      ON movement_tasks (assigned_user_id, status);
CREATE INDEX IF NOT EXISTS idx_task_scheduled ON movement_tasks (scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_task_location  ON movement_tasks (location_id);
