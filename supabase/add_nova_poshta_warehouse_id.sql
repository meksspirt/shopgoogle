-- Add nova_poshta_warehouse_id column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS nova_poshta_warehouse_id TEXT;

-- Add comment to the column
COMMENT ON COLUMN orders.nova_poshta_warehouse_id IS 'ID відділення Нової Пошти з віджету';
