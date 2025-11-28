-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
-- High Priority
('monobank_payment_link', 'https://send.monobank.ua/', 'Посилання на оплату через Monobank'),
('notification_email', '', 'Email для отримання сповіщень про нові замовлення'),
('support_phone', '+380', 'Телефон підтримки клієнтів'),
('instagram_link', '', 'Посилання на Instagram магазину'),
('min_order_amount', '0', 'Мінімальна сума замовлення (грн)'),

-- Medium Priority
('free_delivery_from', '500', 'Безкоштовна доставка від суми (грн)'),
('success_message', 'Дякуємо за покупку! Ми зв''яжемося з вами найближчим часом.', 'Повідомлення про успішне оформлення замовлення'),
('delivery_terms', 'Доставка здійснюється Новою Поштою по всій Україні. Термін доставки 1-3 дні.', 'Умови доставки'),
('about_store', 'CalmCraft - ваш улюблений книжковий магазин. Ми пропонуємо широкий вибір книг для душевного спокою.', 'Про магазин'),
('telegram_bot_token', '', 'Telegram Bot Token для сповіщень'),
('telegram_chat_id', '', 'Telegram Chat ID для сповіщень'),

-- Low Priority - SEO
('site_title', 'CalmCraft - Книжковий магазин', 'Заголовок сайту (Meta Title)'),
('site_description', 'Ваш улюблений книжковий магазин', 'Опис сайту (Meta Description)'),
('site_keywords', 'книги, книжковий магазин, купити книги', 'Ключові слова (Meta Keywords)'),

-- Low Priority - Legal
('company_name', '', 'Назва компанії (юридична особа)'),
('company_code', '', 'ЄДРПОУ/ІПН'),
('legal_address', '', 'Юридична адреса'),
('privacy_policy', '', 'Політика конфіденційності'),

-- Store Settings
('store_name', 'CalmCraft', 'Назва магазину'),
('store_slogan', 'Ваш улюблений книжковий магазин', 'Слоган магазину'),
('working_hours', 'Пн-Пт: 9:00-18:00, Сб-Нд: вихідні', 'Режим роботи'),
('show_out_of_stock', 'true', 'Показувати товари без наявності'),
('products_per_page', '12', 'Кількість товарів на сторінці')

ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;

-- Create policy for public read access
CREATE POLICY "Allow public read access to settings"
ON public.settings FOR SELECT
TO public
USING (true);

-- Create policy for all authenticated operations (simpler approach)
CREATE POLICY "Allow all operations on settings"
ON public.settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
