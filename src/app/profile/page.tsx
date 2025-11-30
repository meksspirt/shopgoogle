'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_city: string;
    nova_poshta_branch: string;
    instagram_nick: string;
    visited_psychologist: boolean;
    total_amount: number;
    status: string;
    tracking_number: string;
}

interface OrderItem {
    id: number;
    order_id: string;
    product_id: number;
    quantity: number;
    price: number;
    product?: {
        title: string;
        image_url: string;
    };
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (!session || error) {
                router.push('/profile/login');
                return;
            }

            setUser(session.user);
            await fetchOrders(session.user.email!);
        } catch (error) {
            console.error('Помилка аутентифікації:', error);
            router.push('/profile/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_email', email)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setOrders(data || []);

            // Загружаем товары для каждого заказа
            for (const order of data || []) {
                await fetchOrderItems(order.id);
            }
        } catch (error) {
            console.error('Помилка завантаження замовлень:', error);
        }
    };

    const fetchOrderItems = async (orderId: string) => {
        try {
            const { data, error } = await supabase
                .from('order_items')
                .select(`
                    *,
                    product:products(title, image_url)
                `)
                .eq('order_id', orderId);

            if (error) throw error;

            setOrderItems(prev => ({
                ...prev,
                [orderId]: data || []
            }));
        } catch (error) {
            console.error('Помилка завантаження товарів:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Помилка виходу:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { text: string; color: string } } = {
            pending: { text: 'Очікується', color: '#fbbf24' },
            shipped: { text: 'Відправлено', color: '#3b82f6' },
            delivered: { text: 'Доставлено', color: '#10b981' },
            cancelled: { text: 'Скасовано', color: '#ef4444' }
        };

        const statusInfo = statusMap[status] || { text: status, color: '#6b7280' };

        return (
            <span 
                className="badge px-3 py-2"
                style={{ 
                    backgroundColor: statusInfo.color,
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600
                }}
            >
                {statusInfo.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border" style={{ color: '#00075e' }} role="status">
                        <span className="visually-hidden">Завантаження...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#00075e' }}>
                                Мій профіль
                            </h1>
                            <p className="text-muted mb-0">{user?.email}</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Link 
                                href="/"
                                className="btn"
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '2px solid #00075e',
                                    color: '#00075e',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    padding: '0.5rem 1.5rem'
                                }}
                            >
                                На головну
                            </Link>
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
                            >
                                Вийти
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="row mb-4">
                <div className="col-12">
                    <ul className="nav nav-tabs border-0">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                                style={{
                                    border: 'none',
                                    borderBottom: activeTab === 'orders' ? '3px solid #00075e' : '3px solid transparent',
                                    color: activeTab === 'orders' ? '#00075e' : '#6b7280',
                                    fontWeight: 600,
                                    padding: '1rem 2rem',
                                    backgroundColor: 'transparent'
                                }}
                            >
                                Мої замовлення ({orders.length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('settings')}
                                style={{
                                    border: 'none',
                                    borderBottom: activeTab === 'settings' ? '3px solid #00075e' : '3px solid transparent',
                                    color: activeTab === 'settings' ? '#00075e' : '#6b7280',
                                    fontWeight: 600,
                                    padding: '1rem 2rem',
                                    backgroundColor: 'transparent'
                                }}
                            >
                                Налаштування
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'orders' && (
                <div className="row">
                    <div className="col-12">
                        {orders.length === 0 ? (
                            <div className="card shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                <div className="card-body text-center py-5">
                                    <p className="text-muted mb-3">У вас поки немає замовлень</p>
                                    <Link 
                                        href="/"
                                        className="btn"
                                        style={{
                                            backgroundColor: '#00075e',
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            borderRadius: '8px',
                                            padding: '0.75rem 2rem',
                                            border: 'none'
                                        }}
                                    >
                                        Почати покупки
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {orders.map((order) => (
                                    <div 
                                        key={order.id}
                                        className="card shadow-sm"
                                        style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                                    >
                                        <div className="card-body p-4">
                                            {/* Order Header */}
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h5 className="fw-bold mb-1" style={{ color: '#00075e' }}>
                                                        Замовлення #{order.id.substring(0, 8)}
                                                    </h5>
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                                                        {new Date(order.created_at).toLocaleDateString('uk-UA', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>

                                            {/* Order Items */}
                                            {orderItems[order.id] && orderItems[order.id].length > 0 && (
                                                <div className="mb-3">
                                                    {orderItems[order.id].map((item) => (
                                                        <div 
                                                            key={item.id}
                                                            className="d-flex gap-3 mb-2 pb-2"
                                                            style={{ borderBottom: '1px solid #f3f4f6' }}
                                                        >
                                                            {item.product?.image_url && (
                                                                <img 
                                                                    src={item.product.image_url}
                                                                    alt={item.product.title}
                                                                    style={{
                                                                        width: '60px',
                                                                        height: '80px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px'
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex-grow-1">
                                                                <p className="mb-1 fw-semibold" style={{ color: '#00075e' }}>
                                                                    {item.product?.title || 'Товар'}
                                                                </p>
                                                                <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                                                                    Кількість: {item.quantity} × {item.price} грн
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Order Details */}
                                            <div className="row g-3 mb-3">
                                                <div className="col-md-6">
                                                    <div className="p-3" style={{ backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                                                        <p className="mb-1 text-muted" style={{ fontSize: '0.875rem' }}>Доставка</p>
                                                        <p className="mb-0 fw-semibold" style={{ color: '#00075e' }}>
                                                            {order.customer_city}
                                                        </p>
                                                        <p className="mb-0" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                            {order.nova_poshta_branch}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-3" style={{ backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                                                        <p className="mb-1 text-muted" style={{ fontSize: '0.875rem' }}>Контакти</p>
                                                        <p className="mb-0 fw-semibold" style={{ color: '#00075e' }}>
                                                            {order.customer_name}
                                                        </p>
                                                        <p className="mb-0" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                            {order.customer_phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tracking Number */}
                                            {order.tracking_number && (
                                                <div className="alert alert-info mb-3" style={{ borderRadius: '8px' }}>
                                                    <strong>ТТН:</strong> {order.tracking_number}
                                                </div>
                                            )}

                                            {/* Total */}
                                            <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '2px solid #e5e7eb' }}>
                                                <span className="fw-bold" style={{ color: '#00075e', fontSize: '1.125rem' }}>
                                                    Всього:
                                                </span>
                                                <span className="fw-bold" style={{ color: '#f59e0b', fontSize: '1.5rem' }}>
                                                    {order.total_amount} грн
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="row">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4" style={{ color: '#00075e' }}>Налаштування профілю</h5>
                                
                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: '#00075e' }}>Email</label>
                                    <input 
                                        type="email"
                                        className="form-control"
                                        value={user?.email || ''}
                                        disabled
                                        style={{
                                            backgroundColor: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '0.75rem'
                                        }}
                                    />
                                    <small className="text-muted">Email не можна змінити</small>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: '#00075e' }}>ID користувача</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        value={user?.id || ''}
                                        disabled
                                        style={{
                                            backgroundColor: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                <div className="alert alert-info" style={{ borderRadius: '8px' }}>
                                    <strong>Примітка:</strong> Для зміни особистих даних зверніться до служби підтримки
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
