CREATE OR REPLACE VIEW vw_products AS
SELECT
    id,
    name,
    price,
    description
FROM product
WHERE deleted = false;