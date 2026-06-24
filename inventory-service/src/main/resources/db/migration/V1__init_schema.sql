-- ============================================================
-- inventory-service V1 — initial schema
-- ============================================================

CREATE TABLE IF NOT EXISTS lots (
    id               VARCHAR(36)  NOT NULL,
    code             VARCHAR(100) NOT NULL,
    item_id          VARCHAR(36)  NOT NULL,
    lot_number       VARCHAR(100) NOT NULL,
    expiry_date      DATE,
    manufacture_date DATE,
    supplier_id      VARCHAR(36),
    status           VARCHAR(50)  NOT NULL
                         CONSTRAINT chk_lot_status CHECK (status IN (
                             'ACTIVE', 'QUARANTINED', 'EXPIRED', 'RECALLED'
                         )),
    attributes       TEXT,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP,
    CONSTRAINT pk_lots      PRIMARY KEY (id),
    CONSTRAINT uq_lot_code  UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS idx_lot_item   ON lots (item_id);
CREATE INDEX IF NOT EXISTS idx_lot_number ON lots (lot_number);
CREATE INDEX IF NOT EXISTS idx_lot_expiry ON lots (expiry_date);

-- ============================================================

CREATE TABLE IF NOT EXISTS serials (
    id            VARCHAR(36)  NOT NULL,
    code          VARCHAR(100) NOT NULL,
    item_id       VARCHAR(36)  NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    status        VARCHAR(50)  NOT NULL
                      CONSTRAINT chk_serial_status CHECK (status IN (
                          'IN_STOCK', 'SOLD', 'DEFECTIVE', 'RETURNING', 'SCRAPPED'
                      )),
    location_id   VARCHAR(36),
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP,
    CONSTRAINT pk_serials          PRIMARY KEY (id),
    CONSTRAINT uq_serial_code      UNIQUE (code),
    CONSTRAINT uq_serial_number    UNIQUE (serial_number)
);

CREATE INDEX IF NOT EXISTS idx_serial_item   ON serials (item_id);
CREATE INDEX IF NOT EXISTS idx_serial_number ON serials (serial_number);

-- ============================================================

CREATE TABLE IF NOT EXISTS inventory (
    id                VARCHAR(36)    NOT NULL,
    version           BIGINT         NOT NULL DEFAULT 0,
    item_id           VARCHAR(36)    NOT NULL,
    warehouse_id      VARCHAR(36)    NOT NULL,
    location_id       VARCHAR(36)    NOT NULL,
    lot_id            VARCHAR(36),
    serial_id         VARCHAR(36),
    quantity_on_hand  DOUBLE PRECISION NOT NULL DEFAULT 0,
    quantity_reserved DOUBLE PRECISION NOT NULL DEFAULT 0,
    quantity_damaged  DOUBLE PRECISION,
    uom               VARCHAR(20),
    status            VARCHAR(50)    NOT NULL
                          CONSTRAINT chk_inventory_status CHECK (status IN (
                              'AVAILABLE', 'RESERVED', 'ALLOCATED',
                              'DAMAGED', 'QUARANTINED', 'EXPIRED'
                          )),
    unit_cost         NUMERIC(19, 4),
    expiry_date       DATE,
    manufacture_date  DATE,
    last_count_date   DATE,
    attributes        TEXT,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP,
    CONSTRAINT pk_inventory     PRIMARY KEY (id),
    CONSTRAINT fk_inv_lot       FOREIGN KEY (lot_id)
                                REFERENCES lots (id)
                                ON DELETE SET NULL,
    CONSTRAINT fk_inv_serial    FOREIGN KEY (serial_id)
                                REFERENCES serials (id)
                                ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_item_id       ON inventory (item_id);
CREATE INDEX IF NOT EXISTS idx_location_id   ON inventory (location_id);
CREATE INDEX IF NOT EXISTS idx_item_location ON inventory (item_id, location_id);
