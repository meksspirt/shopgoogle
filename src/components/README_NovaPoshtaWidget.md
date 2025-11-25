# NovaPoshtaWidget Component

## Опис
Компонент для інтеграції офіційного віджету Нової Пошти для вибору відділення доставки.

## Використання

```tsx
import NovaPoshtaWidget from '@/components/NovaPoshtaWidget';

<NovaPoshtaWidget
    onSelect={(data) => {
        console.log('Обрано відділення:', data);
        // data.city - місто
        // data.warehouse - назва відділення
        // data.warehouseId - ID відділення для API
        // data.fullAddress - повна адреса
    }}
    initialCity="Київ"
    initialWarehouse="Відділення №1"
/>
```

## Props

### onSelect (обов'язковий)
Callback функція, яка викликається при виборі відділення.

Параметри:
```typescript
{
    city: string;           // Місто доставки
    warehouse: string;      // Назва відділення (напр. "Відділення №1")
    warehouseId: string;    // ID відділення для API Нової Пошти
    fullAddress: string;    // Повна адреса (напр. "Київ, вул. Хрещатик, 1")
}
```

### initialCity (опціональний)
Початкове значення міста для відображення в кнопці.

### initialWarehouse (опціональний)
Початкове значення відділення для відображення в кнопці.

## Особливості

1. **Геолокація**: Автоматично визначає місто користувача (потрібен дозвіл браузера)
2. **Стилізація**: Адаптований під темну тему сайту
3. **Валідація**: Можна перевірити, чи обрано відділення через `data.city`
4. **Адаптивність**: Повноекранний режим на мобільних пристроях

## Інтеграція з формою

```tsx
const [formData, setFormData] = useState({
    city: '',
    warehouse: '',
    warehouseId: ''
});

<NovaPoshtaWidget
    onSelect={(data) => {
        setFormData({
            ...formData,
            city: data.city,
            warehouse: data.warehouse,
            warehouseId: data.warehouseId
        });
    }}
/>

// Валідація
<button disabled={!formData.city}>
    Оформити замовлення
</button>
```

## API Нової Пошти

Збережений `warehouseId` можна використовувати для:
- Створення ТТН
- Розрахунку вартості доставки
- Відстеження посилок

Документація: https://developers.novaposhta.ua/

## Стилізація

Компонент використовує inline стилі для забезпечення консистентності.
Додаткові стилі можна додати в `globals.css`:

```css
.nova-poshta-button {
    /* Ваші стилі */
}
```

## Troubleshooting

### Віджет не відкривається
- Перевірте, чи не блокується iframe браузером
- Перевірте консоль на наявність помилок CORS

### Геолокація не працює
- Переконайтеся, що сайт використовує HTTPS
- Перевірте дозволи браузера для геолокації

### Дані не зберігаються
- Перевірте, чи викликається callback `onSelect`
- Перевірте, чи правильно оновлюється стан форми
