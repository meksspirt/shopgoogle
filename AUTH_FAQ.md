# ❓ FAQ - Supabase Auth

## Общие вопросы

### Почему Supabase Auth лучше, чем своя система?

**Безопасность:**
- ✅ Автоматическое хэширование паролей (bcrypt с солью)
- ✅ Защита от SQL инъекций
- ✅ Защита от brute-force атак
- ✅ JWT токены с автоматическим обновлением
- ✅ Row Level Security на уровне базы данных

**Удобство:**
- ✅ Готовая система без написания кода
- ✅ Поддержка OAuth (Google, GitHub и др.)
- ✅ Сброс пароля из коробки
- ✅ Email подтверждение
- ✅ Автоматическое управление сессиями

### Можно ли взломать систему, если украдут API ключи?

**Нет!** Даже если кто-то украдет ваш `NEXT_PUBLIC_SUPABASE_ANON_KEY`, он не сможет:
- Получить доступ к данным (защищены RLS)
- Войти без пароля
- Изменить роль пользователя (is_admin)

RLS политики работают на уровне базы данных и проверяют `auth.uid()` - ID текущего залогиненного пользователя.

### Что такое RLS и зачем он нужен?

**Row Level Security (RLS)** - это защита на уровне строк в базе данных.

Пример:
```sql
-- Политика: пользователь видит только свои заказы
CREATE POLICY "Users see own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

Теперь, даже если хакер получит доступ к API, он сможет видеть только свои данные, а не все заказы.

## Проблемы и решения

### "Доступ заборонено. Тільки для адміністраторів"

**Причина:** Пользователь зарегистрирован, но не имеет прав администратора.

**Решение:**
```sql
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'ваш-email@example.com';
```

### "Невірний email або пароль"

**Возможные причины:**
1. Неправильный email или пароль
2. Пользователь не зарегистрирован
3. Email не подтвержден (если включено подтверждение)

**Решение:**
1. Проверьте правильность данных
2. Зарегистрируйтесь через вкладку "Реєстрація"
3. Отключите подтверждение email для тестирования

### Middleware постоянно редиректит на /admin/login

**Причина:** Сессия не сохраняется или токен не передается.

**Решение:**
1. Очистите cookies браузера
2. Проверьте DevTools → Application → Cookies
3. Убедитесь, что есть cookie с именем `sb-*-auth-token`
4. Попробуйте войти заново

### После регистрации не могу войти

**Причина:** Включено подтверждение email.

**Решение:**
1. Проверьте почту на письмо от Supabase
2. Или отключите подтверждение:
   - Supabase Dashboard → Authentication → Providers → Email
   - Отключите "Confirm email"

### Как сбросить пароль?

**Вариант 1: Через интерфейс (если настроено)**
```typescript
await supabase.auth.resetPasswordForEmail('user@example.com');
```

**Вариант 2: Через Supabase Dashboard**
1. Authentication → Users
2. Найдите пользователя
3. Нажмите "..." → "Send password reset email"

**Вариант 3: Вручную через SQL**
```sql
-- Удалить пользователя и создать заново
DELETE FROM auth.users WHERE email = 'user@example.com';
-- Затем зарегистрируйтесь заново
```

## Настройка и конфигурация

### Как добавить Google OAuth?

1. Supabase Dashboard → Authentication → Providers
2. Включите Google
3. Создайте OAuth приложение в Google Cloud Console
4. Скопируйте Client ID и Client Secret
5. Вставьте в Supabase
6. Обновите код логина:

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: 'http://localhost:3000/admin'
    }
});
```

### Как настроить email шаблоны?

1. Supabase Dashboard → Authentication → Email Templates
2. Выберите шаблон (Confirm signup, Reset password и т.д.)
3. Отредактируйте HTML и текст
4. Используйте переменные: `{{ .ConfirmationURL }}`, `{{ .Email }}` и т.д.

### Как изменить время жизни сессии?

1. Supabase Dashboard → Authentication → Settings
2. Найдите "JWT expiry limit"
3. Измените значение (по умолчанию 3600 секунд = 1 час)

### Как включить двухфакторную аутентификацию (2FA)?

```typescript
// Включить 2FA для пользователя
const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp'
});

// Проверить код
const { data, error } = await supabase.auth.mfa.verify({
    factorId: data.id,
    code: '123456'
});
```

## Разработка и тестирование

### Как тестировать локально?

1. Используйте Supabase Local Development:
```bash
npx supabase init
npx supabase start
```

2. Или используйте тестовый проект на Supabase Cloud

### Как создать тестовых пользователей?

**Вариант 1: Через код**
```typescript
const testUsers = [
    { email: 'admin@test.com', password: 'test123', isAdmin: true },
    { email: 'user@test.com', password: 'test123', isAdmin: false }
];

for (const user of testUsers) {
    await supabase.auth.signUp({
        email: user.email,
        password: user.password
    });
    
    if (user.isAdmin) {
        await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('email', user.email);
    }
}
```

**Вариант 2: Через SQL**
```sql
-- Создать пользователя напрямую в auth.users (только для разработки!)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
    gen_random_uuid(),
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW()
);
```

### Как отладить RLS политики?

```sql
-- Включить логирование RLS
SET log_statement = 'all';
SET client_min_messages = 'debug';

-- Проверить политики
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Тестировать от имени пользователя
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'user-id-here';

SELECT * FROM orders;
```

## Продакшен

### Что нужно сделать перед деплоем?

1. ✅ Включить подтверждение email
2. ✅ Настроить email шаблоны
3. ✅ Установить сложные пароли для администраторов
4. ✅ Проверить все RLS политики
5. ✅ Настроить rate limiting в Supabase
6. ✅ Включить HTTPS (автоматически на Vercel)
7. ✅ Добавить мониторинг (Supabase Dashboard → Logs)

### Как ограничить количество попыток входа?

Supabase автоматически защищает от brute-force атак, но можно настроить дополнительно:

1. Supabase Dashboard → Authentication → Settings
2. Найдите "Rate Limiting"
3. Настройте лимиты

### Как мониторить безопасность?

1. Supabase Dashboard → Logs → Auth Logs
2. Смотрите на:
   - Неудачные попытки входа
   - Подозрительную активность
   - Изменения в профилях

### Как сделать бэкап пользователей?

```sql
-- Экспорт пользователей
COPY (
    SELECT 
        u.id,
        u.email,
        u.created_at,
        p.is_admin
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
) TO '/tmp/users_backup.csv' WITH CSV HEADER;
```

## Миграция

### Как перенести пользователей из старой системы?

**Проблема:** Старые пароли в plain text нельзя перенести напрямую.

**Решение 1: Сброс паролей**
1. Создайте пользователей в Supabase Auth
2. Отправьте им письма для сброса пароля

**Решение 2: Временные пароли**
1. Создайте пользователей с временными паролями
2. Заставьте их сменить пароль при первом входе

```typescript
// Создать пользователя с временным паролем
const tempPassword = generateRandomPassword();
await supabase.auth.signUp({
    email: oldUser.email,
    password: tempPassword
});

// Отправить email с временным паролем
await sendEmail(oldUser.email, tempPassword);
```

### Можно ли использовать старую таблицу admins?

Не рекомендуется, но можно создать гибридную систему:

```typescript
// Проверить в обеих системах
const supabaseUser = await supabase.auth.getUser();
const oldAdmin = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .single();

if (supabaseUser || oldAdmin) {
    // Разрешить доступ
}
```

Но лучше полностью мигрировать на Supabase Auth.

## Дополнительные ресурсы

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
