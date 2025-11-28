# Руководство по использованию Micromodal.js

## Обзор

В проекте реализована система модальных окон на основе библиотеки **Micromodal.js**, которая заменила стандартные JavaScript `alert()`, `confirm()` и Bootstrap модальные окна.

## Компоненты

### 1. Modal (базовый компонент)
Универсальный компонент модального окна с анимациями.

**Расположение:** `src/components/Modal.tsx`

**Использование:**
```tsx
<Modal
    id="my-modal"
    title="Заголовок"
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    size="md" // sm, md, lg, xl
    showCloseButton={true}
>
    {/* Содержимое модального окна */}
</Modal>
```

### 2. ConfirmModal (модальное окно подтверждения)
Заменяет стандартный `confirm()`.

**Расположение:** `src/components/ConfirmModal.tsx`

**Использование:**
```tsx
<ConfirmModal
    id="confirm-delete"
    title="Підтвердження видалення"
    message="Ви впевнені, що хочете видалити цей елемент?"
    isOpen={isOpen}
    onConfirm={() => {
        // Действие при подтверждении
    }}
    onCancel={() => setIsOpen(false)}
    confirmText="Видалити"
    cancelText="Скасувати"
    confirmButtonClass="btn-danger"
/>
```

### 3. AlertModal (модальное окно уведомления)
Заменяет стандартный `alert()`.

**Расположение:** `src/components/AlertModal.tsx`

**Использование:**
```tsx
<AlertModal
    id="alert-success"
    title="Успіх"
    message="Операція виконана успішно!"
    type="success" // success, error, warning, info
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    buttonText="OK"
/>
```

### 4. EditProductModal (модальное окно редактирования товара)
Специализированное модальное окно для редактирования товаров в админке.

**Расположение:** `src/components/EditProductModal.tsx`

## Примеры использования в админке

### Показ подтверждения
```tsx
const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
        isOpen: true,
        title,
        message,
        onConfirm
    });
};

// Использование
showConfirm(
    'Підтвердження видалення',
    'Ви впевнені?',
    async () => {
        // Выполнить действие
    }
);
```

### Показ уведомления
```tsx
const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setAlertModal({
        isOpen: true,
        title,
        message,
        type
    });
};

// Использование
showAlert('Успіх', 'Товар створено!', 'success');
showAlert('Помилка', 'Щось пішло не так', 'error');
```

## Преимущества

1. **Единый стиль** - все модальные окна выглядят одинаково
2. **Анимации** - плавные появление и исчезновение
3. **Доступность** - поддержка ARIA атрибутов
4. **Адаптивность** - корректная работа на мобильных устройствах
5. **Блокировка скролла** - при открытии модального окна страница не прокручивается
6. **Легкость использования** - простой API

## Стилизация

Все модальные окна используют единую цветовую схему проекта:
- Основной цвет: `#00075e`
- Фон заголовка: `#f9fafb`
- Границы: `#e5e7eb`
- Цвета типов уведомлений:
  - Success: `#28a745`
  - Error: `#dc3545`
  - Warning: `#ffc107`
  - Info: `#17a2b8`

## Миграция со старых модальных окон

### Было (Bootstrap):
```tsx
<div className="modal d-block" onClick={() => setOpen(false)}>
    <div className="modal-dialog">
        <div className="modal-content">
            {/* Содержимое */}
        </div>
    </div>
</div>
```

### Стало (Micromodal):
```tsx
<Modal
    id="my-modal"
    title="Заголовок"
    isOpen={isOpen}
    onClose={() => setOpen(false)}
>
    {/* Содержимое */}
</Modal>
```

### Было (alert/confirm):
```tsx
alert('Сообщение');
if (confirm('Вы уверены?')) {
    // Действие
}
```

### Стало:
```tsx
showAlert('Заголовок', 'Сообщение', 'info');
showConfirm('Заголовок', 'Вы уверены?', () => {
    // Действие
});
```

## Установка

Библиотека уже установлена в проекте:
```bash
npm install micromodal
npm install --save-dev @types/micromodal
```

## Дополнительная информация

Документация Micromodal.js: https://micromodal.vercel.app/
