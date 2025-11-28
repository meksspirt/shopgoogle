-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default monobank link
INSERT INTO public.settings (key, value, description)
VALUES ('monobank_payment_link', 'https://sitechecker.pro/ru/website-safety/', 'Посилання на оплату через Monobank')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to settings"
ON public.settings FOR SELECT
TO public
USING (true);

-- Create policy for authenticated users to update settings
CREATE POLICY "Allow authenticated users to update settings"
ON public.settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for authenticated users to insert settings
CREATE POLICY "Allow authenticated users to insert settings"
ON public.settings FOR INSERT
TO authenticated
WITH CHECK (true);
