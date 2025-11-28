'use client';

import Modal from './Modal';
import { useState, useEffect } from 'react';

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
    const [activeTab, setActiveTab] = useState<'general' | 'contacts' | 'payments' | 'seo'>('general');
    const [localSettings, setLocalSettings] = useState(settings);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    // Синхронізуємо локальні налаштування з пропсами
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = async (key: string) => {
        setSavingKey(key);
        await onSave(key, localSettings[key] || '');
        setSavingKey(null);
    };

    // Загальні налаштування магазину
    const generalSettings: Setting[] = [
        { key: 'store_name', label: 'Назва магазину', type: 'text', placeholder: 'CalmCraft', description: 'Відображається в меню та футері' },
        { key: 'store_slogan', label: 'Слоган магазину', type: 'text', placeholder: 'Ваш улюблений книжковий магазин' },
        { key: 'working_hours', label: 'Режим роботи', type: 'text', placeholder: 'Пн-Пт: 9:00-18:00', description: 'Відображається у футері' },
        { key: 'min_order_amount', label: 'Мінімальна сума замовлення (грн)', type: 'number', placeholder: '0', description: 'Мінімальна сума для оформлення замовлення' },
        { key: 'free_delivery_from', label: 'Безкоштовна доставка від (грн)', type: 'number', placeholder: '500', description: 'Сума для безкоштовної доставки' },
        { key: 'products_per_page', label: 'Товарів на сторінці', type: 'number', placeholder: '12' },
        { key: 'success_message', label: 'Повідомлення про успішне замовлення', type: 'textarea', placeholder: 'Дякуємо за покупку!', description: 'Відображається на сторінці успіху' },
        { key: 'delivery_terms', label: 'Умови доставки', type: 'textarea', placeholder: 'Опишіть умови доставки...' },
        { key: 'about_store', label: 'Про магазин', type: 'textarea', placeholder: 'Розкажіть про ваш магазин...' },
    ];

    // Контакти та соцмережі
    const contactsSettings: Setting[] = [
        { key: 'support_phone', label: 'Телефон підтримки', type: 'tel', placeholder: '+380XXXXXXXXX', description: 'Відображається в меню та футері' },
        { key: 'notification_email', label: 'Email для сповіщень', type: 'email', placeholder: 'admin@example.com', description: 'Email для отримання сповіщень про нові замовлення' },
        { key: 'instagram_link', label: 'Instagram магазину', type: 'url', placeholder: 'https://instagram.com/username', description: 'Посилання на ваш Instagram профіль' },
        { key: 'telegram_bot_token', label: 'Telegram Bot Token', type: 'text', placeholder: '123456:ABC-DEF...', description: 'Для сповіщень у Telegram' },
        { key: 'telegram_chat_id', label: 'Telegram Chat ID', type: 'text', placeholder: '123456789', description: 'ID чату для сповіщень' },
        { key: 'company_name', label: 'Назва компанії', type: 'text', placeholder: 'ТОВ "Назва"', description: 'Юридична назва' },
        { key: 'company_code', label: 'ЄДРПОУ/ІПН', type: 'text', placeholder: '12345678' },
        { key: 'legal_address', label: 'Юридична адреса', type: 'text', placeholder: 'м. Київ, вул. ...' },
    ];

    // Оплата
    const paymentsSettings: Setting[] = [
        { key: 'monobank_payment_link', label: 'Посилання на Monobank', type: 'url', placeholder: 'https://send.monobank.ua/jar/...', description: 'Використовується на сторінці успішного замовлення' },
    ];

    // SEO та контент
    const seoSettings: Setting[] = [
        { key: 'site_title', label: 'Заголовок сайту (SEO)', type: 'text', placeholder: 'CalmCraft - Книжковий магазин', description: 'Відображається у вкладці браузера та Google' },
        { key: 'site_description', label: 'Опис сайту (SEO)', type: 'textarea', placeholder: 'Опис для пошукових систем...', description: 'Відображається в результатах пошуку Google' },
        { key: 'site_keywords', label: 'Ключові слова (SEO)', type: 'text', placeholder: 'книги, магазин, купити', description: 'Через кому' },
        { key: 'privacy_policy', label: 'Політика конфіденційності', type: 'textarea', placeholder: 'Текст політики...' },
    ];

    const renderSettings = (settingsList: Setting[]) => (
        <div className="row g-3">
            {settingsList.map((setting) => (
                <div key={setting.key} className="col-12">
                    <div className="setting-card p-3" style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb'
                    }}>
                        <label className="form-label fw-bold mb-2" style={{ color: '#1f2937', fontSize: '0.95rem' }}>
                            {setting.label}
                        </label>
                        {setting.type === 'textarea' ? (
                            <textarea
                                className="form-control mb-2"
                                rows={3}
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '2px solid #e5e7eb',
                                    color: '#1f2937',
                                    fontSize: '0.95rem'
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
                                    border: '2px solid #e5e7eb',
                                    color: '#1f2937',
                                    fontSize: '0.95rem'
                                }}
                                placeholder={setting.placeholder}
                                value={localSettings[setting.key] || ''}
                                onChange={e => setLocalSettings({ ...localSettings, [setting.key]: e.target.value })}
                            />
                        )}
                        {setting.description && (
                            <small style={{ color: '#6b7280', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
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
                <ul className="nav nav-pills" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                            style={{
                                backgroundColor: activeTab === 'general' ? '#48A9A6' : '#f3f4f6',
                                color: activeTab === 'general' ? '#ffffff' : '#374151',
                                fontWeight: 600,
                                border: activeTab === 'general' ? 'none' : '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🏪 Загальні
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'contacts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contacts')}
                            style={{
                                backgroundColor: activeTab === 'contacts' ? '#48A9A6' : '#f3f4f6',
                                color: activeTab === 'contacts' ? '#ffffff' : '#374151',
                                fontWeight: 600,
                                border: activeTab === 'contacts' ? 'none' : '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            📞 Контакти
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payments')}
                            style={{
                                backgroundColor: activeTab === 'payments' ? '#48A9A6' : '#f3f4f6',
                                color: activeTab === 'payments' ? '#ffffff' : '#374151',
                                fontWeight: 600,
                                border: activeTab === 'payments' ? 'none' : '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            💳 Оплата
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'seo' ? 'active' : ''}`}
                            onClick={() => setActiveTab('seo')}
                            style={{
                                backgroundColor: activeTab === 'seo' ? '#48A9A6' : '#f3f4f6',
                                color: activeTab === 'seo' ? '#ffffff' : '#374151',
                                fontWeight: 600,
                                border: activeTab === 'seo' ? 'none' : '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🔍 SEO
                        </button>
                    </li>
                </ul>
            </div>

            {/* Tab Content */}
            <div className="tab-content" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {activeTab === 'general' && renderSettings(generalSettings)}
                {activeTab === 'contacts' && renderSettings(contactsSettings)}
                {activeTab === 'payments' && renderSettings(paymentsSettings)}
                {activeTab === 'seo' && renderSettings(seoSettings)}
            </div>

            <style jsx global>{`
                #settings-modal .form-control,
                #settings-modal .form-control::placeholder,
                #settings-modal .form-label,
                #settings-modal input,
                #settings-modal textarea,
                #settings-modal label {
                    color: #1f2937 !important;
                }

                #settings-modal .form-control::placeholder {
                    color: #9ca3af !important;
                    opacity: 1 !important;
                }

                #settings-modal .form-control:focus {
                    border-color: #00075e !important;
                    box-shadow: 0 0 0 0.2rem rgba(0, 7, 94, 0.1) !important;
                }

                #settings-modal .setting-card {
                    transition: all 0.2s ease;
                }

                #settings-modal .setting-card:hover {
                    border-color: #00075e !important;
                    box-shadow: 0 2px 8px rgba(0, 7, 94, 0.1);
                }
            `}</style>
        </Modal>
    );
}
