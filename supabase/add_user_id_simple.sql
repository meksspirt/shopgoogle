-- Простий варіант: тільки додаємо колонку user_id
-- Політики залишаємо як є (публічні)

-- Добавляем колонку user_id в таблицу orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Создаем индекс для быстрого поиска заказов пользователя
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Комментарий для документации
COMMENT ON COLUMN orders.user_id IS 'ID пользователя из auth.users. NULL для гостевых заказов';
