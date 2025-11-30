'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (newPassword.length < 6) {
            setError('Пароль повинен містити мінімум 6 символів');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Паролі не співпадають');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccess(true);

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                router.push('/profile');
            }, 2000);
        } catch (error: any) {
            console.error('Помилка зміни пароля:', error);
            setError(error.message || 'Помилка зміни пароля');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg" style={{ borderRadius: '16px', border: 'none' }}>
                            <div className="card-body p-5 text-center">
                                <div className="mb-4">
                                    <div 
                                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            backgroundColor: '#d1fae5',
                                            color: '#10b981',
                                            fontSize: '2.5rem'
                                        }}
                                    >
                                        ✓
                                    </div>
                                    <h2 className="fw-bold mb-2" style={{ color: '#00075e' }}>
                                        Пароль змінено!
                                    </h2>
                                    <p className="text-muted">
                                        Ваш пароль успішно оновлено. Перенаправлення на профіль...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg" style={{ borderRadius: '16px', border: 'none' }}>
                        <div className="card-body p-5">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#00075e' }}>
                                    Новий пароль
                                </h2>
                                <p className="text-muted">
                                    Введіть ваш новий пароль
                                </p>
                            </div>

                            {/* Alert */}
                            {error && (
                                <div className="alert alert-danger" style={{ borderRadius: '8px' }}>
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
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
                                            padding: '0.75rem',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <small className="text-muted">Мінімум 6 символів</small>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: '#00075e' }}>
                                        Підтвердіть пароль
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
                                            Збереження...
                                        </>
                                    ) : (
                                        'Змінити пароль'
                                    )}
                                </button>
                            </form>

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
                </div>
            </div>
        </div>
    );
}
