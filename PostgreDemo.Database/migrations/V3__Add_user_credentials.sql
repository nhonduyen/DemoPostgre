-- V3__Add_user_credentials.sql
ALTER TABLE "app_user"
    ADD COLUMN username VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN password TEXT NOT NULL DEFAULT '',
    ADD COLUMN salt TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS app_user_username_key ON "app_user" (username);
