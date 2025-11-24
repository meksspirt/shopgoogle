'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function CartPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<any>(null);
    const [promoError, setPromoError] = useState('');

    useEffect(() => {
        setMounted(true);
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        // Validate and correct quantities based on stock
        const correctedCart = savedCart.map((item: any) => {
            if (item.stock_quantity !== undefined && item.quantity > item.stock_quantity) {
                return { ...item, quantity: Math.max(1, item.stock_quantity) };
            }
            return item;
        });
        
        // Update cart if corrections were made
        if (JSON.stringify(correctedCart) !== JSON.stringify(savedCart)) {
            localStorage.setItem('cart', JSON.stringify(correctedCart));
            setCart(correctedCart);
        } else {
            setCart(savedCart);
        }
        
        // Select all by default
        setSelectedItems(correctedCart.map((item: any) => item.id));

        // Fetch recommended products
        const fetchRecommended = async () => {
            const { data } = await supabase
                .from('products')
                .select('*')
                .limit(10); // Fetch more to allow filtering
            if (data) {
                setRecommended(data);
            }
        };
        fetchRecommended();
    }, []);

    const updateQuantity = (id: number, delta: number) => {
        const newCart = cart.map(item => {
            if (item.id === id) {
                const maxQuantity = item.stock_quantity || 999;
                const newQuantity = item.quantity + delta;
                
                if (newQuantity > maxQuantity) {
                    alert(`На складі доступно лише ${maxQuantity} од. товару`);
                    return item;
                }
                
                return { ...item, quantity: Math.max(1, Math.min(newQuantity, maxQuantity)) };
            }
            return item;
        });
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeItem = (id: number) => {
        const newCart = cart.filter(item => item.id !== id);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
        setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    };

    const addToCart = (product: any) => {
        const newCart = [...cart, { ...product, quantity: 1 }];
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
        // Automatically select the new item
        setSelectedItems(prev => [...prev, product.id]);
    };

    const toggleSelect = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(i => i !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.map(item => item.id));
        }
    };

    // All items are always selected now
    const selectedCartItems = cart;
    
    // Calculate totals with discount
    const totalWithoutDiscount = selectedCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalDiscount = selectedCartItems.reduce((acc, item) => {
        const discount = item.discount_percent || 0;
        return acc + (item.price * item.quantity * discount / 100);
    }, 0);
    const subtotal = totalWithoutDiscount - totalDiscount;
    
    // Calculate promo code discount
    let promoDiscount = 0;
    if (appliedPromo) {
        if (appliedPromo.discount_percent) {
            promoDiscount = subtotal * (appliedPromo.discount_percent / 100);
        } else if (appliedPromo.discount_amount) {
            promoDiscount = Math.min(appliedPromo.discount_amount, subtotal);
        }
    }
    
    const total = subtotal - promoDiscount;
    const totalItems = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Check if any item exceeds stock quantity
    const hasStockIssues = selectedCartItems.some(item => 
        item.stock_quantity !== undefined && item.quantity > item.stock_quantity
    );

    const handleCheckout = (e: React.MouseEvent) => {
        if (hasStockIssues) {
            e.preventDefault();
            alert('Деякі товари в кошику перевищують доступну кількість на складі. Будь ласка, зменшіть кількість перед оформленням замовлення.');
        } else if (appliedPromo) {
            // Save promo code to localStorage for checkout page
            localStorage.setItem('appliedPromo', JSON.stringify(appliedPromo));
        }
    };

    const applyPromoCode = async () => {
        setPromoError('');
        
        if (!promoCode.trim()) {
            setPromoError('Введіть промокод');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', promoCode.toUpperCase())
                .single();

            if (error || !data) {
                setPromoError('Промокод не знайдено');
                return;
            }

            // Check if promo code is active
            if (!data.is_active) {
                setPromoError('Промокод неактивний');
                return;
            }

            // Check if promo code has expired
            if (data.valid_until && new Date(data.valid_until) < new Date()) {
                setPromoError('Промокод прострочений');
                return;
            }

            // Check if promo code has reached max uses
            if (data.max_uses && data.current_uses >= data.max_uses) {
                setPromoError('Промокод вичерпано');
                return;
            }

            // Check minimum order amount
            if (data.min_order_amount && totalWithoutDiscount < data.min_order_amount) {
                setPromoError(`Мінімальна сума замовлення: ${data.min_order_amount} грн`);
                return;
            }

            setAppliedPromo(data);
            setPromoError('');
        } catch (error) {
            console.error('Error applying promo code:', error);
            setPromoError('Помилка застосування промокоду');
        }
    };

    const removePromoCode = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
        localStorage.removeItem('appliedPromo');
    };

    // Filter recommended products: exclude items already in cart
    const filteredRecommended = recommended
        .filter(item => !cart.some(cartItem => cartItem.id === item.id))
        .slice(0, 4);

    if (!mounted) return <div className="container py-5 text-white">Завантаження...</div>;

    if (cart.length === 0) {
        return (
            <div className="container py-5 text-center">
                <h2 className="text-white mb-4">Ваш кошик порожній</h2>
                <Link href="/" className="btn btn-primary btn-lg">Почати покупки</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-white">Кошик <sup className="text-muted fs-6">{cart.length}</sup></h1>

            <div className="row g-4 mb-5">
                {/* Left Column: Cart Items */}
                <div className="col-lg-8">


                    {/* Items List */}
                    <div className="d-flex flex-column gap-3">
                        {cart.map((item) => (
                            <div key={item.id} className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
                                <div className="card-body">
                                    <div className="row align-items-start">
                                        {/* Image */}
                                        <div className="col-auto">
                                            <Link href={`/product/${item.id}`} className="text-decoration-none">
                                                <div className="position-relative rounded overflow-hidden bg-white" style={{ height: '120px', width: '120px', cursor: 'pointer' }}>
                                                    <Image
                                                        src={item.image_url}
                                                        alt={item.title}
                                                        fill
                                                        className="object-fit-contain p-2"
                                                    />
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Info */}
                                        <div className="col">
                                            <Link href={`/product/${item.id}`} className="text-decoration-none">
                                                <h5 className="mb-2 text-white" style={{ fontSize: '1.1rem', cursor: 'pointer' }}>
                                                    {item.title}
                                                </h5>
                                            </Link>
                                            <div className="text-muted small mb-2">
                                                <span className="me-3">Колір: стандартний</span>
                                                <span>Вага: 1 кг</span>
                                            </div>
                                            {item.stock_quantity !== undefined && (
                                                <div className="mb-2">
                                                    <small style={{ 
                                                        color: item.quantity > item.stock_quantity ? '#dc3545' : 
                                                               item.stock_quantity > 10 ? '#28a745' : '#ffc107',
                                                        fontWeight: '600'
                                                    }}>
                                                        {item.quantity > item.stock_quantity ? 
                                                            `⚠ Перевищено ліміт! Доступно: ${item.stock_quantity} од.` :
                                                         item.stock_quantity > 10 ? 
                                                            `✓ В наявності` :
                                                            `⚠ Залишилось ${item.stock_quantity} од.`
                                                        }
                                                    </small>
                                                </div>
                                            )}
                                            <div className="d-flex gap-3">
                                                <button className="btn btn-link p-0 text-decoration-none text-danger small" onClick={() => removeItem(item.id)}>Видалити</button>
                                            </div>
                                        </div>

                                        {/* Price & Quantity */}
                                        <div className="col-auto text-end d-flex flex-column align-items-end justify-content-between" style={{ minHeight: '120px' }}>
                                            <div className="mb-3">
                                                {item.discount_percent > 0 ? (
                                                    <>
                                                        <h4 className="mb-0 text-success fw-bold">
                                                            {Math.round(item.price * (1 - item.discount_percent / 100))} ₴
                                                        </h4>
                                                        <div className="text-muted text-decoration-line-through small">{Math.round(item.price)} ₴</div>
                                                        <div className="badge bg-danger small">-{item.discount_percent}%</div>
                                                    </>
                                                ) : (
                                                    <h4 className="mb-0 text-white fw-bold">{Math.round(item.price)} ₴</h4>
                                                )}
                                            </div>

                                            <div className="input-group input-group-sm" style={{ width: '100px' }}>
                                                <button className="btn btn-outline-secondary" onClick={() => updateQuantity(item.id, -1)}>-</button>
                                                <span className="form-control text-center bg-transparent text-white border-secondary">{item.quantity}</span>
                                                <button className="btn btn-outline-secondary" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px', backgroundColor: 'var(--card-bg)' }}>
                        <div className="card-body p-4">
                            <Link 
                                href="/checkout" 
                                className={`btn w-100 btn-lg mb-4 fw-bold py-3 ${hasStockIssues ? 'btn-secondary' : 'btn-success'}`}
                                style={{ 
                                    backgroundColor: hasStockIssues ? '#6c757d' : 'var(--secondary-color)', 
                                    borderColor: hasStockIssues ? '#6c757d' : 'var(--secondary-color)',
                                    opacity: hasStockIssues ? 0.6 : 1,
                                    cursor: hasStockIssues ? 'not-allowed' : 'pointer'
                                }}
                                onClick={handleCheckout}
                            >
                                {hasStockIssues ? '⚠ Перевірте кількість товарів' : 'Перейти до оформлення'}
                            </Link>

                            <p className="text-muted small mb-4">
                                Доступні способи і час доставки можна вибрати при оформленні замовлення
                            </p>

                            <h5 className="card-title text-white mb-4">Ваша корзина</h5>

                            {/* Promo Code Input */}
                            {!appliedPromo ? (
                                <div className="mb-4">
                                    <label className="form-label text-white small">Промокод</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control bg-dark text-white border-secondary"
                                            placeholder="Введіть промокод"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        />
                                        <button
                                            className="btn btn-outline-success"
                                            onClick={applyPromoCode}
                                        >
                                            Застосувати
                                        </button>
                                    </div>
                                    {promoError && <small className="text-danger">{promoError}</small>}
                                </div>
                            ) : (
                                <div className="alert alert-success mb-4 d-flex justify-content-between align-items-center">
                                    <span>✓ Промокод: <strong>{appliedPromo.code}</strong></span>
                                    <button className="btn btn-sm btn-outline-danger" onClick={removePromoCode}>✕</button>
                                </div>
                            )}

                            <div className="d-flex justify-content-between mb-2 text-white">
                                <span>Товари ({totalItems})</span>
                                <span>{Math.round(totalWithoutDiscount)} ₴</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="d-flex justify-content-between mb-2 text-success">
                                    <span>Знижка на товари</span>
                                    <span>- {Math.round(totalDiscount)} ₴</span>
                                </div>
                            )}
                            {promoDiscount > 0 && (
                                <div className="d-flex justify-content-between mb-2 text-warning">
                                    <span>Промокод ({appliedPromo.code})</span>
                                    <span>- {Math.round(promoDiscount)} ₴</span>
                                </div>
                            )}

                            <hr className="border-secondary" />

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="h5 mb-0 text-white">Загальна вартість</span>
                                <span className="h4 mb-0 text-white fw-bold">{Math.round(total)} ₴</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Products Section */}
            {filteredRecommended.length > 0 && (
                <div className="mt-5">
                    <h3 className="mb-4 text-white">Рекомендовано для вас</h3>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                        {filteredRecommended.map((product) => (
                            <div className="col" key={product.id}>
                                <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
                                    <div className="position-relative bg-white rounded-top overflow-hidden" style={{ height: '200px' }}>
                                        <Image
                                            src={product.image_url}
                                            alt={product.title}
                                            fill
                                            className="object-fit-contain p-3"
                                        />
                                    </div>
                                    <div className="card-body d-flex flex-column">
                                        <h6 className="card-title text-white mb-2 text-truncate" title={product.title}>{product.title}</h6>
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <span className="d-block text-white fw-bold fs-5">{product.price} ₴</span>
                                                    <span className="text-muted text-decoration-line-through small">{(product.price * 1.2).toFixed(0)} ₴</span>
                                                </div>
                                                <button
                                                    className="btn btn-success btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                                    style={{ width: '40px', height: '40px', backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }}
                                                    onClick={() => addToCart(product)}
                                                    title="Додати в кошик"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-cart-plus" viewBox="0 0 16 16">
                                                        <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9V5.5z" />
                                                        <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
