CREATE OR REPLACE VIEW vw_app_users AS
SELECT
    id,
    name,
    username
FROM app_user
WHERE deleted = FALSE;