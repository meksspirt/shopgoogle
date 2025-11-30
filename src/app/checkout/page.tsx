'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import NovaPoshtaWidget from '@/components/NovaPoshtaWidget';

export default function CheckoutPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [minOrderAmount, setMinOrderAmount] = useState(0);
    const [freeDeliveryFrom, setFreeDeliveryFrom] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        novaPoshta: '',
        novaPoshtaId: '',
        fullAddress: '',
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

    useEffect(() => {
        // Fetch settings
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('settings')
                .select('*')
                .in('key', ['min_order_amount', 'free_delivery_from']);

            data?.forEach(setting => {
                if (setting.key === 'min_order_amount') setMinOrderAmount(parseFloat(setting.value) || 0);
                if (setting.key === 'free_delivery_from') setFreeDeliveryFrom(parseFloat(setting.value) || 0);
            });
        };

        fetchSettings();
    }, []);

    // Calculate total with discounts
    const totalWithoutDiscount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalDiscount = cart.reduce((acc, item) => {
        const discount = item.discount_percent || 0;
        return acc + (item.price * item.quantity * discount / 100);
    }, 0);
    const total = totalWithoutDiscount - totalDiscount;

    // Generate a random 6-digit numeric order ID
    const generateOrderId = async (): Promise<string> => {
        let orderId = '';
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            // Generate 6-digit number (100000 to 999999)
            orderId = Math.floor(100000 + Math.random() * 900000).toString();

            // Check if this ID already exists
            const { data, error } = await supabase
                .from('orders')
                .select('id')
                .eq('id', orderId)
                .single();

            if (error && error.code === 'PGRST116') {
                // PGRST116 means no rows found, so ID is unique
                isUnique = true;
            }

            attempts++;
        }

        if (!isUnique) {
            throw new Error('Не вдалося згенерувати унікальний номер замовлення');
        }

        return orderId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get applied promo code from localStorage
            const appliedPromoStr = localStorage.getItem('appliedPromo');
            const appliedPromo = appliedPromoStr ? JSON.parse(appliedPromoStr) : null;

            // Check stock availability before creating order
            for (const item of cart) {
                const { data: product, error: fetchError } = await supabase
                    .from('products')
                    .select('stock_quantity')
                    .eq('id', item.id)
                    .single();

                if (fetchError) {
                    throw new Error(`Помилка перевірки товару: ${item.title}`);
                }

                if (product.stock_quantity !== undefined && item.quantity > product.stock_quantity) {
                    throw new Error(`Товар "${item.title}" недоступний у потрібній кількості. Доступно: ${product.stock_quantity} од., у кошику: ${item.quantity} од.`);
                }
            }

            // Generate unique order ID
            const orderId = await generateOrderId();

            // Get current user if logged in
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || null;

            // Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    id: orderId,
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    customer_address: formData.fullAddress || `${formData.city}, Нова Пошта №${formData.novaPoshta}`,
                    customer_city: formData.city,
                    nova_poshta_branch: formData.novaPoshta,
                    nova_poshta_warehouse_id: formData.novaPoshtaId,
                    instagram_nick: formData.instagram,
                    visited_psychologist: formData.psychologist,
                    total_amount: total,
                    status: 'pending',
                    user_id: userId
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Increment promo code usage counter if promo was applied
            if (appliedPromo && appliedPromo.id) {
                const { error: promoError } = await supabase
                    .from('promo_codes')
                    .update({ 
                        current_uses: (appliedPromo.current_uses || 0) + 1 
                    })
                    .eq('id', appliedPromo.id);

                if (promoError) {
                    console.error('Error updating promo code usage:', promoError);
                }
            }

            // Create Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Update stock quantity for each product
            for (const item of cart) {
                const { data: product, error: fetchError } = await supabase
                    .from('products')
                    .select('stock_quantity')
                    .eq('id', item.id)
                    .single();

                if (fetchError) {
                    console.error('Error fetching product:', fetchError);
                    continue;
                }

                const newStockQuantity = Math.max(0, (product.stock_quantity || 0) - item.quantity);

                const { error: updateError } = await supabase
                    .from('products')
                    .update({ stock_quantity: newStockQuantity })
                    .eq('id', item.id);

                if (updateError) {
                    console.error('Error updating stock:', updateError);
                }
            }

            // Clear Cart and promo code
            localStorage.removeItem('cart');
            localStorage.removeItem('appliedPromo');
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
                    <h4 className="mb-4" style={{ color: '#00075e' }}>Ваше замовлення</h4>
                    <div className="d-flex flex-column gap-3">
                        {cart.map((item) => (
                            <div key={item.id} className="p-3 rounded d-flex align-items-center gap-3" style={{ backgroundColor: 'var(--card-bg)' }}>
                                <div className="position-relative flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="object-fit-cover rounded"
                                    />
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 fw-bold">{item.title}</h6>
                                    <div className="text-muted small">Кількість: {item.quantity}</div>
                                    {item.discount_percent > 0 && (
                                        <span className="badge bg-danger small">-{item.discount_percent}%</span>
                                    )}
                                </div>
                                <div className="text-end">
                                    {item.discount_percent > 0 ? (
                                        <>
                                            <div className="fw-bold text-success">
                                                {Math.round(item.price * (1 - item.discount_percent / 100) * item.quantity)} грн
                                            </div>
                                            <div className="text-muted text-decoration-line-through small">
                                                {Math.round(item.price * item.quantity)} грн
                                            </div>
                                        </>
                                    ) : (
                                        <div className="fw-bold text-primary">{Math.round(item.price * item.quantity)} грн</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-4 rounded" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Сума товарів</span>
                            <span>{Math.round(totalWithoutDiscount)} грн</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-success">Знижка</span>
                                <span className="text-success">-{Math.round(totalDiscount)} грн</span>
                            </div>
                        )}
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Доставка</span>
                            {freeDeliveryFrom > 0 && total >= freeDeliveryFrom ? (
                                <span className="text-success fw-bold">Безкоштовно 🎉</span>
                            ) : (
                                <span>За тарифами перевізника</span>
                            )}
                        </div>
                        {freeDeliveryFrom > 0 && total < freeDeliveryFrom && (
                            <div className="alert alert-info py-2 px-3 mb-2" style={{ fontSize: '0.85rem' }}>
                                Додайте ще {Math.round(freeDeliveryFrom - total)} грн для безкоштовної доставки
                            </div>
                        )}
                        {minOrderAmount > 0 && total < minOrderAmount && (
                            <div className="alert alert-warning py-2 px-3 mb-2" style={{ fontSize: '0.85rem' }}>
                                Мінімальна сума замовлення: {minOrderAmount} грн
                            </div>
                        )}
                        <hr className="border-secondary my-3" />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="h5 mb-0">Всього до сплати</span>
                            <span className="h3 mb-0 text-primary fw-bold">{Math.round(total)} грн</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="col-lg-6 order-lg-2">
                    <h4 className="mb-4" style={{ color: '#00075e' }}>Дані доставки</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ПІБ</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e',
                                        borderRadius: '8px'
                                    }}
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ім'я та Прізвище"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Телефон</label>
                                <input
                                    type="tel"
                                    className="form-control form-control-lg"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e',
                                        borderRadius: '8px'
                                    }}
                                    required
                                    pattern="^\+380\d{9}$"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+380XXXXXXXXX"
                                    title="Введіть номер у форматі +380XXXXXXXXX (12 цифр)"
                                />
                                <small className="text-muted d-block mt-1">Формат: +380XXXXXXXXX</small>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                                <input
                                    type="email"
                                    className="form-control form-control-lg"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e',
                                        borderRadius: '8px'
                                    }}
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Відділення Нової Пошти</label>
                                <NovaPoshtaWidget
                                    onSelect={(data) => {
                                        setFormData({
                                            ...formData,
                                            city: data.city,
                                            novaPoshta: data.warehouse,
                                            novaPoshtaId: data.warehouseId,
                                            fullAddress: data.fullAddress
                                        });
                                    }}
                                    initialCity={formData.city}
                                    initialWarehouse={formData.novaPoshta}
                                />
                                {!formData.city && (
                                    <small className="text-danger d-block mt-2">
                                        * Будь ласка, оберіть відділення Нової Пошти
                                    </small>
                                )}
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instagram</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text" style={{
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        color: '#00075e',
                                        borderRadius: '8px 0 0 8px'
                                    }}>@</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            borderLeft: 'none',
                                            color: '#00075e',
                                            borderRadius: '0 8px 8px 0'
                                        }}
                                        value={formData.instagram}
                                        onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="form-check p-3 rounded" style={{ 
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: formData.psychologist ? '#00075e' : '#ffffff',
                                            borderColor: '#00075e',
                                            borderWidth: '2px',
                                            cursor: 'pointer'
                                        }}
                                        id="psychologistCheck"
                                        checked={formData.psychologist}
                                        onChange={e => setFormData({ ...formData, psychologist: e.target.checked })}
                                    />
                                    <label className="form-check-label ms-2" style={{ color: '#00075e', cursor: 'pointer' }} htmlFor="psychologistCheck">
                                        Чи зверталися ви до психолога? (необов'язково)
                                    </label>
                                </div>
                            </div>

                            <div className="col-12 mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 btn-lg py-3 fw-bold text-uppercase ls-1 shadow-lg"
                                    disabled={loading || !formData.city || (minOrderAmount > 0 && total < minOrderAmount)}
                                >
                                    {loading ? 'Обробка...' : 
                                     !formData.city ? 'Оберіть відділення НП' : 
                                     (minOrderAmount > 0 && total < minOrderAmount) ? `Мінімум ${minOrderAmount} грн` :
                                     `Сплатити ${Math.round(total)} грн`}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
