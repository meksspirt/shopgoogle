'use client';

import { useState } from 'react';

interface Setting {
    key: string;
    label: string;
    description?: string;
    type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea';
    placeholder?: string;
}

interface SettingsPanelProps {
    settings: { [key: string]: string };
    onSave: (key: string, value: string) => Promise<void>;
    saving: boolean;
}

export default function SettingsPanel({ settings, onSave, saving }: SettingsPanelProps) {
    const [activeTab, setActiveTab] = useState<'high' | 'medium' | 'low' | 'store'>('high');
    const [localSettings, setLocalSettings] = useState(settings);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const handleSave = async (key: string) => {
        setSavingKey(key);
        await onSave(key, localSettings[key] || '');
        setSavingKey(null);
    };

    const highPrioritySettings: Setting[] = [
        { key: 'monobank_payment_link', label: 'Посилання на Monobank', type: 'url', placeholder: 'https://send.monobank.ua/jar/...' },
        { key: 'notification_email', label: 'Email для сповіщень', type: 'email', placeholder: 'admin@example.com', description: 'Email для отримання сповіщень про нові замовлення' },
        { key: 'support_phone', label: 'Телефон підтримки', type: 'tel', placeholder: '+380XXXXXXXXX' },
        { key: 'instagram_link', label: 'Instagram магазину', type: 'url', placeholder: 'https://instagram.com/username' },
        { key: 'min_order_amount', label: 'Мінімальна сума замовлення (грн)', type: 'number', placeholder: '0' },
    ];

    const mediumPrioritySettings: Setting[] = [
        { key: 'free_delivery_from', label: 'Безкоштовна доставка від (грн)', type: 'number', placeholder: '500' },
        { key: 'success_message', label: 'Повідомлення про успішне замовлення', type: 'textarea', placeholder: 'Дякуємо за покупку!' },
        { key: 'delivery_terms', label: 'Умови доставки', type: 'textarea', placeholder: 'Опишіть умови доставки...' },
        { key: 'about_store', label: 'Про магазин', type: 'textarea', placeholder: 'Розкажіть про ваш магазин...' },
        { key: 'telegram_bot_token', label: 'Telegram Bot Token', type: 'text', placeholder: '123456:ABC-DEF...' },
        { key: 'telegram_chat_id', label: 'Telegram Chat ID', type: 'text', placeholder: '123456789' },
    ];

    const lowPrioritySettings: Setting[] = [
        { key: 'site_title', label: 'Заголовок сайту (SEO)', type: 'text', placeholder: 'CalmCraft - Книжковий магазин' },
        { key: 'site_description', label: 'Опис сайту (SEO)', type: 'textarea', placeholder: 'Опис для пошукових систем...' },
        { key: 'site_keywords', label: 'Ключові слова (SEO)', type: 'text', placeholder: 'книги, магазин, купити' },
        { key: 'company_name', label: 'Назва компанії', type: 'text', placeholder: 'ТОВ "Назва"' },
        { key: 'company_code', label: 'ЄДРПОУ/ІПН', type: 'text', placeholder: '12345678' },
        { key: 'legal_address', label: 'Юридична адреса', type: 'text', placeholder: 'м. Київ, вул. ...' },
        { key: 'privacy_policy', label: 'Політика конфіденційності', type: 'textarea', placeholder: 'Текст політики...' },
    ];

    const storeSettings: Setting[] = [
        { key: 'store_name', label: 'Назва магазину', type: 'text', placeholder: 'CalmCraft' },
        { key: 'store_slogan', label: 'Слоган', type: 'text', placeholder: 'Ваш улюблений книжковий магазин' },
        { key: 'working_hours', label: 'Режим роботи', type: 'text', placeholder: 'Пн-Пт: 9:00-18:00' },
        { key: 'products_per_page', label: 'Товарів на сторінці', type: 'number', placeholder: '12' },
    ];

    const renderSettings = (settingsList: Setting[]) => (
        <div className="row g-4">
            {settingsList.map((setting) => (
                <div key={setting.key} className="col-12">
                    <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>
                        {setting.label}
                    </label>
                    {setting.type === 'textarea' ? (
                        <textarea
                            className="form-control"
                            rows={4}
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            placeholder={setting.placeholder}
                            value={localSettings[setting.key] || ''}
                            onChange={e => setLocalSettings({ ...localSettings, [setting.key]: e.target.value })}
                        />
                    ) : (
                        <input
                            type={setting.type || 'text'}
                            className="form-control"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            placeholder={setting.placeholder}
                            value={localSettings[setting.key] || ''}
                            onChange={e => setLocalSettings({ ...localSettings, [setting.key]: e.target.value })}
                        />
                    )}
                    {setting.description && (
                        <small className="text-muted d-block mt-1">{setting.description}</small>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => handleSave(setting.key)}
                        disabled={savingKey === setting.key}
                        style={{ borderRadius: '6px' }}
                    >
                        {savingKey === setting.key ? 'Збереження...' : 'Зберегти'}
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'high' ? 'active' : ''}`}
                        onClick={() => setActiveTab('high')}
                        style={{
                            color: activeTab === 'high' ? '#00075e' : '#6b7280',
                            fontWeight: activeTab === 'high' ? 600 : 400,
                            borderBottom: activeTab === 'high' ? '2px solid #00075e' : 'none',
                            backgroundColor: 'transparent',
                            border: 'none'
                        }}
                    >
                        🔥 Основні
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'medium' ? 'active' : ''}`}
                        onClick={() => setActiveTab('medium')}
                        style={{
                            color: activeTab === 'medium' ? '#00075e' : '#6b7280',
                            fontWeight: activeTab === 'medium' ? 600 : 400,
                            borderBottom: activeTab === 'medium' ? '2px solid #00075e' : 'none',
                            backgroundColor: 'transparent',
                            border: 'none'
                        }}
                    >
                        📋 Додаткові
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'low' ? 'active' : ''}`}
                        onClick={() => setActiveTab('low')}
                        style={{
                            color: activeTab === 'low' ? '#00075e' : '#6b7280',
                            fontWeight: activeTab === 'low' ? 600 : 400,
                            borderBottom: activeTab === 'low' ? '2px solid #00075e' : 'none',
                            backgroundColor: 'transparent',
                            border: 'none'
                        }}
                    >
                        ⚙️ SEO та Юридичні
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'store' ? 'active' : ''}`}
                        onClick={() => setActiveTab('store')}
                        style={{
                            color: activeTab === 'store' ? '#00075e' : '#6b7280',
                            fontWeight: activeTab === 'store' ? 600 : 400,
                            borderBottom: activeTab === 'store' ? '2px solid #00075e' : 'none',
                            backgroundColor: 'transparent',
                            border: 'none'
                        }}
                    >
                        🏪 Магазин
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'high' && renderSettings(highPrioritySettings)}
                {activeTab === 'medium' && renderSettings(mediumPrioritySettings)}
                {activeTab === 'low' && renderSettings(lowPrioritySettings)}
                {activeTab === 'store' && renderSettings(storeSettings)}
            </div>
        </div>
    );
}
