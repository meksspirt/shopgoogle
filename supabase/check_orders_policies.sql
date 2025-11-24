-- Проверка политик для таблицы orders
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders';

-- Проверка, существует ли заказ KKND1X
SELECT id, customer_name, status, created_at
FROM orders
WHERE id = 'KKND1X';
