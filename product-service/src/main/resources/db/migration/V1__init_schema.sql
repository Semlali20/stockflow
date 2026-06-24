-- ============================================================
-- product-service V1 — initial schema
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id                VARCHAR(36)  NOT NULL,
    name              VARCHAR(100) NOT NULL,
    description       VARCHAR(500),
    parent_category_id VARCHAR(36),
    display_order     INTEGER,
    attribute_schemas JSONB,
    is_active         BOOLEAN      NOT NULL DEFAULT true,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP,
    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT fk_cat_parent FOREIGN KEY (parent_category_id)
                             REFERENCES categories (id)
                             ON DELETE SET NULL
);

-- ============================================================

CREATE TABLE IF NOT EXISTS items (
    id                  VARCHAR(36)  NOT NULL,
    version             BIGINT       NOT NULL DEFAULT 0,
    category_id         VARCHAR(36)  NOT NULL,
    sku                 VARCHAR(50)  NOT NULL,
    name                VARCHAR(200) NOT NULL,
    description         VARCHAR(1000),
    attributes          JSONB,
    tags                VARCHAR(500),
    image_url           TEXT,
    is_serialized       BOOLEAN      NOT NULL DEFAULT false,
    is_lot_managed      BOOLEAN      NOT NULL DEFAULT false,
    shelf_life_days     INTEGER,
    hazardous_material  BOOLEAN      NOT NULL DEFAULT false,
    temperature_control JSONB,
    is_active           BOOLEAN      NOT NULL DEFAULT true,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT pk_items  PRIMARY KEY (id),
    CONSTRAINT uq_item_sku UNIQUE (sku),
    CONSTRAINT fk_item_category FOREIGN KEY (category_id)
                                REFERENCES categories (id)
);

-- ============================================================

CREATE TABLE IF NOT EXISTS item_variants (
    id                VARCHAR(36) NOT NULL,
    parent_item_id    VARCHAR(36) NOT NULL,
    sku               VARCHAR(50) NOT NULL,
    variant_attributes JSONB,
    is_active         BOOLEAN     NOT NULL DEFAULT true,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP,
    CONSTRAINT pk_item_variants     PRIMARY KEY (id),
    CONSTRAINT uq_item_variant_sku  UNIQUE (sku),
    CONSTRAINT fk_iv_parent_item    FOREIGN KEY (parent_item_id)
                                    REFERENCES items (id)
                                    ON DELETE CASCADE
);
