# 📊 Примеры Open Graph Meta Tags

## Как будет выглядеть ваш сайт при публикации в социальных сетях

### Facebook / Instagram / LinkedIn

```
┌─────────────────────────────────────────┐
│ [OG изображение 1200x630]               │
│ CalmCraft - Книжковий магазин           │
│ с красивым фоном Dark Academia          │
└─────────────────────────────────────────┘
CalmCraft - Книжковий магазин
Ваш улюблений книжковий магазин класичної 
та сучасної літератури з елегантною 
атмосферою Dark Academia
calmcraft.com.ua
```

### Twitter / X

```
┌─────────────────────────────────────────┐
│                                         │
│     [OG изображение 1200x630]           │
│                                         │
└─────────────────────────────────────────┘
CalmCraft - Книжковий магазин
Ваш улюблений книжковий магазин...
🔗 calmcraft.com.ua
```

### WhatsApp / Telegram

```
CalmCraft - Книжковий магазин
[Превью изображения]
Ваш улюблений книжковий магазин класичної та сучасної літератури...
calmcraft.com.ua
```

---

## Генерируемые HTML Meta Tags

Вот какие мета-теги будут автоматически добавлены на каждую страницу:

```html
<!-- Основные SEO теги -->
<title>CalmCraft - Книжковий магазин</title>
<meta name="description" content="Ваш улюблений книжковий магазин класичної та сучасної літератури з елегантною атмосферою Dark Academia" />
<meta name="keywords" content="книги, книжковий магазин, купити книги, CalmCraft, dark academia, класична література, українські книги" />
<meta name="author" content="CalmCraft" />

<!-- Open Graph (Facebook, Instagram, LinkedIn) -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://calmcraft.com.ua" />
<meta property="og:title" content="CalmCraft - Книжковий магазин" />
<meta property="og:description" content="Ваш улюблений книжковий магазин класичної та сучасної літератури з елегантною атмосферою Dark Academia" />
<meta property="og:image" content="https://calmcraft.com.ua/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="CalmCraft - Книжковий магазин" />
<meta property="og:site_name" content="CalmCraft - Книжковий магазин" />
<meta property="og:locale" content="uk_UA" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="CalmCraft - Книжковий магазин" />
<meta name="twitter:description" content="Ваш улюблений книжковий магазин класичної та сучасної літератури з елегантною атмосферою Dark Academia" />
<meta name="twitter:image" content="https://calmcraft.com.ua/og-image.png" />
<meta name="twitter:creator" content="@CalmCraft" />

<!-- Robots -->
<meta name="robots" content="index, follow" />
<meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />

<!-- Canonical -->
<link rel="canonical" href="https://calmcraft.com.ua" />

<!-- Технические -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<link rel="manifest" href="/manifest.json" />
```

---

## Структурированные данные (JSON-LD)

Для Google и других поисковых систем добавляются структурированные данные:

```json
{
  "@context": "https://schema.org",
  "@type": "BookStore",
  "name": "CalmCraft",
  "description": "Книжковий магазин класичної та сучасної літератури",
  "url": "https://calmcraft.com.ua",
  "logo": "https://calmcraft.com.ua/og-image.png",
  "telephone": "+380 XX XXX XX XX",
  "email": "info@calmcraft.com.ua",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "UA"
  },
  "priceRange": "$$"
}
```

---

## Sitemap.xml

Автоматически генерируется по адресу `/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://calmcraft.com.ua</loc>
    <lastmod>2025-12-05</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://calmcraft.com.ua/cart</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://calmcraft.com.ua/privacy-policy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <!-- и другие страницы -->
</urlset>
```

---

## Robots.txt

Файл `/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/

Sitemap: https://calmcraft.com.ua/sitemap.xml
```

---

## Тестирование

### 1. Facebook Sharing Debugger
URL: https://developers.facebook.com/tools/debug/

**Что проверить:**
- ✅ Отображается правильный заголовок
- ✅ Отображается правильное описание
- ✅ Отображается OG изображение (1200x630px)
- ✅ Тип: website
- ✅ Нет ошибок

### 2. Twitter Card Validator
URL: https://cards-dev.twitter.com/validator

**Что проверить:**
- ✅ Card type: summary_large_image
- ✅ Правильный preview
- ✅ Изображение загружается

### 3. LinkedIn Post Inspector
URL: https://www.linkedin.com/post-inspector/

**Что проверить:**
- ✅ Rich preview отображается
- ✅ Изображение корректно
- ✅ Заголовок и описание правильные

### 4. Google Rich Results Test
URL: https://search.google.com/test/rich-results

**Что проверить:**
- ✅ Structured data валидна
- ✅ BookStore schema распознается
- ✅ WebSite schema с SearchAction

---

## Мобильный предпросмотр

### WhatsApp
```
┌────────────────────────┐
│ 📱 CalmCraft          │
│ [Превью 300x157]      │
│ Книжковий магазин... │
│ calmcraft.com.ua      │
└────────────────────────┘
```

### Telegram
```
┌────────────────────────┐
│ CalmCraft - Книжковий  │
│ [Превью изображения]   │
│ Ваш улюблений...       │
│ 🔗 calmcraft.com.ua   │
└────────────────────────┘
```

---

## Результаты в Google Search

```
CalmCraft - Книжковий магазин
https://calmcraft.com.ua › ...
Ваш улюблений книжковий магазин класичної та 
сучасної літератури з елегантною атмосферою 
Dark Academia

[★★★★★ 4.9] Книжковий магазин
📍 Ukraine · 📞 +380 XX XXX XX XX
```

---

## Чек-лист перед запуском

- [ ] Скопировать `og-image.png` в `public/`
- [ ] Выполнить SQL скрипт `supabase/seo_settings.sql`
- [ ] Обновить `site_url` на продакшн домен
- [ ] Добавить реальные контакты (телефон, email)
- [ ] Протестировать в Facebook Debugger
- [ ] Протестировать в Twitter Card Validator
- [ ] Проверить `robots.txt` (доступен по /robots.txt)
- [ ] Проверить `sitemap.xml` (доступен по /sitemap.xml)
- [ ] Отправить sitemap в Google Search Console
- [ ] Добавить verification коды (Google, Yandex)

---

**🎉 После выполнения всех шагов ваш сайт будет полностью оптимизирован для SEO и социальных сетей!**
