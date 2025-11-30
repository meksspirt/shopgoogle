# 📖 Примеры использования Supabase Auth

## Базовые операции

### Проверка аутентификации на клиенте

```typescript
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

function MyComponent() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // Получить текущую сессию
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                setUser(session.user);
                
                // Проверить права администратора
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', session.user.id)
                    .single();
                
                setIsAdmin(profile?.is_admin || false);
            }
        };

        checkAuth();

        // Подписка на изменения аутентификации
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN') {
                    setUser(session?.user || null);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setIsAdmin(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div>
            {user ? (
                <p>Привіт, {user.email}! {isAdmin && '(Адміністратор)'}</p>
            ) : (
                <p>Ви не увійшли</p>
            )}
        </div>
    );
}
```

### Вход и выход

```typescript
import { signIn, signOut } from '@/lib/supabaseAuth';

// Вход
async function handleLogin(email: string, password: string) {
    try {
        const data = await signIn(email, password);
        console.log('Успішний вхід:', data.user);
    } catch (error) {
        console.error('Помилка входу:', error.message);
    }
}

// Выход
async function handleLogout() {
    try {
        await signOut();
        console.log('Успішний вихід');
    } catch (error) {
        console.error('Помилка виходу:', error);
    }
}
```

### Регистрация нового пользователя

```typescript
import { signUp } from '@/lib/supabaseAuth';

async function handleRegister(email: string, password: string) {
    try {
        const data = await signUp(email, password);
        console.log('Реєстрація успішна:', data.user);
        
        // Примечание: Пользователь НЕ будет администратором по умолчанию
        // Администратор должен вручную установить is_admin = TRUE
    } catch (error) {
        console.error('Помилка реєстрації:', error.message);
    }
}
```

## Защита API роутов

### Проверка администратора в API

```typescript
// app/api/admin/some-action/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        // Получить токен из заголовков
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Проверить сессию
        const { data: { user }, error } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Проверить права администратора
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Выполнить действие
        // ...

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
```

## Работа с RLS политиками

### Запросы с автоматической фильтрацией

```typescript
// Supabase автоматически применяет RLS политики
// Только администраторы увидят все заказы
const { data: orders, error } = await supabase
    .from('orders')
    .select('*');

// Если пользователь не администратор - вернется пустой массив или ошибка
```

### Обход RLS (только для Service Role)

```typescript
// ВНИМАНИЕ: Используйте только на сервере!
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service Role Key
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Этот клиент обходит RLS политики
const { data } = await supabaseAdmin
    .from('orders')
    .select('*');
```

## Дополнительные возможности

### Сброс пароля

```typescript
async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://yourdomain.com/reset-password',
    });

    if (error) {
        console.error('Помилка:', error.message);
    } else {
        console.log('Лист для скидання пароля відправлено');
    }
}
```

### Обновление профиля

```typescript
async function updateProfile(userId: string, updates: any) {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Помилка оновлення:', error);
    }
}
```

### Получение всех администраторов

```typescript
async function getAdmins() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .eq('is_admin', true);

    return data;
}
```

## Тестирование

### Проверка RLS политик

```sql
-- В Supabase SQL Editor
-- Проверить, что обычный пользователь не видит заказы
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'user-id-here';

SELECT * FROM orders; -- Должно вернуть пустой результат

-- Проверить, что администратор видит все
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'admin-user-id-here';

SELECT * FROM orders; -- Должно вернуть все заказы
```

## Безопасность

### ✅ Правильно

```typescript
// Использовать Supabase Auth для аутентификации
const { data } = await supabase.auth.signInWithPassword({ email, password });

// Проверять права на сервере
const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
```

### ❌ Неправильно

```typescript
// НЕ хранить пароли в plain text
const password = 'mypassword123'; // ❌

// НЕ проверять права только на клиенте
if (user.email === 'admin@example.com') { // ❌
    // Показать админ-панель
}

// НЕ использовать Service Role Key на клиенте
const supabase = createClient(url, serviceRoleKey); // ❌
```

## Полезные команды SQL

```sql
-- Сделать пользователя администратором
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'user@example.com';

-- Убрать права администратора
UPDATE public.profiles 
SET is_admin = FALSE 
WHERE email = 'user@example.com';

-- Посмотреть всех пользователей
SELECT 
    p.email, 
    p.is_admin, 
    p.created_at,
    u.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- Удалить пользователя (каскадно удалит профиль)
DELETE FROM auth.users WHERE email = 'user@example.com';
```
