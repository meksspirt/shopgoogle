-- Удаляем все существующие политики для order_items
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
DROP POLICY IF EXISTS "Public can view order items" ON order_items;
DROP POLICY IF EXISTS "Public can delete order items" ON order_items;
DROP POLICY IF EXISTS "Public can update order items" ON order_items;

-- Создаем новые политики с полным доступом
CREATE POLICY "Public can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Public can delete order items"
  ON order_items FOR DELETE
  USING (true);

CREATE POLICY "Public can update order items"
  ON order_items FOR UPDATE
  USING (true);

-- Проверяем, что политики созданы
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'order_items';
