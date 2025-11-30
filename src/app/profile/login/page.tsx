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
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    useEffect(() => {
        // Проверяем, авторизован ли пользователь (только для профиля покупателя)
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            router.push('/profile');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/profile`,
                }
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Помилка входу через Google:', error);
            setError(error.message || 'Помилка входу через Google');
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/profile/reset-password`,
            });

            if (error) throw error;

            setSuccess('Лист для відновлення пароля надіслано на вашу пошту!');
            setResetEmail('');
            
            // Закрываем форму восстановления через 3 секунды
            setTimeout(() => {
                setShowForgotPassword(false);
                setSuccess('');
            }, 3000);
        } catch (error: any) {
            console.error('Помилка відновлення пароля:', error);
            setError(error.message || 'Помилка відновлення пароля');
        } finally {
            setLoading(false);
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
                                    {showForgotPassword ? 'Відновлення пароля' : isLogin ? 'Вхід' : 'Реєстрація'}
                                </h2>
                                <p className="text-muted">
                                    {showForgotPassword 
                                        ? 'Введіть ваш email для відновлення пароля'
                                        : isLogin ? 'Увійдіть до свого профілю' : 'Створіть новий обліковий запис'
                                    }
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

                            {/* Forgot Password Form */}
                            {showForgotPassword ? (
                                <form onSubmit={handleForgotPassword}>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold" style={{ color: '#00075e' }}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
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
                                                Надсилання...
                                            </>
                                        ) : (
                                            'Надіслати лист'
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            className="btn btn-link text-decoration-none"
                                            onClick={() => {
                                                setShowForgotPassword(false);
                                                setError('');
                                                setSuccess('');
                                            }}
                                            style={{ color: '#00075e', fontWeight: 600 }}
                                        >
                                            ← Повернутися до входу
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {/* Login/Register Form */}
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

                                {/* Forgot Password Link */}
                                {isLogin && (
                                    <div className="text-center mb-3">
                                        <button
                                            type="button"
                                            className="btn btn-link text-decoration-none p-0"
                                            onClick={() => {
                                                setShowForgotPassword(true);
                                                setError('');
                                                setSuccess('');
                                            }}
                                            style={{ color: '#6b7280', fontSize: '0.875rem' }}
                                        >
                                            Забули пароль?
                                        </button>
                                    </div>
                                )}
                            </form>

                            {/* Divider */}
                            <div className="position-relative my-4">
                                <hr style={{ borderColor: '#e5e7eb' }} />
                                <span 
                                    className="position-absolute top-50 start-50 translate-middle px-3"
                                    style={{ 
                                        backgroundColor: '#ffffff',
                                        color: '#6b7280',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    або
                                </span>
                            </div>

                            {/* Google Login Button */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="btn w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#374151',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    border: '2px solid #e5e7eb',
                                    fontSize: '1rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.9895 10.1871C19.9895 9.36767 19.9214 8.76973 19.7742 8.14966H10.1992V11.848H15.8195C15.7062 12.7671 15.0943 14.1512 13.7346 15.0813L13.7155 15.2051L16.7429 17.4969L16.9527 17.5174C18.879 15.7789 19.9895 13.221 19.9895 10.1871Z" fill="#4285F4"/>
                                    <path d="M10.1993 19.9313C12.9527 19.9313 15.2643 19.0454 16.9527 17.5174L13.7346 15.0813C12.8734 15.6682 11.7176 16.0779 10.1993 16.0779C7.50243 16.0779 5.21352 14.3395 4.39759 11.9366L4.27799 11.9466L1.13003 14.3273L1.08887 14.4391C2.76588 17.6945 6.21061 19.9313 10.1993 19.9313Z" fill="#34A853"/>
                                    <path d="M4.39748 11.9366C4.18219 11.3166 4.05759 10.6521 4.05759 9.96565C4.05759 9.27909 4.18219 8.61473 4.38615 7.99466L4.38045 7.8626L1.19304 5.44366L1.08875 5.49214C0.397576 6.84305 0.000976562 8.36008 0.000976562 9.96565C0.000976562 11.5712 0.397576 13.0882 1.08875 14.4391L4.39748 11.9366Z" fill="#FBBC05"/>
                                    <path d="M10.1993 3.85336C12.1142 3.85336 13.406 4.66168 14.1425 5.33717L17.0207 2.59107C15.253 0.985496 12.9527 0 10.1993 0C6.2106 0 2.76588 2.23672 1.08887 5.49214L4.38626 7.99466C5.21352 5.59183 7.50242 3.85336 10.1993 3.85336Z" fill="#EB4335"/>
                                </svg>
                                Продовжити з Google
                            </button>

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
                            </>
                            )}

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
