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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
