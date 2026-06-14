-- Sequence to handle the per-millisecond counter (12 bits = 0-4095)
CREATE SEQUENCE IF NOT EXISTS snowflake_id_seq;

CREATE OR REPLACE FUNCTION fn_next_snowflake_id(
    p_worker_id INT DEFAULT 1
)
RETURNS BIGINT AS $$
DECLARE
    v_epoch       BIGINT := 1779840000000; -- 2026-05-23T00:00:00Z in ms
    v_now_ms      BIGINT;
    v_seq         BIGINT;
    v_result      BIGINT;
BEGIN
    -- current time in milliseconds since unix epoch
    v_now_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

    -- 12-bit sequence, wraps at 4096
    v_seq := nextval('snowflake_id_seq') % 4096;

    -- layout: 41 bits timestamp | 10 bits worker id | 12 bits sequence
    v_result := ((v_now_ms - v_epoch) << 22)
               | ((p_worker_id & 1023) << 12)
               | v_seq;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql VOLATILE;