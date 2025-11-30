# 🔐 Налаштування входу через Google

## Крок 1: Створити OAuth додаток в Google Cloud Console

1. Перейдіть на [Google Cloud Console](https://console.cloud.google.com/)
2. Створіть новий проект або виберіть існуючий
3. Перейдіть в **APIs & Services** → **Credentials**
4. Натисніть **Create Credentials** → **OAuth client ID**
5. Якщо потрібно, налаштуйте **OAuth consent screen**:
   - User Type: **External**
   - App name: назва вашого магазину
   - User support email: ваш email
   - Developer contact: ваш email
   - Scopes: додайте `.../auth/userinfo.email` та `.../auth/userinfo.profile`

## Крок 2: Налаштувати OAuth Client ID

1. Application type: **Web application**
2. Name: `Supabase Auth` (або будь-яка назва)
3. **Authorized JavaScript origins:**
   ```
   https://ваш-проект.supabase.co
   ```
4. **Authorized redirect URIs:**
   ```
   https://ваш-проект.supabase.co/auth/v1/callback
   ```
5. Натисніть **Create**
6. **ЗБЕРЕЖІТЬ** Client ID та Client Secret

## Крок 3: Налаштувати в Supabase

1. Відкрийте [Supabase Dashboard](https://app.supabase.com/)
2. Виберіть ваш проект
3. Перейдіть в **Authentication** → **Providers**
4. Знайдіть **Google** в списку провайдерів
5. Увімкніть перемикач **Enable Sign in with Google**
6. Вставте:
   - **Client ID** (з Google Cloud Console)
   - **Client Secret** (з Google Cloud Console)
7. Скопіюйте **Callback URL** (він буде виглядати як `https://ваш-проект.supabase.co/auth/v1/callback`)
8. Натисніть **Save**

## Крок 4: Додати redirect URL для локальної розробки

### В Google Cloud Console:

Додайте до **Authorized redirect URIs**:
```
http://localhost:3000/profile
https://localhost:3000/profile
```

### В Supabase Dashboard:

1. Перейдіть в **Authentication** → **URL Configuration**
2. Додайте до **Redirect URLs**:
   ```
   http://localhost:3000/profile
   https://ваш-домен.com/profile
   ```

## Крок 5: Тестування

### Локально:
1. Запустіть `npm run dev`
2. Відкрийте `http://localhost:3000/profile/login`
3. Натисніть **Продовжити з Google**
4. Виберіть Google акаунт
5. Після успішного входу ви будете перенаправлені на `/profile`

### На продакшені:
1. Додайте ваш домен до **Authorized JavaScript origins** в Google Cloud Console:
   ```
   https://ваш-домен.com
   ```
2. Додайте redirect URI:
   ```
   https://ваш-домен.com/profile
   ```
3. Оновіть **Redirect URLs** в Supabase Dashboard

## Що відбувається під капотом?

1. Користувач натискає "Продовжити з Google"
2. Викликається `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. Користувач перенаправляється на Google для авторизації
4. Після успішної авторизації Google повертає користувача на callback URL
5. Supabase обробляє callback та створює сесію
6. Користувач перенаправляється на `/profile`

## Переваги входу через Google

✅ **Для користувачів:**
- Швидкий вхід без створення нового паролю
- Безпечно (OAuth 2.0)
- Не потрібно запам'ятовувати ще один пароль

✅ **Для вас:**
- Підвищує конверсію реєстрацій
- Менше проблем з відновленням паролів
- Автоматична верифікація email

## Troubleshooting

### Помилка: "redirect_uri_mismatch"
**Рішення:** Перевірте що redirect URI в Google Cloud Console точно співпадає з callback URL з Supabase

### Помилка: "Access blocked: This app's request is invalid"
**Рішення:** Налаштуйте OAuth consent screen в Google Cloud Console

### Користувач не перенаправляється після входу
**Рішення:** Перевірте що redirect URL додано в Supabase Dashboard → Authentication → URL Configuration

### Локально не працює
**Рішення:** 
1. Перевірте що `http://localhost:3000` додано до Authorized JavaScript origins
2. Перевірте що `http://localhost:3000/profile` додано до Authorized redirect URIs

## Додаткові налаштування

### Отримати додаткову інформацію про користувача

```typescript
const { data: { user } } = await supabase.auth.getUser();

console.log(user?.user_metadata); // Містить дані з Google:
// {
//   avatar_url: "https://...",
//   email: "user@gmail.com",
//   email_verified: true,
//   full_name: "John Doe",
//   iss: "https://accounts.google.com",
//   name: "John Doe",
//   picture: "https://...",
//   provider_id: "...",
//   sub: "..."
// }
```

### Зберегти аватар користувача

Можна зберегти аватар з Google в таблиці profiles:

```sql
-- Додати колонку для аватара
ALTER TABLE profiles ADD COLUMN avatar_url text;

-- Створити тригер для автоматичного збереження
CREATE OR REPLACE FUNCTION public.handle_new_user_avatar()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_avatar
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_avatar();
```

## Корисні посилання

- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
