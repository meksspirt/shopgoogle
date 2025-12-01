-- Додавання налаштувань для API Нової Пошти
-- Виконайте цей скрипт в Supabase SQL Editor

-- Додаємо налаштування для API ключа
INSERT INTO settings (key, value, description)
VALUES 
  ('nova_poshta_api_key', '', 'API ключ Нової Пошти для створення накладних')
ON CONFLICT (key) DO NOTHING;

-- Додаємо налаштування для даних відправника
INSERT INTO settings (key, value, description)
VALUES 
  ('nova_poshta_sender_city_ref', '', 'Ref міста відправника в системі Нової Пошти'),
  ('nova_poshta_sender_warehouse_ref', '', 'Ref відділення відправника'),
  ('nova_poshta_sender_contact_ref', '', 'Ref контакту відправника'),
  ('nova_poshta_sender_phone', '', 'Телефон відправника у форматі +380XXXXXXXXX')
ON CONFLICT (key) DO NOTHING;

-- Перевірка
SELECT key, value, description 
FROM settings 
WHERE key LIKE 'nova_poshta%'
ORDER BY key;
