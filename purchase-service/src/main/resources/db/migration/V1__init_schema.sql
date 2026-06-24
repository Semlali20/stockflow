-- ============================================================
-- purchase-service V1 — initial schema
-- ============================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id                  UUID         NOT NULL DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    phone               VARCHAR(50),
    address             TEXT,
    contact_person      VARCHAR(255),
    payment_terms_days  INTEGER      NOT NULL DEFAULT 30,
    lead_time_days      INTEGER      NOT NULL DEFAULT 7,
    status              VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE'
                            CONSTRAINT chk_supplier_status
                            CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    notes               TEXT,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT pk_suppliers PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_status ON suppliers (status);
CREATE INDEX IF NOT EXISTS idx_supplier_name   ON suppliers (name);
CREATE INDEX IF NOT EXISTS idx_supplier_email  ON suppliers (email);

-- ============================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id                      UUID         NOT NULL DEFAULT gen_random_uuid(),
    reference               VARCHAR(50)  NOT NULL,
    supplier_id             VARCHAR(36),
    supplier_name           VARCHAR(255),
    status                  VARCHAR(50)  NOT NULL DEFAULT 'DRAFT'
                                CONSTRAINT chk_po_status
                                CHECK (status IN (
                                    'DRAFT', 'CONFIRMED', 'SENT',
                                    'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'
                                )),
    expected_delivery_date  DATE,
    notes                   TEXT,
    total_amount            NUMERIC(19, 2) NOT NULL DEFAULT 0,
    inventory_id            VARCHAR(100),
    created_by              VARCHAR(255),
    created_at              TIMESTAMP,
    updated_at              TIMESTAMP,
    CONSTRAINT pk_purchase_orders    PRIMARY KEY (id),
    CONSTRAINT uq_po_reference       UNIQUE (reference)
);

CREATE INDEX IF NOT EXISTS idx_po_reference  ON purchase_orders (reference);
CREATE INDEX IF NOT EXISTS idx_po_status     ON purchase_orders (status);
CREATE INDEX IF NOT EXISTS idx_po_supplier   ON purchase_orders (supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_created_by ON purchase_orders (created_by);

-- ============================================================

CREATE TABLE IF NOT EXISTS purchase_order_lines (
    id                  UUID           NOT NULL DEFAULT gen_random_uuid(),
    purchase_order_id   UUID           NOT NULL,
    item_id             VARCHAR(36),
    item_name           VARCHAR(255),
    item_sku            VARCHAR(100),
    ordered_quantity    INTEGER        NOT NULL,
    received_quantity   INTEGER        NOT NULL DEFAULT 0,
    unit_price          NUMERIC(19, 2),
    total_price         NUMERIC(19, 2),
    notes               TEXT,
    CONSTRAINT pk_purchase_order_lines    PRIMARY KEY (id),
    CONSTRAINT fk_pol_purchase_order      FOREIGN KEY (purchase_order_id)
                                          REFERENCES purchase_orders (id)
                                          ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pol_order ON purchase_order_lines (purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_pol_item  ON purchase_order_lines (item_id);
