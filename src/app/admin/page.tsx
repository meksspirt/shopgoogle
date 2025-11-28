'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ImageUpload from '@/components/ImageUpload';
import EditProductModal from '@/components/EditProductModal';
import ConfirmModal from '@/components/ConfirmModal';
import AlertModal from '@/components/AlertModal';
import SettingsPanel from '@/components/SettingsPanel';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({
        title: '',
        description: '',
        price: '',
        images: [] as string[],
        mainImageIndex: 0,
        availability: 'in_stock' as 'in_stock' | 'pre_order',
        discount_percent: 0,
        stock_quantity: 0,
        author: '',
        publisher: '',
        translator: '',
        year: new Date().getFullYear(),
        language: 'Українська',
        pages: 0,
        cover_type: '',
        isbn: '',
        format: '',
        book_type: 'Паперова книга'
    });
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [trackingNumbers, setTrackingNumbers] = useState<{ [key: string]: string }>({});
    
    // Modal states
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });
    
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });
    
    // Settings state
    const [settings, setSettings] = useState<{ [key: string]: string }>({});
    const [savingSettings, setSavingSettings] = useState(false);
    
    const [newPromoCode, setNewPromoCode] = useState({
        code: '',
        discount_type: 'percent' as 'percent' | 'fixed',
        discount_percent: 0,
        discount_amount: 0,
        min_order_amount: 0,
        max_uses: null as number | null,
        valid_until: ''
    });

    // Helper functions for modals
    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm
        });
    };

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertModal({
            isOpen: true,
            title,
            message,
            type
        });
    };

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else setOrders(data || []);
        setLoading(false);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
    };

    const fetchPromoCodes = async () => {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching promo codes:', error);
        else setPromoCodes(data || []);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('settings')
            .select('*');

        if (error) {
            console.error('Error fetching settings:', error);
        } else if (data) {
            const settingsObj: { [key: string]: string } = {};
            data.forEach(setting => {
                settingsObj[setting.key] = setting.value || '';
            });
            setSettings(settingsObj);
        }
    };

    const saveSetting = async (key: string, value: string) => {
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({
                    key: key,
                    value: value,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'key'
                });

            if (error) throw error;

            showAlert('Успіх', 'Налаштування збережено!', 'success');
            
            // Update local state
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (error: any) {
            console.error('Error saving setting:', error);
            showAlert('Помилка', 'Помилка збереження: ' + error.message, 'error');
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
        fetchPromoCodes();
        fetchSettings();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            showAlert('Помилка', 'Помилка оновлення статусу', 'error');
            console.error(error);
        } else {
            fetchOrders();
        }
    };

    const updateTrackingNumber = async (id: string, trackingNumber: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ tracking_number: trackingNumber })
            .eq('id', id);

        if (error) {
            showAlert('Помилка', 'Помилка оновлення ТТН', 'error');
            console.error(error);
        } else {
            showAlert('Успіх', 'ТТН успішно збережено!', 'success');
            // Clear the tracking number from state
            setTrackingNumbers(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
            fetchOrders();
        }
    };

    const deleteOrder = async (id: string, orderNumber: string) => {
        try {
            console.log('Deleting order:', id);

            // Используем RPC функцию для удаления заказа
            const { data, error } = await supabase
                .rpc('delete_order_with_items', { order_id_param: id });

            console.log('Delete result:', data);

            if (error) {
                console.error('Error deleting order:', error);
                throw error;
            }

            if (!data || !data.success) {
                throw new Error('Замовлення не знайдено або вже видалено');
            }

            // Обновляем список заказов
            await fetchOrders();
            
            showAlert('Успіх', 'Замовлення успішно видалено', 'success');
        } catch (error: any) {
            showAlert('Помилка', 'Помилка видалення замовлення: ' + (error.message || 'Невідома помилка'), 'error');
            console.error('Delete order error:', error);
            
            // Обновляем список в любом случае
            await fetchOrders();
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newProduct.images.length === 0) {
            showAlert('Увага', 'Будь ласка, завантажте принаймні одне зображення товару', 'warning');
            return;
        }

        setCreatingProduct(true);

        try {
            const { error } = await supabase
                .from('products')
                .insert([{
                    title: newProduct.title,
                    description: newProduct.description,
                    price: parseFloat(newProduct.price),
                    image_url: newProduct.images[newProduct.mainImageIndex],
                    images: newProduct.images,
                    availability: newProduct.availability,
                    discount_percent: parseInt(newProduct.discount_percent.toString()) || 0,
                    stock_quantity: parseInt(newProduct.stock_quantity.toString()) || 0,
                    author: newProduct.author,
                    publisher: newProduct.publisher,
                    translator: newProduct.translator,
                    year: parseInt(newProduct.year.toString()) || new Date().getFullYear(),
                    language: newProduct.language,
                    pages: parseInt(newProduct.pages.toString()) || 0,
                    cover_type: newProduct.cover_type,
                    isbn: newProduct.isbn,
                    format: newProduct.format,
                    book_type: newProduct.book_type
                }]);

            if (error) throw error;

            showAlert('Успіх', 'Товар успішно створено!', 'success');
            setNewProduct({ 
                title: '', 
                description: '', 
                price: '', 
                images: [], 
                mainImageIndex: 0, 
                availability: 'in_stock', 
                discount_percent: 0, 
                stock_quantity: 0,
                author: '',
                publisher: '',
                translator: '',
                year: new Date().getFullYear(),
                language: 'Українська',
                pages: 0,
                cover_type: '',
                isbn: '',
                format: '',
                book_type: 'Паперова книга'
            });
            fetchProducts();
        } catch (error: any) {
            console.error('Error creating product:', error);
            showAlert('Помилка', 'Помилка створення товару: ' + error.message, 'error');
        } finally {
            setCreatingProduct(false);
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProduct) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    title: editingProduct.title,
                    description: editingProduct.description,
                    price: parseFloat(editingProduct.price),
                    image_url: editingProduct.images[editingProduct.mainImageIndex || 0],
                    images: editingProduct.images,
                    availability: editingProduct.availability,
                    discount_percent: parseInt(editingProduct.discount_percent?.toString() || '0') || 0,
                    stock_quantity: parseInt(editingProduct.stock_quantity?.toString() || '0') || 0,
                    author: editingProduct.author,
                    publisher: editingProduct.publisher,
                    translator: editingProduct.translator,
                    year: parseInt(editingProduct.year?.toString() || new Date().getFullYear().toString()),
                    language: editingProduct.language,
                    pages: parseInt(editingProduct.pages?.toString() || '0') || 0,
                    cover_type: editingProduct.cover_type,
                    isbn: editingProduct.isbn,
                    format: editingProduct.format,
                    book_type: editingProduct.book_type
                })
                .eq('id', editingProduct.id);

            if (error) throw error;

            showAlert('Успіх', 'Товар успішно оновлено!', 'success');
            setEditingProduct(null);
            fetchProducts();
        } catch (error: any) {
            console.error('Error updating product:', error);
            showAlert('Помилка', 'Помилка оновлення товару: ' + error.message, 'error');
        }
    };

    const deleteProduct = async (id: number, title: string) => {
        showConfirm(
            'Підтвердження видалення',
            `Ви впевнені, що хочете видалити товар "${title}"?`,
            async () => {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (error) {
                    showAlert('Помилка', 'Помилка видалення товару', 'error');
                    console.error(error);
                } else {
                    showAlert('Успіх', 'Товар успішно видалено', 'success');
                    fetchProducts();
                }
            }
        );
    };

    const handleCreatePromoCode = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { error } = await supabase
                .from('promo_codes')
                .insert([{
                    code: newPromoCode.code.toUpperCase(),
                    discount_percent: newPromoCode.discount_type === 'percent' ? newPromoCode.discount_percent : null,
                    discount_amount: newPromoCode.discount_type === 'fixed' ? newPromoCode.discount_amount : null,
                    min_order_amount: newPromoCode.min_order_amount,
                    max_uses: newPromoCode.max_uses,
                    valid_until: newPromoCode.valid_until ? new Date(newPromoCode.valid_until).toISOString() : null
                }]);

            if (error) throw error;

            showAlert('Успіх', 'Промокод успішно створено!', 'success');
            setNewPromoCode({ code: '', discount_type: 'percent', discount_percent: 0, discount_amount: 0, min_order_amount: 0, max_uses: null, valid_until: '' });
            fetchPromoCodes();
        } catch (error: any) {
            console.error('Error creating promo code:', error);
            showAlert('Помилка', 'Помилка створення промокоду: ' + error.message, 'error');
        }
    };

    const deletePromoCode = async (id: number, code: string) => {
        showConfirm(
            'Підтвердження видалення',
            `Ви впевнені, що хочете видалити промокод "${code}"?`,
            async () => {
                const { error } = await supabase
                    .from('promo_codes')
                    .delete()
                    .eq('id', id);

                if (error) {
                    showAlert('Помилка', 'Помилка видалення промокоду', 'error');
                    console.error(error);
                } else {
                    showAlert('Успіх', 'Промокод успішно видалено', 'success');
                    fetchPromoCodes();
                }
            }
        );
    };

    const togglePromoCodeStatus = async (id: number, currentStatus: boolean) => {
        const { error } = await supabase
            .from('promo_codes')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            showAlert('Помилка', 'Помилка оновлення статусу', 'error');
            console.error(error);
        } else {
            fetchPromoCodes();
        }
    };

    if (loading) return <div className="container py-5">Завантаження...</div>;

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h1 className="fw-bold" style={{ fontFamily: 'var(--font-heading)', color: '#00075e' }}>Панель адміністратора</h1>
                <div className="d-flex gap-2">
                    <button 
                        className="btn" 
                        onClick={() => { fetchOrders(); fetchProducts(); }}
                        style={{
                            backgroundColor: '#ffffff',
                            border: '2px solid #00075e',
                            color: '#00075e',
                            fontWeight: 600,
                            borderRadius: '8px',
                            padding: '0.5rem 1.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#00075e';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.color = '#00075e';
                        }}
                    >
                        Оновити
                    </button>
                    <button 
                        className="btn" 
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#ffffff',
                            border: '2px solid #dc3545',
                            color: '#dc3545',
                            fontWeight: 600,
                            borderRadius: '8px',
                            padding: '0.5rem 1.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc3545';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.color = '#dc3545';
                        }}
                    >
                        Вийти
                    </button>
                </div>
            </div>

            {/* Orders List - MOVED TO TOP */}
            <h3 className="mb-4 fw-bold" style={{ color: '#00075e' }}>Замовлення</h3>
            <div className="card shadow-sm border mb-5" style={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
            }}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <tr>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>ID / Дата</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Клієнт</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Доставка</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Інфо</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Сума</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Статус / ТТН</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td className="py-3">
                                            <small className="d-block" style={{ color: '#6b7280', fontSize: '0.75rem' }} title={order.id}>
                                                {order.id}
                                            </small>
                                            <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{new Date(order.created_at).toLocaleDateString()}</small>
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-bold" style={{ color: '#00075e' }}>{order.customer_name}</div>
                                            <small className="d-block" style={{ color: '#6b7280', fontSize: '0.8rem' }}>{order.customer_email}</small>
                                            <small className="d-block" style={{ color: '#6b7280', fontSize: '0.8rem' }}>{order.customer_phone}</small>
                                        </td>
                                        <td className="py-3">
                                            <div style={{ color: '#00075e', fontWeight: 500 }}>{order.customer_city}</div>
                                            <small className="d-block" style={{ color: '#6b7280', fontSize: '0.8rem' }}>НП: {order.nova_poshta_branch}</small>
                                            {order.nova_poshta_warehouse_id && (
                                                <small className="d-block" style={{ color: '#9ca3af', fontSize: '0.75rem' }}>ID: {order.nova_poshta_warehouse_id}</small>
                                            )}
                                            {order.customer_address && (
                                                <small className="d-block" style={{ color: '#3b82f6', fontSize: '0.75rem' }} title={order.customer_address}>
                                                    {order.customer_address.length > 30 
                                                        ? order.customer_address.substring(0, 30) + '...' 
                                                        : order.customer_address}
                                                </small>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            {order.instagram_nick && (
                                                <div className="small" style={{ color: '#6b7280' }}>
                                                    Inst: <a 
                                                        href={`https://www.instagram.com/${order.instagram_nick.replace('@', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-decoration-none"
                                                        style={{ cursor: 'pointer', color: '#3b82f6' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                    >
                                                        @{order.instagram_nick}
                                                    </a>
                                                </div>
                                            )}
                                            {order.visited_psychologist && (
                                                <span className="badge mt-1" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>Психолог: Так</span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <span className="fw-bold" style={{ color: '#f59e0b' }}>{order.total_amount} грн</span>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex flex-column gap-2">
                                                <span className={`badge bg-${order.status === 'pending' ? 'warning' :
                                                    order.status === 'shipped' ? 'info' :
                                                        order.status === 'delivered' ? 'success' : 'secondary'
                                                    }`}>
                                                    {order.status === 'pending' ? 'Очікується' :
                                                     order.status === 'shipped' ? 'Відправлено' :
                                                     order.status === 'delivered' ? 'Доставлено' :
                                                     order.status === 'cancelled' ? 'Скасовано' : order.status}
                                                </span>
                                                <div className="d-flex gap-1">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="ТТН Нова Пошта"
                                                        value={trackingNumbers[order.id] !== undefined ? trackingNumbers[order.id] : (order.tracking_number || '')}
                                                        onChange={(e) => setTrackingNumbers(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                        style={{ 
                                                            fontSize: '0.85rem',
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #e5e7eb',
                                                            color: '#00075e'
                                                        }}
                                                    />
                                                    <button
                                                        className="btn btn-success btn-sm px-2"
                                                        onClick={() => updateTrackingNumber(order.id, trackingNumbers[order.id] !== undefined ? trackingNumbers[order.id] : (order.tracking_number || ''))}
                                                        title="Зберегти ТТН"
                                                    >
                                                        💾
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex flex-column gap-2">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e5e7eb',
                                                        color: '#00075e'
                                                    }}
                                                >
                                                    <option value="pending">Очікується</option>
                                                    <option value="shipped">Відправлено</option>
                                                    <option value="delivered">Доставлено</option>
                                                    <option value="cancelled">Скасовано</option>
                                                </select>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => deleteOrder(order.id, order.id.slice(0, 8))}
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0" style={{ color: '#00075e' }}>Товари</h3>
                <button 
                    className="btn"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{
                        backgroundColor: showCreateForm ? '#ffffff' : '#28a745',
                        border: showCreateForm ? '2px solid #6b7280' : '2px solid #28a745',
                        color: showCreateForm ? '#6b7280' : '#ffffff',
                        fontWeight: 600,
                        borderRadius: '8px',
                        padding: '0.5rem 1.5rem'
                    }}
                >
                    {showCreateForm ? '✕ Закрити форму' : '+ Додати новий товар'}
                </button>
            </div>

            {/* Create Product Section - Collapsible */}
            {showCreateForm && (
            <div className="card shadow-lg border-0 mb-5" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="card-header bg-transparent border-bottom border-secondary py-3">
                    <h4 className="mb-0 fw-bold text-success">Додати новий товар</h4>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleCreateProduct}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Назва книги</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    placeholder="Введіть назву книги"
                                    value={newProduct.title}
                                    onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Ціна (грн)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    placeholder="0.00"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label small text-muted text-uppercase fw-bold">Опис</label>
                                <textarea
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    rows={3}
                                    required
                                    placeholder="Введіть опис книги"
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Наявність</label>
                                <select
                                    className="form-select form-select-lg bg-dark text-white border-secondary"
                                    value={newProduct.availability}
                                    onChange={e => setNewProduct({ ...newProduct, availability: e.target.value as 'in_stock' | 'pre_order' })}
                                >
                                    <option value="in_stock">В наявності</option>
                                    <option value="pre_order">Предзаказ</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Знижка (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    value={newProduct.discount_percent}
                                    onChange={e => setNewProduct({ ...newProduct, discount_percent: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Кількість на складі</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    placeholder="0"
                                    value={newProduct.stock_quantity}
                                    onChange={e => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            
                            {/* Book Characteristics */}
                            <div className="col-12"><hr className="border-secondary my-3" /><h6 className="text-white">Характеристики книги</h6></div>
                            
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Автор</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.author} onChange={e => setNewProduct({ ...newProduct, author: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Видавництво</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.publisher} onChange={e => setNewProduct({ ...newProduct, publisher: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Перекладач</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.translator} onChange={e => setNewProduct({ ...newProduct, translator: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Рік видання</label>
                                <input type="number" className="form-control bg-dark text-white border-secondary" value={newProduct.year} onChange={e => setNewProduct({ ...newProduct, year: parseInt(e.target.value) || new Date().getFullYear() })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Мова</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.language} onChange={e => setNewProduct({ ...newProduct, language: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Кількість сторінок</label>
                                <input type="number" className="form-control bg-dark text-white border-secondary" value={newProduct.pages} onChange={e => setNewProduct({ ...newProduct, pages: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Обкладинка</label>
                                <select className="form-select bg-dark text-white border-secondary" value={newProduct.cover_type} onChange={e => setNewProduct({ ...newProduct, cover_type: e.target.value })}>
                                    <option value="">Оберіть</option>
                                    <option value="Тверда">Тверда</option>
                                    <option value="М'яка">М'яка</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">ISBN</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.isbn} onChange={e => setNewProduct({ ...newProduct, isbn: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Формат</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="140x210мм" value={newProduct.format} onChange={e => setNewProduct({ ...newProduct, format: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Тип книги</label>
                                <select className="form-select bg-dark text-white border-secondary" value={newProduct.book_type} onChange={e => setNewProduct({ ...newProduct, book_type: e.target.value })}>
                                    <option value="Паперова книга">Паперова книга</option>
                                    <option value="Електронна книга">Електронна книга</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <ImageUpload
                                    onUploadComplete={(urls, mainIndex) => setNewProduct({ ...newProduct, images: urls, mainImageIndex: mainIndex })}
                                    currentImages={newProduct.images}
                                    mainImageIndex={newProduct.mainImageIndex}
                                    maxImages={5}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-success btn-lg mt-4 px-5" disabled={creatingProduct}>
                            {creatingProduct ? 'Створення...' : 'Створити товар'}
                        </button>
                    </form>
                </div>
            </div>
            )}

            {/* Products List */}
            <div className="row g-4 mb-5">
                {products.map((product) => (
                    <div key={product.id} className="col-md-6 col-lg-4">
                        <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)', cursor: 'pointer' }}>
                            <Link href={`/product/${product.id}`} target="_blank" className="text-decoration-none">
                                <div className="position-relative" style={{ height: '200px' }}>
                                    <Image
                                        src={product.image_url}
                                        alt={product.title}
                                        fill
                                        className="object-fit-cover"
                                    />
                                </div>
                            </Link>
                            <div className="card-body">
                                <Link href={`/product/${product.id}`} target="_blank" className="text-decoration-none">
                                    <h5 className="card-title text-white">{product.title}</h5>
                                </Link>
                                <p className="card-text text-muted small">
                                    {product.description.length > 50
                                        ? product.description.substring(0, 50) + '...'
                                        : product.description}
                                </p>
                                <p className="fw-bold text-warning">{product.price} грн</p>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setEditingProduct({ ...product, mainImageIndex: 0 })}
                                    >
                                        Редагувати
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteProduct(product.id, product.title)}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Promo Codes Section */}
            <h3 className="mb-4 fw-bold mt-5" style={{ color: '#00075e' }}>Промокоди</h3>
            
            {/* Create Promo Code Form */}
            <div className="card shadow-sm mb-4" style={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
            }}>
                <div className="card-header py-3" style={{ 
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <h5 className="mb-0 fw-bold" style={{ color: '#28a745' }}>Створити промокод</h5>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleCreatePromoCode}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Код промокоду</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e'
                                    }}
                                    required
                                    placeholder="SUMMER2024"
                                    value={newPromoCode.code}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Тип знижки</label>
                                <select
                                    className="form-select"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e'
                                    }}
                                    value={newPromoCode.discount_type}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, discount_type: e.target.value as 'percent' | 'fixed' })}
                                >
                                    <option value="percent">Відсоток (%)</option>
                                    <option value="fixed">Фіксована сума (грн)</option>
                                </select>
                            </div>
                            {newPromoCode.discount_type === 'percent' ? (
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Знижка (%)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        className="form-control"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            color: '#00075e'
                                        }}
                                        required
                                        value={newPromoCode.discount_percent}
                                        onChange={e => setNewPromoCode({ ...newPromoCode, discount_percent: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            ) : (
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Знижка (грн)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            color: '#00075e'
                                        }}
                                        required
                                        value={newPromoCode.discount_amount}
                                        onChange={e => setNewPromoCode({ ...newPromoCode, discount_amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            )}
                            <div className="col-md-2">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Мін. сума</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e'
                                    }}
                                    value={newPromoCode.min_order_amount}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, min_order_amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Макс. використань</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e'
                                    }}
                                    placeholder="Необмежено"
                                    value={newPromoCode.max_uses || ''}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Діє до</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e'
                                    }}
                                    value={newPromoCode.valid_until}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, valid_until: e.target.value })}
                                />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-success px-5">Створити промокод</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Promo Codes List */}
            <div className="card shadow-sm mb-5" style={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
            }}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <tr>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Код</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Знижка</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Мін. сума</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Використання</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Діє до</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Статус</th>
                                    <th className="py-3" style={{ color: '#00075e', fontWeight: 600 }}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoCodes.map((promo) => (
                                    <tr key={promo.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td className="py-3">
                                            <span className="fw-bold" style={{ color: '#f59e0b' }}>{promo.code}</span>
                                        </td>
                                        <td className="py-3">
                                            {promo.discount_percent ? 
                                                <span style={{ color: '#28a745', fontWeight: 600 }}>{promo.discount_percent}%</span> :
                                                <span style={{ color: '#28a745', fontWeight: 600 }}>{promo.discount_amount} грн</span>
                                            }
                                        </td>
                                        <td className="py-3">
                                            <span style={{ color: '#6b7280' }}>{promo.min_order_amount} грн</span>
                                        </td>
                                        <td className="py-3">
                                            <span style={{ color: '#00075e', fontWeight: 500 }}>
                                                {promo.current_uses || 0} / {promo.max_uses || '∞'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('uk-UA') : 'Безстроково'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`badge ${promo.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                {promo.is_active ? 'Активний' : 'Неактивний'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex gap-2">
                                                <button
                                                    className={`btn btn-sm ${promo.is_active ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => togglePromoCodeStatus(promo.id, promo.is_active)}
                                                >
                                                    {promo.is_active ? 'Деактивувати' : 'Активувати'}
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => deletePromoCode(promo.id, promo.code)}
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Settings Section */}
            <h3 className="mb-4 fw-bold mt-5" style={{ color: '#00075e' }}>Налаштування</h3>
            
            <div className="card shadow-sm mb-5" style={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
            }}>
                <div className="card-body p-4">
                    <SettingsPanel
                        settings={settings}
                        onSave={saveSetting}
                        saving={savingSettings}
                    />
                </div>
            </div>

            {/* Edit Product Modal */}
            <EditProductModal
                product={editingProduct}
                isOpen={!!editingProduct}
                onClose={() => setEditingProduct(null)}
                onSave={handleUpdateProduct}
                onChange={setEditingProduct}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                id="confirm-modal"
                title={confirmModal.title}
                message={confirmModal.message}
                isOpen={confirmModal.isOpen}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                confirmText="Видалити"
                cancelText="Скасувати"
            />

            {/* Alert Modal */}
            <AlertModal
                id="alert-modal"
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
            />

        </div>
    );
}
