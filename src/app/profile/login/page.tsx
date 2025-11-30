'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfileLoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Проверяем, авторизован ли пользователь
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            router.push('/profile');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                // Вход
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                setSuccess('Вхід успішний! Перенаправлення...');
                setTimeout(() => {
                    router.push('/profile');
                }, 1000);
            } else {
                // Регистрация
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;

                setSuccess('Реєстрація успішна! Перевірте вашу пошту для підтвердження.');
                setEmail('');
                setPassword('');
                
                // Переключаем на форму входа через 3 секунды
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccess('');
                }, 3000);
            }
        } catch (error: any) {
            console.error('Помилка:', error);
            setError(error.message || 'Виникла помилка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg" style={{ borderRadius: '16px', border: 'none' }}>
                        <div className="card-body p-5">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#00075e' }}>
                                    {isLogin ? 'Вхід' : 'Реєстрація'}
                                </h2>
                                <p className="text-muted">
                                    {isLogin ? 'Увійдіть до свого профілю' : 'Створіть новий обліковий запис'}
                                </p>
                            </div>

                            {/* Alerts */}
                            {error && (
                                <div className="alert alert-danger" style={{ borderRadius: '8px' }}>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success" style={{ borderRadius: '8px' }}>
                                    {success}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: '#00075e' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="your@email.com"
                                        style={{
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: '#00075e' }}>
                                        Пароль
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        minLength={6}
                                        style={{
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    {!isLogin && (
                                        <small className="text-muted">Мінімум 6 символів</small>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn w-100 mb-3"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#00075e',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                        border: 'none',
                                        fontSize: '1.125rem'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Завантаження...
                                        </>
                                    ) : (
                                        isLogin ? 'Увійти' : 'Зареєструватися'
                                    )}
                                </button>
                            </form>

                            {/* Toggle */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    className="btn btn-link text-decoration-none"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                        setSuccess('');
                                    }}
                                    style={{ color: '#00075e', fontWeight: 600 }}
                                >
                                    {isLogin ? 'Немає облікового запису? Зареєструватися' : 'Вже є обліковий запис? Увійти'}
                                </button>
                            </div>

                            {/* Back to Home */}
                            <div className="text-center mt-3">
                                <Link 
                                    href="/"
                                    className="btn btn-link text-decoration-none"
                                    style={{ color: '#6b7280' }}
                                >
                                    ← Повернутися на головну
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="card mt-4" style={{ borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3" style={{ color: '#00075e' }}>
                                Переваги реєстрації:
                            </h6>
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">
                                    <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
                                    Відстежування статусу замовлень
                                </li>
                                <li className="mb-2">
                                    <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
                                    Історія покупок
                                </li>
                                <li className="mb-2">
                                    <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
                                    Швидке оформлення замовлень
                                </li>
                                <li className="mb-0">
                                    <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
                                    Персональні рекомендації
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
