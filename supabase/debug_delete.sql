-- Проверка текущих политик для order_items
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'order_items';

-- Проверка существующих заказов и их элементов
SELECT o.id, o.customer_name, COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.customer_name
ORDER BY o.created_at DESC
LIMIT 10;
