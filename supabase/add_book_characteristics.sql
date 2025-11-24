-- Добавление характеристик книг в таблицу products
ALTER TABLE products ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS publisher TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS translator TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'Українська';
ALTER TABLE products ADD COLUMN IF NOT EXISTS pages INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cover_type TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS isbn TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS format TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS book_type TEXT;

-- Комментарии к полям
COMMENT ON COLUMN products.author IS 'Автор книги';
COMMENT ON COLUMN products.publisher IS 'Видавництво';
COMMENT ON COLUMN products.translator IS 'Перекладач';
COMMENT ON COLUMN products.year IS 'Рік видання';
COMMENT ON COLUMN products.language IS 'Мова';
COMMENT ON COLUMN products.pages IS 'Кількість сторінок';
COMMENT ON COLUMN products.cover_type IS 'Обкладинка (тверда/м''яка)';
COMMENT ON COLUMN products.isbn IS 'ISBN';
COMMENT ON COLUMN products.format IS 'Формат (наприклад, 140x210мм)';
COMMENT ON COLUMN products.book_type IS 'Тип книги (паперова/електронна)';
