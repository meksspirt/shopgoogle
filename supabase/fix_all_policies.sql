-- Исправление всех политик для orders и order_items

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Удаляем все существующие политики для orders
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Public can update orders" ON orders;
DROP POLICY IF EXISTS "Public can delete orders" ON orders;
DROP POLICY IF EXISTS "Public orders are viewable by everyone" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;

-- Создаем новые политики с полным доступом
CREATE POLICY "Public can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Public can update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete orders"
  ON orders FOR DELETE
  USING (true);

-- ============================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================

-- Удаляем все существующие политики для order_items
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
DROP POLICY IF EXISTS "Public can view order items" ON order_items;
DROP POLICY IF EXISTS "Public can delete order items" ON order_items;
DROP POLICY IF EXISTS "Public can update order items" ON order_items;
DROP POLICY IF EXISTS "Public insert access for order_items" ON order_items;

-- Создаем новые политики с полным доступом
CREATE POLICY "Public can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Public can update order items"
  ON order_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete order items"
  ON order_items FOR DELETE
  USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Проверяем созданные политики для orders
SELECT 'ORDERS POLICIES:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'orders';

-- Проверяем созданные политики для order_items
SELECT 'ORDER_ITEMS POLICIES:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'order_items';
