# Исправление ошибки RLS (Row Level Security)

## Ошибка
```
Помилка збереження: new row violates row-level security policy for table "settings"
```

## Причина
Политики безопасности Supabase (RLS) блокируют запись в таблицу `settings`.

## Решение

### Вариант 1: Исправить политики (Рекомендуется)

1. Откройте **Supabase Dashboard**
2. Перейдите в **SQL Editor**
3. Выполните скрипт:

```sql
-- Файл: supabase/fix_settings_policies.sql
```

Скопируйте и выполните весь код из файла `supabase/fix_settings_policies.sql`

4. Проверьте результат:
   - Вернитесь в админку
   - Попробуйте сохранить настройку снова

### Вариант 2: Отключить RLS (Быстрое решение)

⚠️ **Внимание:** Это делает таблицу доступной для всех. Используйте только для тестирования!

1. Откройте **Supabase Dashboard**
2. Перейдите в **SQL Editor**
3. Выполните:

```sql
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
```

### Вариант 3: Проверить аутентификацию

Возможно, проблема в том, что админ не аутентифицирован в Supabase.

#### Проверка:

1. Откройте консоль браузера (F12)
2. Перейдите на вкладку **Console**
3. Выполните:

```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

4. Если `user` = `null`, значит вы не залогинены

#### Решение:

Нужно добавить аутентификацию в админку. Создадим простое решение:

**Временное решение:** Используйте Вариант 2 (отключить RLS)

**Правильное решение:** Настроить Supabase Auth для админки

## Пошаговая инструкция (Вариант 1)

### Шаг 1: Откройте Supabase

1. Перейдите на https://supabase.com
2. Войдите в свой проект
3. Выберите ваш проект CalmCraft

### Шаг 2: Откройте SQL Editor

1. В левом меню найдите **SQL Editor**
2. Нажмите **New Query**

### Шаг 3: Скопируйте и выполните скрипт

Скопируйте весь код из файла `supabase/fix_settings_policies.sql`:

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;

-- Create new policies

-- 1. Allow everyone to read settings
CREATE POLICY "Allow public read access to settings"
ON public.settings FOR SELECT
TO public
USING (true);

-- 2. Allow authenticated users to do everything
CREATE POLICY "Allow all operations on settings"
ON public.settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

### Шаг 4: Нажмите RUN

Внизу справа нажмите кнопку **RUN** или **Ctrl+Enter**

### Шаг 5: Проверьте результат

Вы должны увидеть:
```
Success. No rows returned
```

### Шаг 6: Проверьте политики

Выполните проверочный запрос:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'settings';
```

Должны увидеть 2 политики:
1. `Allow public read access to settings` - для чтения
2. `Allow all operations on settings` - для записи

### Шаг 7: Попробуйте снова

1. Вернитесь в админку
2. Перейдите в Налаштування
3. Попробуйте сохранить любую настройку
4. Должно работать! ✅

## Если всё равно не работает

### Проблема: Админ не аутентифицирован

Если после исправления политик всё равно ошибка, значит проблема в аутентификации.

#### Быстрое решение:

Выполните в Supabase SQL Editor:

```sql
-- Разрешить всем записывать в settings (временно)
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;

CREATE POLICY "Allow all operations on settings"
ON public.settings FOR ALL
TO public  -- Изменили с authenticated на public
USING (true)
WITH CHECK (true);
```

⚠️ **Внимание:** Это позволяет любому пользователю изменять настройки. Используйте только для тестирования!

#### Правильное решение:

Нужно настроить аутентификацию в админке. Для этого:

1. Создать систему логина через Supabase Auth
2. Проверять аутентификацию перед доступом к админке
3. Использовать токен аутентификации при запросах к Supabase

## Проверка текущих политик

Чтобы посмотреть какие политики сейчас установлены:

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'settings';
```

## Альтернатива: Использовать Service Role Key

Если хотите обойти RLS в админке, используйте Service Role Key вместо Anon Key:

1. В Supabase Dashboard → Settings → API
2. Скопируйте **service_role key** (не anon key!)
3. В админке создайте отдельный клиент:

```typescript
// Только для админки!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key
);
```

⚠️ **Внимание:** Service Role Key обходит все политики RLS. Используйте только на сервере, никогда не отправляйте на клиент!

## Рекомендуемое решение

Для продакшена рекомендую:

1. ✅ Использовать **Вариант 1** (исправить политики)
2. ✅ Настроить аутентификацию в админке
3. ✅ Использовать Service Role Key только на сервере
4. ❌ Не отключать RLS полностью

Для тестирования можно:
- Использовать **Вариант 2** (отключить RLS)
- Или разрешить `public` доступ к таблице settings

## Помощь

Если ничего не помогло:

1. Проверьте что таблица `settings` существует
2. Проверьте что RLS включен: `SELECT * FROM pg_tables WHERE tablename = 'settings';`
3. Проверьте логи в Supabase Dashboard → Logs
4. Проверьте консоль браузера на ошибки
