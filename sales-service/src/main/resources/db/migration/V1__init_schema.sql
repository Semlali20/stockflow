-- ============================================================
-- sales-service V1 — initial schema
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id                  UUID         NOT NULL DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    phone               VARCHAR(50),
    address             TEXT,
    contact_person      VARCHAR(255),
    payment_terms_days  INTEGER      NOT NULL DEFAULT 30,
    status              VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE'
                            CONSTRAINT chk_customer_status
                            CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    notes               TEXT,
    created_at          TIMESTAMP    NOT NULL,
    updated_at          TIMESTAMP,
    CONSTRAINT pk_customers PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_customer_status ON customers (status);
CREATE INDEX IF NOT EXISTS idx_customer_email  ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customer_name   ON customers (name);

-- ============================================================

CREATE TABLE IF NOT EXISTS quotes (
    id               UUID          NOT NULL DEFAULT gen_random_uuid(),
    reference        VARCHAR(50),
    customer_id      VARCHAR(100),
    customer_name    VARCHAR(255),
    status           VARCHAR(50)   NOT NULL DEFAULT 'DRAFT'
                         CONSTRAINT chk_quote_status
                         CHECK (status IN (
                             'DRAFT', 'SENT', 'ACCEPTED',
                             'REJECTED', 'EXPIRED', 'CONVERTED'
                         )),
    valid_until      DATE,
    notes            TEXT,
    discount_percent NUMERIC(5, 2)  NOT NULL DEFAULT 0,
    subtotal         NUMERIC(19, 2),
    total_amount     NUMERIC(19, 2),
    inventory_id     VARCHAR(100),
    location_id      VARCHAR(100),
    created_by       VARCHAR(255),
    created_at       TIMESTAMP     NOT NULL,
    updated_at       TIMESTAMP,
    CONSTRAINT pk_quotes          PRIMARY KEY (id),
    CONSTRAINT uq_quote_reference UNIQUE (reference)
);

CREATE INDEX IF NOT EXISTS idx_quote_status    ON quotes (status);
CREATE INDEX IF NOT EXISTS idx_quote_customer  ON quotes (customer_id);
CREATE INDEX IF NOT EXISTS idx_quote_reference ON quotes (reference);

-- ============================================================

CREATE TABLE IF NOT EXISTS quote_lines (
    id               UUID          NOT NULL DEFAULT gen_random_uuid(),
    quote_id         UUID          NOT NULL,
    item_id          VARCHAR(100),
    item_name        VARCHAR(255),
    item_sku         VARCHAR(100),
    quantity         INTEGER,
    unit_price       NUMERIC(19, 2),
    discount_percent NUMERIC(5, 2)  NOT NULL DEFAULT 0,
    total_price      NUMERIC(19, 2),
    notes            TEXT,
    CONSTRAINT pk_quote_lines    PRIMARY KEY (id),
    CONSTRAINT fk_ql_quote       FOREIGN KEY (quote_id)
                                 REFERENCES quotes (id)
                                 ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quote_line_quote ON quote_lines (quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_item  ON quote_lines (item_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS delivery_notes (
    id               UUID         NOT NULL DEFAULT gen_random_uuid(),
    reference        VARCHAR(50),
    quote_id         VARCHAR(100),
    customer_id      VARCHAR(100),
    customer_name    VARCHAR(255),
    status           VARCHAR(50)  NOT NULL DEFAULT 'DRAFT'
                         CONSTRAINT chk_delivery_note_status
                         CHECK (status IN ('DRAFT', 'VALIDATED')),
    delivery_date    DATE,
    delivery_address TEXT,
    notes            TEXT,
    total_amount     NUMERIC(19, 2),
    inventory_id     VARCHAR(100),
    location_id      VARCHAR(100),
    created_by       VARCHAR(255),
    created_at       TIMESTAMP    NOT NULL,
    updated_at       TIMESTAMP,
    CONSTRAINT pk_delivery_notes           PRIMARY KEY (id),
    CONSTRAINT uq_delivery_note_reference  UNIQUE (reference)
);

CREATE INDEX IF NOT EXISTS idx_delivery_note_status    ON delivery_notes (status);
CREATE INDEX IF NOT EXISTS idx_delivery_note_customer  ON delivery_notes (customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_note_reference ON delivery_notes (reference);
CREATE INDEX IF NOT EXISTS idx_delivery_note_quote     ON delivery_notes (quote_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS delivery_note_lines (
    id                  UUID          NOT NULL DEFAULT gen_random_uuid(),
    delivery_note_id    UUID          NOT NULL,
    item_id             VARCHAR(100),
    item_name           VARCHAR(255),
    item_sku            VARCHAR(100),
    ordered_quantity    INTEGER,
    delivered_quantity  INTEGER       NOT NULL DEFAULT 0,
    lot_id              VARCHAR(100),
    serial_id           VARCHAR(100),
    unit_price          NUMERIC(19, 2),
    discount_percent    NUMERIC(5, 2)  NOT NULL DEFAULT 0,
    total_price         NUMERIC(19, 2),
    notes               TEXT,
    CONSTRAINT pk_delivery_note_lines   PRIMARY KEY (id),
    CONSTRAINT fk_dnl_delivery_note     FOREIGN KEY (delivery_note_id)
                                        REFERENCES delivery_notes (id)
                                        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_delivery_line_note ON delivery_note_lines (delivery_note_id);
CREATE INDEX IF NOT EXISTS idx_delivery_line_item ON delivery_note_lines (item_id);
