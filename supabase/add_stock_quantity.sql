-- Добавление поля stock_quantity (количество на складе) в таблицу products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Добавление комментария к полю
COMMENT ON COLUMN products.stock_quantity IS 'Количество товара на складе';

-- Установить значение по умолчанию для существующих товаров
UPDATE products SET stock_quantity = 999 WHERE stock_quantity IS NULL OR stock_quantity = 0;
