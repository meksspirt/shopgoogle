-- Создание таблицы профилей для управления ролями пользователей
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свой профиль
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Политика: пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, is_admin)
    VALUES (NEW.id, NEW.email, FALSE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Создаем функцию для проверки прав администратора (избегаем рекурсии)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавляем RLS политики для таблицы orders
-- Только администраторы могут видеть все заказы
CREATE POLICY "Admins can view all orders"
    ON public.orders
    FOR SELECT
    USING (public.is_admin());

-- Только администраторы могут обновлять заказы
CREATE POLICY "Admins can update orders"
    ON public.orders
    FOR UPDATE
    USING (public.is_admin());

-- Только администраторы могут удалять заказы
CREATE POLICY "Admins can delete orders"
    ON public.orders
    FOR DELETE
    USING (public.is_admin());

-- Аналогично для products
CREATE POLICY "Admins can manage products"
    ON public.products
    FOR ALL
    USING (public.is_admin());

-- Аналогично для promo_codes
CREATE POLICY "Admins can manage promo codes"
    ON public.promo_codes
    FOR ALL
    USING (public.is_admin());

-- ВАЖНО: После выполнения этого скрипта, вручную создайте администратора:
-- 1. Зарегистрируйтесь через форму логина с вашим email
-- 2. Затем выполните в SQL Editor:
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'ваш-email@example.com';
