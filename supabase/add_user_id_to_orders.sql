-- Добавляем колонку user_id в таблицу orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Создаем индекс для быстрого поиска заказов пользователя
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Удаляем ВСЕ существующие политики для orders
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can update orders" ON orders;
DROP POLICY IF EXISTS "Public can delete orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

-- Создаем новые политики для orders

-- 1. Пользователи могут видеть только свои заказы (по user_id или по email)
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (
    auth.uid() = user_id 
    OR 
    customer_email = auth.jwt()->>'email'
);

-- 2. Любой может создавать заказы (для гостевых покупок)
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);

-- 3. Администраторы могут видеть все заказы
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- 4. Администраторы могут обновлять все заказы
CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- 5. Администраторы могут удалять заказы
CREATE POLICY "Admins can delete orders"
ON orders FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- Обновляем политики для order_items

-- Удаляем ВСЕ существующие политики для order_items
DROP POLICY IF EXISTS "Public can view order items" ON order_items;
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
DROP POLICY IF EXISTS "Public can delete order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can delete order items" ON order_items;

-- 1. Пользователи могут видеть товары только своих заказов
CREATE POLICY "Users can view their order items"
ON order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND (
            orders.user_id = auth.uid()
            OR
            orders.customer_email = auth.jwt()->>'email'
        )
    )
);

-- 2. Любой может создавать order_items (для гостевых покупок)
CREATE POLICY "Anyone can create order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- 3. Администраторы могут видеть все order_items
CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- 4. Администраторы могут удалять order_items
CREATE POLICY "Admins can delete order items"
ON order_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- Комментарии для документации
COMMENT ON COLUMN orders.user_id IS 'ID пользователя из auth.users. NULL для гостевых заказов';
COMMENT ON POLICY "Users can view their own orders" ON orders IS 'Пользователи видят заказы по user_id или email';
COMMENT ON POLICY "Admins can view all orders" ON orders IS 'Администраторы видят все заказы';
