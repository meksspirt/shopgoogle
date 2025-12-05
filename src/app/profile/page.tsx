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

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isGoogleUser, setIsGoogleUser] = useState(false);

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

            // Check if user signed in with Google
            const provider = session.user.app_metadata?.provider;
            setIsGoogleUser(provider === 'google');

            // Fetch orders for customer profile (no admin check needed)
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
            // Logout only from customer profile, don't clear all sessions
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Помилка виходу:', error);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (newPassword.length < 6) {
            setPasswordError('Новий пароль повинен містити мінімум 6 символів');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Паролі не співпадають');
            return;
        }

        setPasswordLoading(true);

        try {
            // First, verify current password by trying to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                throw new Error('Поточний пароль невірний');
            }

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            setPasswordSuccess('Пароль успішно змінено!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Clear success message after 5 seconds
            setTimeout(() => {
                setPasswordSuccess('');
            }, 5000);
        } catch (error: any) {
            console.error('Помилка зміни пароля:', error);
            setPasswordError(error.message || 'Помилка зміни пароля');
        } finally {
            setPasswordLoading(false);
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
                                        id={`order-${order.id}`}
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
                                                                    Кількість: {item.quantity} × {Math.round(item.price)} грн
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
                                                <a
                                                    href={`https://novaposhta.ua/tracking/${order.tracking_number}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-decoration-none"
                                                >
                                                    <div
                                                        className="p-4 rounded mb-3"
                                                        style={{
                                                            background: '#343434',
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(52, 52, 52, 0.4)';
                                                            e.currentTarget.style.background = '#00075e';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                            e.currentTarget.style.background = '#343434';
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <span style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', fontSize: '1rem' }}>
                                                                ТТН Нова Пошта:
                                                            </span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
                                                                <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                                                                <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                                                            </svg>
                                                        </div>
                                                        <div className="fw-bold mb-2" style={{
                                                            fontFamily: 'var(--font-heading)',
                                                            color: '#ffffff',
                                                            fontSize: '1.5rem',
                                                            letterSpacing: '2px',
                                                            wordBreak: 'break-all'
                                                        }}>
                                                            {order.tracking_number}
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2" style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" />
                                                            </svg>
                                                            <span style={{ fontFamily: 'var(--font-heading)' }}>
                                                                Натисніть для відстеження на сайті Нової Пошти
                                                            </span>
                                                        </div>
                                                    </div>
                                                </a>
                                            )}

                                            {/* Total */}
                                            <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '2px solid #e5e7eb' }}>
                                                <span className="fw-bold" style={{ color: '#00075e', fontSize: '1.125rem' }}>
                                                    Всього:
                                                </span>
                                                <span className="fw-bold" style={{ color: '#f59e0b', fontSize: '1.5rem' }}>
                                                    {Math.round(order.total_amount)} грн
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

                                {/* Password Change Section */}
                                {!isGoogleUser && (
                                    <>
                                        <hr className="my-4" />

                                        <h5 className="fw-bold mb-4" style={{ color: '#00075e' }}>Зміна пароля</h5>

                                        {passwordError && (
                                            <div className="alert alert-danger" style={{ borderRadius: '8px' }}>
                                                {passwordError}
                                            </div>
                                        )}

                                        {passwordSuccess && (
                                            <div className="alert alert-success" style={{ borderRadius: '8px' }}>
                                                {passwordSuccess}
                                            </div>
                                        )}

                                        <form onSubmit={handlePasswordChange}>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold" style={{ color: '#00075e' }}>
                                                    Поточний пароль
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                    style={{
                                                        border: '2px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        padding: '0.75rem'
                                                    }}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label fw-semibold" style={{ color: '#00075e' }}>
                                                    Новий пароль
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                    minLength={6}
                                                    style={{
                                                        border: '2px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        padding: '0.75rem'
                                                    }}
                                                />
                                                <small className="text-muted">Мінімум 6 символів</small>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: '#00075e' }}>
                                                    Підтвердіть новий пароль
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                    minLength={6}
                                                    style={{
                                                        border: '2px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        padding: '0.75rem'
                                                    }}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn"
                                                disabled={passwordLoading}
                                                style={{
                                                    backgroundColor: '#00075e',
                                                    color: '#ffffff',
                                                    fontWeight: 600,
                                                    borderRadius: '8px',
                                                    padding: '0.75rem 2rem',
                                                    border: 'none'
                                                }}
                                            >
                                                {passwordLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Збереження...
                                                    </>
                                                ) : (
                                                    'Змінити пароль'
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}

                                {isGoogleUser && (
                                    <>
                                        <hr className="my-4" />
                                        <div className="alert alert-info" style={{ borderRadius: '8px' }}>
                                            <strong>Вхід через Google:</strong> Ви увійшли через Google, тому зміна пароля недоступна. Керуйте паролем через ваш Google акаунт.
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
