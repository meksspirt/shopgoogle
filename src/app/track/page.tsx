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
                                        placeholder="напр. 123e4567-e89b-..."
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
                        <div className="card shadow border-0" style={{ backgroundColor: 'var(--card-bg)' }}>
                            <div className="card-header border-bottom border-secondary py-3" style={{ backgroundColor: 'var(--secondary-color)' }}>
                                <h5 className="mb-0 text-white">Статус замовлення</h5>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title text-white mb-3">Замовлення #{status.id}</h5>
                                <p className="card-text text-white">
                                    <strong className="text-muted">Статус:</strong> <span className={`badge ms-2 ${status.status === 'pending' ? 'bg-warning' :
                                        status.status === 'shipped' ? 'bg-info' :
                                            status.status === 'delivered' ? 'bg-success' : 'bg-secondary'
                                        }`}>
                                        {status.status === 'pending' ? 'Очікується' :
                                            status.status === 'shipped' ? 'Відправлено' :
                                                status.status === 'delivered' ? 'Доставлено' :
                                                    status.status === 'cancelled' ? 'Скасовано' : status.status}
                                    </span>
                                </p>
                                <p className="card-text text-white">
                                    <strong className="text-muted">Сума:</strong> {status.total_amount} грн
                                </p>
                                <p className="card-text text-white">
                                    <strong className="text-muted">Дата:</strong> {new Date(status.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
