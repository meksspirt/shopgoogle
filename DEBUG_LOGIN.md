# 🐛 Отладка проблем со входом

## Шаг 1: Откройте консоль браузера

1. Откройте страницу `/admin/login`
2. Нажмите `F12` или `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Перейдите на вкладку **Console**

## Шаг 2: Попробуйте войти

Введите email и пароль, нажмите "Увійти". В консоли вы должны увидеть:

```
🔐 Спроба входу... { email: "ваш-email@example.com" }
✅ Supabase auth успішна: user-id-here
📡 Відповідь API: 200
📦 Дані API: { success: true, ... }
✅ Успішний вхід, редірект на /admin
```

## Возможные ошибки и решения

### ❌ "Невірний email або пароль"

**Причина:** Пользователь не зарегистрирован или неправильный пароль.

**Решение:**
1. Проверьте правильность email и пароля
2. Зарегистрируйтесь через вкладку "Реєстрація"
3. Проверьте в Supabase Dashboard → Authentication → Users

### ❌ "Доступ заборонено. Тільки для адміністраторів"

**Причина:** Пользователь зарегистрирован, но не имеет прав администратора.

**Решение:**
```sql
-- В Supabase SQL Editor
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'ваш-email@example.com';

-- Проверка
SELECT email, is_admin FROM public.profiles WHERE email = 'ваш-email@example.com';
```

### ❌ "Помилка перевірки профілю"

**Причина:** Таблица `profiles` не создана или RLS блокирует доступ.

**Решение:**
```sql
-- Проверьте, существует ли таблица
SELECT * FROM public.profiles LIMIT 1;

-- Если таблицы нет, выполните
-- supabase/cleanup_all_policies.sql
```

### ❌ Кнопка не реагирует, нет логов в консоли

**Причина:** JavaScript ошибка или проблема с React.

**Решение:**
1. Проверьте вкладку Console на красные ошибки
2. Перезагрузите страницу (Ctrl+F5)
3. Очистите кеш браузера
4. Проверьте, что `npm run dev` запущен без ошибок

### ❌ "Failed to fetch" или "Network error"

**Причина:** API роут не отвечает или проблема с сетью.

**Решение:**
1. Проверьте, что dev сервер запущен (`npm run dev`)
2. Проверьте вкладку Network в DevTools
3. Убедитесь, что `/api/auth/login` возвращает ответ
4. Проверьте переменные окружения в `.env.local`

## Шаг 3: Проверка переменных окружения

Убедитесь, что в `.env.local` есть:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
SUPABASE_SERVICE_ROLE_KEY=ваш-service-role-key
```

**Проверка в коде:**
```javascript
// В консоли браузера
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
// Должно показать URL, а не undefined
```

## Шаг 4: Проверка в Supabase Dashboard

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в **Authentication** → **Users**
3. Найдите вашего пользователя
4. Проверьте статус (должен быть "Confirmed")

## Шаг 5: Проверка RLS политик

```sql
-- Проверьте, что функция is_admin существует
SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- Проверьте политики для profiles
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- Должны быть:
-- Users can view own profile (SELECT)
-- Users can update own profile (UPDATE)
```

## Шаг 6: Тестирование вручную

Попробуйте войти через консоль браузера:

```javascript
// В консоли браузера на странице /admin/login
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ваш-email@example.com',
    password: 'ваш-пароль'
});

console.log('Auth result:', { data, error });

// Проверьте профиль
const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

console.log('Profile:', profile);
```

## Шаг 7: Логи сервера

Проверьте терминал, где запущен `npm run dev`:

```
🔐 API Login attempt for: user@example.com
✅ User authenticated: user-id
👤 Profile check: { profile: { is_admin: true }, profileError: null }
✅ Admin access granted
```

## Если ничего не помогло

1. Удалите `.next` папку: `rm -rf .next` (или `rmdir /s /q .next` на Windows)
2. Переустановите зависимости: `npm install`
3. Перезапустите dev сервер: `npm run dev`
4. Очистите cookies браузера для localhost
5. Попробуйте в режиме инкогнито

## Быстрая проверка всей системы

```sql
-- В Supabase SQL Editor выполните:

-- 1. Проверка таблицы profiles
SELECT 'profiles table' as check_name, COUNT(*) as count FROM public.profiles;

-- 2. Проверка администраторов
SELECT 'admins' as check_name, email, is_admin FROM public.profiles WHERE is_admin = true;

-- 3. Проверка функции
SELECT 'is_admin function' as check_name, proname FROM pg_proc WHERE proname = 'is_admin';

-- 4. Проверка RLS
SELECT 'RLS enabled' as check_name, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'orders', 'products');

-- 5. Проверка политик
SELECT 'policies' as check_name, tablename, COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename IN ('profiles', 'orders', 'products')
GROUP BY tablename;
```

Все проверки должны вернуть результаты. Если что-то пустое - выполните `supabase/cleanup_all_policies.sql`.
