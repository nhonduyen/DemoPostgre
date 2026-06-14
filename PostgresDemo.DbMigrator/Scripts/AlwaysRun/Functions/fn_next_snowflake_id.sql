CREATE SEQUENCE IF NOT EXISTS snowflake_sequence
    MINVALUE 0
    MAXVALUE 4095
    CYCLE;

CREATE OR REPLACE FUNCTION generate_snowflake()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    -- 2026-05-23T00:00:00Z in milliseconds
    custom_epoch BIGINT := 1779494400000;

    current_ms BIGINT;
    worker_id INT := 1;
    seq BIGINT;
BEGIN
    current_ms := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000);

    seq := nextval('snowflake_sequence') % 4096;

    RETURN
        ((current_ms - custom_epoch) << 22)
        | ((worker_id & 1023) << 12)
        | seq;
END;
$$;