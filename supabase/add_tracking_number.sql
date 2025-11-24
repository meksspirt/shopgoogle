-- Добавление поля tracking_number (ТТН) в таблицу orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Добавление комментария к полю
COMMENT ON COLUMN orders.tracking_number IS 'Номер ТТН Новой Почты для отслеживания посылки';
