'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function CheckoutPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        novaPoshta: '',
        instagram: '',
        psychologist: false
    });
    const router = useRouter();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (savedCart.length === 0) {
            router.push('/cart');
        }
        setCart(savedCart);
    }, [router]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Generate a random 6-character alphanumeric order ID
    const generateOrderId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate order ID
            const orderId = generateOrderId();

            // Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    id: orderId,
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    customer_city: formData.city,
                    nova_poshta_branch: formData.novaPoshta,
                    instagram_nick: formData.instagram,
                    visited_psychologist: formData.psychologist,
                    total_amount: total,
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Clear Cart
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('cartUpdated'));

            // Redirect
            router.push(`/checkout/success?orderId=${order.id}`);

        } catch (error: any) {
            console.error('Checkout error:', error);
            alert('Помилка оформлення замовлення: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h1 className="mb-5 fw-bold text-center" style={{ fontFamily: 'var(--font-heading)' }}>Оформлення замовлення</h1>

            <div className="row g-5">
                {/* Left Column: Product List */}
                <div className="col-lg-6 order-lg-1">
                    <h4 className="mb-4 text-secondary">Ваше замовлення</h4>
                    <div className="d-flex flex-column gap-3">
                        {cart.map((item) => (
                            <div key={item.id} className="p-3 rounded d-flex align-items-center gap-3" style={{ backgroundColor: 'var(--card-bg)' }}>
                                <div className="position-relative flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                                    <Image
                                        src={item.image_url || 'https://placehold.co/100x100'}
                                        alt={item.title}
                                        fill
                                        className="object-fit-cover rounded"
                                    />
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 fw-bold">{item.title}</h6>
                                    <div className="text-muted small">Кількість: {item.quantity}</div>
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold text-primary">{(item.price * item.quantity).toFixed(2)} грн</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-4 rounded" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Сума товарів</span>
                            <span>{total.toFixed(2)} грн</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Доставка</span>
                            <span>За тарифами перевізника</span>
                        </div>
                        <hr className="border-secondary my-3" />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="h5 mb-0">Всього до сплати</span>
                            <span className="h3 mb-0 text-primary fw-bold">{total.toFixed(2)} грн</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="col-lg-6 order-lg-2">
                    <h4 className="mb-4 text-secondary">Дані доставки</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label small text-muted text-uppercase fw-bold">ПІБ</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ім'я та Прізвище"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Телефон</label>
                                <input
                                    type="tel"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+380..."
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Email</label>
                                <input
                                    type="email"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Місто</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Місто"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Відділення НП</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    value={formData.novaPoshta}
                                    onChange={e => setFormData({ ...formData, novaPoshta: e.target.value })}
                                    placeholder="№ відділення"
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label small text-muted text-uppercase fw-bold">Instagram</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-dark text-secondary border-secondary">@</span>
                                    <input
                                        type="text"
                                        className="form-control bg-dark text-white border-secondary"
                                        value={formData.instagram}
                                        onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="form-check p-3 rounded border border-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input bg-dark border-secondary"
                                        id="psychologistCheck"
                                        checked={formData.psychologist}
                                        onChange={e => setFormData({ ...formData, psychologist: e.target.checked })}
                                    />
                                    <label className="form-check-label text-secondary" htmlFor="psychologistCheck">
                                        Чи зверталися ви до психолога? (необов'язково)
                                    </label>
                                </div>
                            </div>

                            <div className="col-12 mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 btn-lg py-3 fw-bold text-uppercase ls-1 shadow-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Обробка...' : `Сплатити ${total.toFixed(2)} грн`}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
