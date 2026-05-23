-- V2__Create_product_table.sql
CREATE TABLE product (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL
);

-- Trigger to update updated_at on update
CREATE OR REPLACE FUNCTION update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_updated_at_trigger
    BEFORE UPDATE ON product
    FOR EACH ROW
    EXECUTE FUNCTION update_product_updated_at();
