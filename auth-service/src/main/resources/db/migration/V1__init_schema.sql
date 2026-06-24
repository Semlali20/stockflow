-- ============================================================
-- auth-service V1 — initial schema
-- ============================================================

CREATE TABLE IF NOT EXISTS permissions (
    id            VARCHAR(36)  NOT NULL,
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(255),
    category      VARCHAR(50),
    resource_type VARCHAR(50),
    is_system     BOOLEAN      NOT NULL DEFAULT false,
    created_at    TIMESTAMP    NOT NULL,
    updated_at    TIMESTAMP,
    CONSTRAINT pk_permissions         PRIMARY KEY (id),
    CONSTRAINT uk_permission_name     UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_permission_name ON permissions (name);

-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id          VARCHAR(36)  NOT NULL,
    name        VARCHAR(50)  NOT NULL,
    description VARCHAR(255),
    is_system   BOOLEAN      NOT NULL DEFAULT false,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP    NOT NULL,
    updated_at  TIMESTAMP,
    CONSTRAINT pk_roles         PRIMARY KEY (id),
    CONSTRAINT uk_role_name     UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_role_name ON roles (name);

-- ============================================================

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role       FOREIGN KEY (role_id)       REFERENCES roles (id)       ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id                    VARCHAR(36)  NOT NULL,
    username              VARCHAR(50)  NOT NULL,
    email                 VARCHAR(100) NOT NULL,
    password_hash         VARCHAR(255) NOT NULL,
    first_name            VARCHAR(100),
    last_name             VARCHAR(100),
    phone_number          VARCHAR(20),
    is_active             BOOLEAN      NOT NULL DEFAULT true,
    is_locked             BOOLEAN      NOT NULL DEFAULT false,
    is_email_verified     BOOLEAN      NOT NULL DEFAULT false,
    is_phone_verified     BOOLEAN      NOT NULL DEFAULT false,
    mfa_enabled           BOOLEAN      NOT NULL DEFAULT false,
    mfa_secret            VARCHAR(64),
    failed_login_attempts INTEGER      NOT NULL DEFAULT 0,
    last_login            TIMESTAMP,
    last_password_change  TIMESTAMP,
    password_expires_at   TIMESTAMP,
    locked_until          TIMESTAMP,
    profile_image_url     TEXT,
    language              VARCHAR(10)  NOT NULL DEFAULT 'en',
    timezone              VARCHAR(50)  NOT NULL DEFAULT 'UTC',
    metadata              TEXT,
    created_at            TIMESTAMP    NOT NULL,
    updated_at            TIMESTAMP,
    deleted_at            TIMESTAMP,
    CONSTRAINT pk_users    PRIMARY KEY (id),
    CONSTRAINT uk_username UNIQUE (username),
    CONSTRAINT uk_email    UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_username  ON users (username);
CREATE INDEX IF NOT EXISTS idx_email     ON users (email);
CREATE INDEX IF NOT EXISTS idx_is_active ON users (is_active);

-- ============================================================

CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- ============================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          VARCHAR(36)  NOT NULL,
    user_id     VARCHAR(36)  NOT NULL,
    token       VARCHAR(500) NOT NULL,
    expires_at  TIMESTAMP    NOT NULL,
    is_revoked  BOOLEAN      NOT NULL DEFAULT false,
    revoked_at  TIMESTAMP,
    device_info TEXT,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    created_at  TIMESTAMP    NOT NULL,
    CONSTRAINT pk_refresh_tokens  PRIMARY KEY (id),
    CONSTRAINT uk_refresh_token   UNIQUE (token),
    CONSTRAINT fk_rt_user         FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_token      ON refresh_tokens (token);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user ON refresh_tokens (user_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id                 VARCHAR(36)  NOT NULL,
    session_token      VARCHAR(255) NOT NULL,
    user_id            VARCHAR(36)  NOT NULL,
    ip_address         VARCHAR(45),
    user_agent         VARCHAR(500),
    device_type        VARCHAR(50),
    is_active          BOOLEAN      NOT NULL DEFAULT true,
    last_activity      TIMESTAMP    NOT NULL,
    expires_at         TIMESTAMP    NOT NULL,
    terminated_at      TIMESTAMP,
    termination_reason VARCHAR(100),
    created_at         TIMESTAMP    NOT NULL,
    updated_at         TIMESTAMP,
    CONSTRAINT pk_user_sessions    PRIMARY KEY (id),
    CONSTRAINT uk_session_token    UNIQUE (session_token),
    CONSTRAINT fk_us_user          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_token ON user_sessions (session_token);
CREATE INDEX IF NOT EXISTS idx_session_user  ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_session_active ON user_sessions (is_active);

-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         VARCHAR(36)  NOT NULL,
    user_id    VARCHAR(36)  NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    is_used    BOOLEAN      NOT NULL DEFAULT false,
    used_at    TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP    NOT NULL,
    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT uk_prt_token             UNIQUE (token),
    CONSTRAINT fk_prt_user              FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prt_token   ON password_reset_tokens (token);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens (user_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id          VARCHAR(36)  NOT NULL,
    user_id     VARCHAR(36)  NOT NULL,
    token       VARCHAR(255) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    expires_at  TIMESTAMP    NOT NULL,
    is_used     BOOLEAN      NOT NULL DEFAULT false,
    verified_at TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL,
    CONSTRAINT pk_email_verification_tokens PRIMARY KEY (id),
    CONSTRAINT uk_evt_token                 UNIQUE (token),
    CONSTRAINT fk_evt_user                  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evt_token   ON email_verification_tokens (token);
CREATE INDEX IF NOT EXISTS idx_evt_user_id ON email_verification_tokens (user_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS mfa_secrets (
    id         VARCHAR(36) NOT NULL,
    user_id    VARCHAR(36) NOT NULL,
    secret     TEXT        NOT NULL,
    mfa_type   VARCHAR(20) NOT NULL
                   CONSTRAINT chk_mfa_type CHECK (mfa_type IN ('TOTP', 'SMS', 'EMAIL')),
    is_verified BOOLEAN    NOT NULL DEFAULT false,
    verified_at TIMESTAMP,
    backup_codes TEXT,
    created_at  TIMESTAMP  NOT NULL,
    updated_at  TIMESTAMP,
    CONSTRAINT pk_mfa_secrets  PRIMARY KEY (id),
    CONSTRAINT uk_mfa_user_id  UNIQUE (user_id),
    CONSTRAINT fk_mfa_user     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mfa_user ON mfa_secrets (user_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id            VARCHAR(36)  NOT NULL,
    user_id       VARCHAR(36),
    username      VARCHAR(100),
    action        VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id   VARCHAR(100),
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(500),
    status        VARCHAR(50),
    error_message VARCHAR(500),
    details       TEXT,
    timestamp     TIMESTAMP    NOT NULL,
    CONSTRAINT pk_audit_logs PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id  ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp);
