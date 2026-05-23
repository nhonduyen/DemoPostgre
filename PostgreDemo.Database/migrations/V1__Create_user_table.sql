-- V1__Create_user_table.sql
CREATE TABLE "app_user" (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL
);

-- Trigger to update updated_at on update
CREATE OR REPLACE FUNCTION update_app_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_user_updated_at_trigger
    BEFORE UPDATE ON "app_user"
    FOR EACH ROW
    EXECUTE FUNCTION update_app_user_updated_at();