'use client';

import Modal from './Modal';
import { useState } from 'react';

interface Setting {
    key: string;
    label: string;
    description?: string;
    type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea';
    placeholder?: string;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: { [key: string]: string };
    onSave: (key: string, value: string) => Promise<void>;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'high' | 'medium' | 'low' | 'store'>('high');
    const [localSettings, setLocalSettings] = useState(settings);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const handleSave = async (key: string) => {
        setSavingKey(key);
        await onSave(key, localSettings[key] || '');
        setSavingKey(null);
    };

    const highPrioritySettings: Setting[] = [
        { key: 'monobank_payment_link', label: 'Посилання на Monobank', type: 'url', placeholder: 'https://send.monobank.ua/jar/...', description: 'Використовується на сторінці успішного замовлення' },
        { key: 'notification_email', label: 'Email для сповіщень', type: 'email', placeholder: 'admin@example.com', description: 'Email для отримання сповіщень про нові замовлення' },
        { key: 'support_phone', label: 'Телефон підтримки', type: 'tel', placeholder: '+380XXXXXXXXX', description: 'Відображається в меню та футері' },
        { key: 'instagram_link', label: 'Instagram магазину', type: 'url', placeholder: 'https://instagram.com/username', description: 'Посилання на ваш Instagram профіль' },
        { key: 'min_order_amount', label: 'Мінімальна сума замовлення (грн)', type: 'number', placeholder: '0', description: 'Мінімальна сума для оформлення замовлення' },
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
        <div className="row g-3">
            {settingsList.map((setting) => (
                <div key={setting.key} className="col-12">
                    <div className="setting-card p-3" style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <label className="form-label fw-bold mb-2" style={{ color: '#00075e', fontSize: '0.9rem' }}>
                            {setting.label}
                        </label>
                        {setting.type === 'textarea' ? (
                            <textarea
                                className="form-control mb-2"
                                rows={3}
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    color: '#00075e',
                                    fontSize: '0.9rem'
                                }}
                                placeholder={setting.placeholder}
                                value={localSettings[setting.key] || ''}
                                onChange={e => setLocalSettings({ ...localSettings, [setting.key]: e.target.value })}
                            />
                        ) : (
                            <input
                                type={setting.type || 'text'}
                                className="form-control mb-2"
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    color: '#00075e',
                                    fontSize: '0.9rem'
                                }}
                                placeholder={setting.placeholder}
                                value={localSettings[setting.key] || ''}
                                onChange={e => setLocalSettings({ ...localSettings, [setting.key]: e.target.value })}
                            />
                        )}
                        {setting.description && (
                            <small className="text-muted d-block mb-2" style={{ fontSize: '0.8rem' }}>
                                {setting.description}
                            </small>
                        )}
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSave(setting.key)}
                            disabled={savingKey === setting.key}
                            style={{ 
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                padding: '0.4rem 1rem'
                            }}
                        >
                            {savingKey === setting.key ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Збереження...
                                </>
                            ) : (
                                <>💾 Зберегти</>
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Modal
            id="settings-modal"
            title="⚙️ Налаштування магазину"
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
        >
            {/* Tabs */}
            <div className="mb-4">
                <ul className="nav nav-pills" style={{ gap: '0.5rem' }}>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'high' ? 'active' : ''}`}
                            onClick={() => setActiveTab('high')}
                            style={{
                                backgroundColor: activeTab === 'high' ? '#00075e' : '#f9fafb',
                                color: activeTab === 'high' ? '#ffffff' : '#6b7280',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem'
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
                                backgroundColor: activeTab === 'medium' ? '#00075e' : '#f9fafb',
                                color: activeTab === 'medium' ? '#ffffff' : '#6b7280',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem'
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
                                backgroundColor: activeTab === 'low' ? '#00075e' : '#f9fafb',
                                color: activeTab === 'low' ? '#ffffff' : '#6b7280',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem'
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
                                backgroundColor: activeTab === 'store' ? '#00075e' : '#f9fafb',
                                color: activeTab === 'store' ? '#ffffff' : '#6b7280',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem'
                            }}
                        >
                            🏪 Магазин
                        </button>
                    </li>
                </ul>
            </div>

            {/* Tab Content */}
            <div className="tab-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {activeTab === 'high' && renderSettings(highPrioritySettings)}
                {activeTab === 'medium' && renderSettings(mediumPrioritySettings)}
                {activeTab === 'low' && renderSettings(lowPrioritySettings)}
                {activeTab === 'store' && renderSettings(storeSettings)}
            </div>
        </Modal>
    );
}
