-- SEO Settings для сайта психологічного посібника
-- Виконайте цей SQL запит у вашій Supabase консолі

-- Основні SEO налаштування
INSERT INTO settings (key, value) 
VALUES 
  ('site_title', 'Breathe Self Space - Ваш персональний воркбук'),
  ('site_description', 'Інструкція з експлуатації себе. Ваш персональний воркбук з інструментами КПТ, діагностикою стресу та техніками самодопомоги від практикуючого психолога.'),
  ('site_keywords', 'психологія, воркбук, КПТ, ментальне здоров''я, саморозвиток, психологічний посібник, Анна Клим, Breathe Self Space'),
  ('site_url', 'https://www.calmcraft.shop'),
  ('site_author', 'Анна Клим'),
  ('og_image', '/og-image.png')
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value;

-- Інформація про автора
INSERT INTO settings (key, value) 
VALUES 
  ('author_name', 'Анна Клим'),
  ('author_title', 'Практикуючий психолог, спеціаліст із кризового реагування'),
  ('author_bio', 'Практикуючий психолог та спеціаліст із кризового реагування в гуманітарних місіях. Зібрала лише дієві методики, які працюють у реальному житті.')
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value;

-- Інформація про посібник
INSERT INTO settings (key, value) 
VALUES 
  ('book_title', 'Breathe Self Space'),
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
