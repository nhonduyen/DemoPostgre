INSERT INTO app_user (id, name, username, password, salt)
VALUES (
    fn_next_snowflake_id(1),
    'Administrator',
    'admin',
    '123456',  -- see below for generating this
    'abcxyz'
)
ON CONFLICT (username) DO NOTHING;