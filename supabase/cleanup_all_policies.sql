-- Скрипт для полной очистки и пересоздания RLS политик
-- ВНИМАНИЕ: Этот скрипт удалит ВСЕ существующие политики и создаст новые безопасные

-- ============================================
-- ШАГ 1: УДАЛЕНИЕ ВСЕХ СТАРЫХ ПОЛИТИК
-- ============================================

-- Удаляем все политики для orders
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Public read access for orders" ON public.orders;
DROP POLICY IF EXISTS "Public insert access for orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

-- Удаляем все политики для products
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
DROP POLICY IF EXISTS "Public insert access for products" ON public.products;
DROP POLICY IF EXISTS "Public update access for products" ON public.products;
DROP POLICY IF EXISTS "Public delete access for products" ON public.products;
DROP POLICY IF EXISTS "Everyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Удаляем все политики для promo_codes
DROP POLICY IF EXISTS "Public can view active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Public can insert promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Public can update promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Public can delete promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can view promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can insert promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can update promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can delete promo codes" ON public.promo_codes;

-- Удаляем все политики для profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- ============================================
-- ШАГ 2: СОЗДАНИЕ ФУНКЦИИ ДЛЯ ПРОВЕРКИ ПРАВ
-- ============================================

-- Создаем функцию для проверки прав администратора
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ШАГ 3: СОЗДАНИЕ БЕЗОПАСНЫХ ПОЛИТИК
-- ============================================

-- ----------------
-- ORDERS (только для администраторов)
-- ----------------
CREATE POLICY "Admins can view all orders"
    ON public.orders
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update orders"
    ON public.orders
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete orders"
    ON public.orders
    FOR DELETE
    USING (public.is_admin());

-- Дополнительная политика: анонимные пользователи могут создавать заказы
CREATE POLICY "Anyone can create orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (true);

-- ----------------
-- PRODUCTS (все могут читать, только админы могут изменять)
-- ----------------
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

-- ----------------
-- PROMO_CODES (все могут читать активные, только админы могут управлять)
-- ----------------
CREATE POLICY "Everyone can view active promo codes"
    ON public.promo_codes
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can view all promo codes"
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

-- ----------------
-- PROFILES (пользователи видят только свой профиль)
-- ----------------
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- ШАГ 4: ПРОВЕРКА
-- ============================================

-- Проверяем, что функция создана
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc 
WHERE proname = 'is_admin';

-- Проверяем все политики
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN policyname LIKE '%Admin%' THEN '🔒 Admin only'
        WHEN policyname LIKE '%Everyone%' OR policyname LIKE '%Anyone%' THEN '🌍 Public'
        WHEN policyname LIKE '%Users%' THEN '👤 User own data'
        ELSE '❓ Other'
    END as access_level
FROM pg_policies 
WHERE tablename IN ('orders', 'products', 'promo_codes', 'profiles')
ORDER BY tablename, policyname;

-- Проверяем, что RLS включен для всех таблиц
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('orders', 'products', 'promo_codes', 'profiles')
ORDER BY tablename;

-- ============================================
-- ГОТОВО!
-- ============================================
-- Теперь у вас безопасная конфигурация:
-- ✅ Orders: только админы могут просматривать/управлять (+ анонимы могут создавать)
-- ✅ Products: все могут читать, только админы могут изменять
-- ✅ Promo codes: все видят активные, только админы управляют
-- ✅ Profiles: пользователи видят только свой профиль
