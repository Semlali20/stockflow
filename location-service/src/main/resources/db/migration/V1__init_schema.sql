-- ============================================================
-- location-service V1 — initial schema
-- ============================================================

CREATE TABLE IF NOT EXISTS sites (
    id         VARCHAR(36)  NOT NULL,
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(50)  NOT NULL
                   CONSTRAINT chk_site_type CHECK (type IN (
                       'WAREHOUSE', 'DISTRIBUTION_CENTER', 'STORE',
                       'MANUFACTURING', 'PICKING', 'STAGING', 'SHIPPING', 'QUARANTINE'
                   )),
    timezone   VARCHAR(100),
    address    VARCHAR(500),
    settings   TEXT,
    is_active  BOOLEAN      NOT NULL DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT pk_sites PRIMARY KEY (id)
);

-- ============================================================

CREATE TABLE IF NOT EXISTS warehouses (
    id         VARCHAR(36) NOT NULL,
    site_id    VARCHAR(36) NOT NULL,
    name       VARCHAR(100) NOT NULL,
    code       VARCHAR(50)  NOT NULL,
    address    VARCHAR(255),
    settings   TEXT,
    is_active  BOOLEAN     NOT NULL DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT pk_warehouses      PRIMARY KEY (id),
    CONSTRAINT uq_warehouse_code  UNIQUE (code),
    CONSTRAINT fk_wh_site         FOREIGN KEY (site_id)
                                  REFERENCES sites (id)
                                  ON DELETE RESTRICT
);

-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
    id           VARCHAR(36) NOT NULL,
    version      BIGINT      NOT NULL DEFAULT 0,
    warehouse_id VARCHAR(36) NOT NULL,
    code         VARCHAR(50) NOT NULL,
    zone         VARCHAR(50),
    aisle        VARCHAR(50),
    rack         VARCHAR(50),
    level        VARCHAR(50),
    bin          VARCHAR(50),
    type         VARCHAR(50) NOT NULL
                     CONSTRAINT chk_location_type CHECK (type IN (
                         'RECEIVING', 'STORAGE', 'PICKING', 'STAGING',
                         'SHIPPING', 'QUARANTINE', 'MANUFACTURING', 'RETURNS'
                     )),
    capacity     TEXT,
    restrictions TEXT,
    coordinates  TEXT,
    is_active    BOOLEAN     NOT NULL DEFAULT true,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP,
    CONSTRAINT pk_locations              PRIMARY KEY (id),
    CONSTRAINT uq_location_wh_code       UNIQUE (warehouse_id, code),
    CONSTRAINT fk_loc_warehouse          FOREIGN KEY (warehouse_id)
                                         REFERENCES warehouses (id)
                                         ON DELETE RESTRICT
);
