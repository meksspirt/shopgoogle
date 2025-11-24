-- Создание функции для удаления заказа с правами SECURITY DEFINER
-- Это позволит обойти политики RLS

CREATE OR REPLACE FUNCTION delete_order_with_items(order_id_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_items_count int;
  deleted_order_count int;
  result json;
BEGIN
  -- Удаляем элементы заказа
  DELETE FROM order_items WHERE order_id = order_id_param;
  GET DIAGNOSTICS deleted_items_count = ROW_COUNT;
  
  -- Удаляем заказ
  DELETE FROM orders WHERE id = order_id_param;
  GET DIAGNOSTICS deleted_order_count = ROW_COUNT;
  
  -- Возвращаем результат
  result := json_build_object(
    'success', deleted_order_count > 0,
    'deleted_items', deleted_items_count,
    'deleted_order', deleted_order_count > 0
  );
  
  RETURN result;
END;
$$;

-- Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION delete_order_with_items(text) TO anon;
GRANT EXECUTE ON FUNCTION delete_order_with_items(text) TO authenticated;

-- Тестируем функцию (закомментируйте, если не хотите тестировать)
-- SELECT delete_order_with_items('KKND1X');
