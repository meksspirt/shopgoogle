-- SEO Settings для сайта психологічного посібника
-- Виконайте цей SQL запит у вашій Supabase консолі

-- Основні SEO налаштування
INSERT INTO settings (key, value) 
VALUES 
  ('site_title', 'CalmCraft - Психологічний посібник'),
  ('site_description', 'Психологічний посібник від практикуючого психолога. Інструменти для особистісного зростання та емоційного благополуччя'),
  ('site_keywords', 'психологія, психологічний посібник, саморозвиток, емоційне здоров''я, особистісне зростання, психолог, психологічна допомога'),
  ('site_url', 'https://www.calmcraft.shop'),
  ('site_author', 'CalmCraft'),
  ('og_image', '/og-image.png')
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value;

-- Інформація про автора (вашу дівчину-психолога)
INSERT INTO settings (key, value) 
VALUES 
  ('author_name', 'Анна Клім'),  -- Замініть на реальне ім'я
  ('author_title', 'Психолог'),
  ('author_bio', 'Практикуючий психолог з досвідом...') -- Короткий опис
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value;

-- Інформація про посібник
INSERT INTO settings (key, value) 
VALUES 
  ('book_title', 'Breathe Self Space'),  -- Замініть на реальну назву
  ('book_price', '1500')  -- Ціна в гривнях
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value;

-- Контактна інформація
INSERT INTO settings (key, value) 
VALUES 
  ('site_phone', '+380 XX XXX XX XX'),
  ('site_email', 'info@calmcraft.com.ua')
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value;

-- Verification codes (залиште пустими або додайте свої)
INSERT INTO settings (key, value) 
VALUES 
  ('google_verification', ''),
  ('yandex_verification', '')
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value;

-- Посилання на соціальні мережі (опціонально)
INSERT INTO settings (key, value) 
VALUES 
  ('social_instagram', 'https://instagram.com/username'),
  ('social_facebook', 'https://facebook.com/username'),
  ('social_telegram', 'https://t.me/username')
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value;
