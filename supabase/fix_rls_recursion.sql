-- Скрипт для исправления ошибки "infinite recursion detected in policy"
-- Выполните этот скрипт в Supabase SQL Editor

-- Шаг 1: Удаляем все существующие политики, которые могут вызывать рекурсию
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;

-- Шаг 2: Создаем функцию для проверки прав администратора
-- Эта функция использует SECURITY DEFINER, чтобы избежать рекурсии
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Шаг 3: Создаем новые политики без рекурсии

-- Политики для orders
CREATE POLICY "Admins can view all orders"
    ON public.orders
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update orders"
    ON public.orders
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete orders"
    ON public.orders
    FOR DELETE
    USING (public.is_admin());

CREATE POLICY "Admins can insert orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (public.is_admin());

-- Политики для products
CREATE POLICY "Everyone can view products"
    ON public.products
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert products"
    ON public.products
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
    ON public.products
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete products"
    ON public.products
    FOR DELETE
    USING (public.is_admin());

-- Политики для promo_codes
CREATE POLICY "Admins can view promo codes"
    ON public.promo_codes
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert promo codes"
    ON public.promo_codes
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update promo codes"
    ON public.promo_codes
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete promo codes"
    ON public.promo_codes
    FOR DELETE
    USING (public.is_admin());

-- Политики для profiles (без рекурсии)
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Шаг 4: Проверка
-- Выполните эту команду, чтобы убедиться, что политики созданы:
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('orders', 'products', 'promo_codes', 'profiles')
ORDER BY tablename, policyname;

-- Готово! Теперь ошибка рекурсии должна быть исправлена.
