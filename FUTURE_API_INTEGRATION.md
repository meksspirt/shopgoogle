# 🚀 Майбутня інтеграція з API Нової Пошти

## 📦 Що можна додати

Зараз ви зберігаєте `nova_poshta_warehouse_id` - це відкриває можливості для:

### 1. Автоматичне створення ТТН
Після оформлення замовлення автоматично створювати накладну в системі НП.

### 2. Розрахунок вартості доставки
Показувати клієнту точну вартість доставки до обраного відділення.

### 3. Відстеження посилок
Автоматично оновлювати статус замовлення на основі даних НП.

### 4. Друк накладних
Генерувати PDF накладні для друку прямо з адмінки.

## 🔑 Отримання API ключа

1. Зареєструйтеся на https://my.novaposhta.ua/
2. Перейдіть в розділ "Налаштування" → "Безпека"
3. Згенеруйте API ключ
4. Додайте його в `.env.local`:

```env
NOVA_POSHTA_API_KEY=your_api_key_here
```

## 💻 Приклади використання

### 1. Створення ТТН

```typescript
// src/lib/novaposhtaApi.ts

export async function createInternetDocument(orderData: {
  senderRef: string;
  recipientName: string;
  recipientPhone: string;
  recipientWarehouseRef: string; // Це наш nova_poshta_warehouse_id!
  description: string;
  cost: number;
  weight: number;
}) {
  const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: process.env.NOVA_POSHTA_API_KEY,
      modelName: 'InternetDocument',
      calledMethod: 'save',
      methodProperties: {
        PayerType: 'Recipient',
        PaymentMethod: 'Cash',
        DateTime: new Date().toISOString().split('T')[0],
        CargoType: 'Cargo',
        ServiceType: 'WarehouseWarehouse',
        SeatsAmount: '1',
        Description: orderData.description,
        Cost: orderData.cost.toString(),
        CitySender: orderData.senderRef,
        Sender: orderData.senderRef,
        SenderAddress: orderData.senderRef,
        ContactSender: orderData.senderRef,
        SendersPhone: '+380XXXXXXXXX',
        RecipientCityName: 'Київ',
        RecipientArea: '',
        RecipientAreaRegions: '',
        RecipientAddressName: '',
        RecipientHouse: '',
        RecipientFlat: '',
        RecipientName: orderData.recipientName,
        RecipientType: 'PrivatePerson',
        RecipientsPhone: orderData.recipientPhone,
        RecipientWarehouse: orderData.recipientWarehouseRef, // ← Використовуємо збережений ID!
        Weight: orderData.weight.toString(),
      },
    }),
  });

  return response.json();
}
```

### 2. Розрахунок вартості доставки

```typescript
export async function calculateDeliveryCost(
  cityRef: string,
  warehouseRef: string,
  weight: number
) {
  const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: process.env.NOVA_POSHTA_API_KEY,
      modelName: 'InternetDocument',
      calledMethod: 'getDocumentPrice',
      methodProperties: {
        CitySender: 'YOUR_CITY_REF',
        CityRecipient: cityRef,
        Weight: weight.toString(),
        ServiceType: 'WarehouseWarehouse',
        Cost: '100',
        CargoType: 'Cargo',
        SeatsAmount: '1',
      },
    }),
  });

  return response.json();
}
```

### 3. Відстеження посилки

```typescript
export async function trackDocument(trackingNumber: string) {
  const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: process.env.NOVA_POSHTA_API_KEY,
      modelName: 'TrackingDocument',
      calledMethod: 'getStatusDocuments',
      methodProperties: {
        Documents: [
          {
            DocumentNumber: trackingNumber,
            Phone: '',
          },
        ],
      },
    }),
  });

  return response.json();
}
```

## 🔄 Інтеграція в адмінку

### Додайте кнопку "Створити ТТН"

```tsx
// src/app/admin/page.tsx

const handleCreateTTN = async (order: any) => {
  try {
    const result = await createInternetDocument({
      senderRef: 'YOUR_SENDER_REF',
      recipientName: order.customer_name,
      recipientPhone: order.customer_phone,
      recipientWarehouseRef: order.nova_poshta_warehouse_id, // ← Використовуємо збережений ID!
      description: 'Книги',
      cost: order.total_amount,
      weight: 1, // Розрахуйте вагу на основі товарів
    });

    if (result.success) {
      // Зберігаємо ТТН в базу
      await supabase
        .from('orders')
        .update({ tracking_number: result.data[0].IntDocNumber })
        .eq('id', order.id);

      alert('ТТН створено: ' + result.data[0].IntDocNumber);
    }
  } catch (error) {
    console.error('Помилка створення ТТН:', error);
    alert('Помилка створення ТТН');
  }
};

// В таблиці замовлень:
<button
  className="btn btn-success btn-sm"
  onClick={() => handleCreateTTN(order)}
  disabled={!order.nova_poshta_warehouse_id}
>
  Створити ТТН
</button>
```

## 📊 Автоматичне оновлення статусів

### Створіть Cron Job для відстеження

```typescript
// src/app/api/cron/update-tracking/route.ts

export async function GET() {
  // Отримуємо всі замовлення зі статусом "shipped"
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'shipped')
    .not('tracking_number', 'is', null);

  for (const order of orders || []) {
    const trackingInfo = await trackDocument(order.tracking_number);
    
    if (trackingInfo.success) {
      const status = trackingInfo.data[0].Status;
      
      // Оновлюємо статус замовлення
      if (status === 'Отримано') {
        await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', order.id);
      }
    }
  }

  return Response.json({ success: true });
}
```

## 🎯 Розрахунок вартості доставки на чекауті

```tsx
// src/app/checkout/page.tsx

const [deliveryCost, setDeliveryCost] = useState<number | null>(null);

const handleWarehouseSelect = async (data: any) => {
  setFormData({
    ...formData,
    city: data.city,
    novaPoshta: data.warehouse,
    novaPoshtaId: data.warehouseId,
  });

  // Розраховуємо вартість доставки
  const cost = await calculateDeliveryCost(
    data.cityRef,
    data.warehouseId,
    calculateTotalWeight(cart)
  );

  if (cost.success) {
    setDeliveryCost(cost.data[0].Cost);
  }
};

// Відображаємо вартість
{deliveryCost && (
  <div className="alert alert-info">
    Вартість доставки: {deliveryCost} грн
  </div>
)}
```

## 📚 Корисні посилання

- [Документація API НП](https://developers.novaposhta.ua/documentation)
- [Приклади запитів](https://developers.novaposhta.ua/view/model/a0cf0f5f-8512-11ec-8ced-005056b2dbe1/method/a2322f38-8512-11ec-8ced-005056b2dbe1)
- [Тестове середовище](https://developers.novaposhta.ua/sandbox)

## ⚠️ Важливо

1. **Тестуйте на тестовому API ключі** перед використанням на продакшені
2. **Зберігайте API ключ в безпеці** - ніколи не комітьте його в Git
3. **Обробляйте помилки** - API може повертати помилки
4. **Кешуйте результати** - не робіть зайвих запитів до API
5. **Логуйте запити** - для відлагодження та моніторингу

## 🎉 Результат

Після повної інтеграції ви матимете:
- ✅ Автоматичне створення ТТН
- ✅ Розрахунок вартості доставки
- ✅ Відстеження посилок
- ✅ Автоматичне оновлення статусів
- ✅ Друк накладних
- ✅ Повна автоматизація процесу доставки

## 💡 Поради

1. Почніть з простого - спочатку додайте тільки створення ТТН
2. Тестуйте кожну функцію окремо
3. Додайте логування для відлагодження
4. Створіть окремий файл для API функцій
5. Використовуйте TypeScript типи для безпеки

Успіхів у розробці! 🚀
