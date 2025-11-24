'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStatus(null);

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) throw error;
            setStatus(data);
        } catch (err: any) {
            setError('Замовлення не знайдено або невірний ID.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h1 className="text-center mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Відстежити замовлення</h1>
                    <div className="card shadow-sm mb-4" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <div className="card-body">
                            <form onSubmit={handleTrack}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small text-uppercase fw-bold">Номер замовлення</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg bg-dark text-white border-secondary"
                                        placeholder="напр. 530819"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                                    {loading ? 'Пошук...' : 'Відстежити'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {status && (
                        <div className="card shadow-lg border-0" style={{ backgroundColor: 'var(--card-bg)' }}>
                            <div className="card-header border-bottom border-secondary py-4" style={{ backgroundColor: '#6d77fa' }}>
                                <h5 className="mb-0 fw-bold" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
                                    Статус замовлення
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <h5 className="mb-4 fw-bold" style={{ fontFamily: 'var(--font-heading)', color: '#e6f1ff', fontSize: '1.5rem' }}>
                                    Замовлення #{status.id}
                                </h5>
                                
                                <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontFamily: 'var(--font-heading)', color: '#b8aafa', fontSize: '1.1rem' }}>
                                            Статус:
                                        </span>
                                        <span className={`badge px-4 py-2 ${
                                            status.status === 'pending' ? 'bg-warning text-dark' :
                                            status.status === 'shipped' ? 'bg-info text-dark' :
                                            status.status === 'delivered' ? 'bg-success' : 
                                            'bg-secondary'
                                        }`} style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: '600' }}>
                                            {status.status === 'pending' ? 'Очікується' :
                                             status.status === 'shipped' ? 'Відправлено' :
                                             status.status === 'delivered' ? 'Доставлено' :
                                             status.status === 'cancelled' ? 'Скасовано' : status.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontFamily: 'var(--font-heading)', color: '#b8aafa', fontSize: '1.1rem' }}>
                                            Сума:
                                        </span>
                                        <span className="fw-bold" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', fontSize: '1.3rem' }}>
                                            {status.total_amount} грн
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontFamily: 'var(--font-heading)', color: '#b8aafa', fontSize: '1.1rem' }}>
                                            Дата:
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', fontSize: '1.1rem' }}>
                                            {new Date(status.created_at).toLocaleDateString('uk-UA', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {status.tracking_number && (
                                    <a 
                                        href={`https://novaposhta.ua/tracking/?cargo_number=${status.tracking_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-decoration-none"
                                    >
                                        <div className="p-4 rounded mt-3" style={{ 
                                            background: 'linear-gradient(135deg, #6d77fa 0%, #b8aafa 100%)',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(109, 119, 250, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <span style={{ fontFamily: 'var(--font-heading)', color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
                                                    ТТН Нова Пошта:
                                                </span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                                                    <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                                                </svg>
                                            </div>
                                            <div className="fw-bold mb-2" style={{ 
                                                fontFamily: 'var(--font-heading)', 
                                                color: '#ffffff', 
                                                fontSize: '1.5rem', 
                                                letterSpacing: '2px',
                                                wordBreak: 'break-all'
                                            }}>
                                                {status.tracking_number}
                                            </div>
                                            <div className="d-flex align-items-center gap-2" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
                                                </svg>
                                                <span style={{ fontFamily: 'var(--font-heading)' }}>
                                                    Натисніть для відстеження на сайті Нової Пошти
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
