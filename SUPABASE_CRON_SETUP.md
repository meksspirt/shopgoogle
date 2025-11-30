# Настройка Cron через Supabase (альтернативный вариант)

## ⚠️ Ограничения Supabase

- Supabase не имеет встроенного планировщика задач (Cron)
- Можно использовать **pg_cron** расширение PostgreSQL, но:
  - Доступно только на платных планах ($25/месяц)
  - Сложнее настроить внешние HTTP запросы

## Вариант 1: pg_cron (Платный план)

Если у вас платный план Supabase:

### 1. Включите расширение pg_cron

```sql
-- В SQL Editor Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 2. Создайте функцию для вызова вашего API

```sql
-- Функция для HTTP запроса
CREATE OR REPLACE FUNCTION call_update_delivery_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Используем http расширение для вызова внешнего API
  PERFORM
    net.http_post(
      url := 'https://ваш-домен.vercel.app/api/update-delivery-statuses',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer your-secret-key'
      ),
      body := '{}'::jsonb
    );
END;
$$;
```

### 3. Настройте расписание

```sql
-- Запускать каждый день в 08:00 UTC
SELECT cron.schedule(
  'update-delivery-statuses',
  '0 8 * * *',
  'SELECT call_update_delivery_statuses();'
);
```

### 4. Проверьте задачи

```sql
-- Посмотреть все задачи
SELECT * FROM cron.job;

-- Посмотреть историю выполнений
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## Вариант 2: Supabase Edge Functions + GitHub Actions (Бесплатно)

Более сложный, но бесплатный вариант:

### 1. Создайте GitHub Action

Создайте файл `.github/workflows/update-delivery-statuses.yml`:

```yaml
name: Update Delivery Statuses

on:
  schedule:
    # Запускать каждый день в 08:00 UTC
    - cron: '0 8 * * *'
  workflow_dispatch: # Позволяет запускать вручную

jobs:
  update-statuses:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://ваш-домен.vercel.app/api/update-delivery-statuses
```

### 2. Добавьте секрет в GitHub

1. Перейдите в Settings → Secrets and variables → Actions
2. Добавьте секрет `CRON_SECRET` со значением из вашего `.env.local`

### 3. Активируйте workflow

- Закоммитьте файл в репозиторий
- GitHub Actions автоматически запустит задачу по расписанию

## Рекомендация

**Используйте cron-job.org** - это проще, надежнее и не требует дополнительных настроек.

Supabase pg_cron подходит только если:
- У вас уже есть платный план Supabase
- Вам нужна более сложная логика внутри базы данных
- Вы хотите избежать внешних сервисов

## Сравнение вариантов

| Вариант | Стоимость | Сложность | Надежность |
|---------|-----------|-----------|------------|
| **cron-job.org** | Бесплатно | ⭐ Легко | ⭐⭐⭐ Высокая |
| **Supabase pg_cron** | $25/мес | ⭐⭐⭐ Сложно | ⭐⭐⭐ Высокая |
| **GitHub Actions** | Бесплатно | ⭐⭐ Средне | ⭐⭐ Средняя |
| **Vercel Cron** | Платно | ⭐ Легко | ⭐⭐⭐ Высокая |

## Вывод

Для вашего случая оптимальный вариант: **cron-job.org**

Следуйте инструкции из файла `CRON_JOB_SETUP.md`
