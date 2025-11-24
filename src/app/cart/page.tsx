'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    useEffect(() => {
        setMounted(true);
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
        // Select all by default
        setSelectedItems(savedCart.map((item: any) => item.id));
    }, []);

    const updateQuantity = (id: number, delta: number) => {
        const newCart = cart.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
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

    const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));
    const total = selectedCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

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
            
            <div className="row g-4">
                {/* Left Column: Cart Items */}
                <div className="col-lg-8">
                    {/* Header Actions */}
                    <div className="d-flex align-items-center mb-3 pb-3 border-bottom border-secondary">
                        <div className="form-check me-4">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="selectAll"
                                checked={selectedItems.length === cart.length && cart.length > 0}
                                onChange={toggleSelectAll}
                                style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label text-white ms-2" htmlFor="selectAll" style={{ cursor: 'pointer' }}>
                                Вибрати все
                            </label>
                        </div>
                        <button className="btn btn-link text-danger text-decoration-none p-0" onClick={() => setSelectedItems([])}>
                            Видалити вибрані
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="d-flex flex-column gap-3">
                        {cart.map((item) => (
                            <div key={item.id} className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
                                <div className="card-body">
                                    <div className="row align-items-start">
                                        {/* Checkbox & Image */}
                                        <div className="col-auto d-flex align-items-center">
                                            <input 
                                                className="form-check-input me-3" 
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <div className="position-relative rounded overflow-hidden bg-white" style={{ height: '120px', width: '120px' }}>
                                                <Image
                                                    src={item.image_url || 'https://placehold.co/120x120'}
                                                    alt={item.title}
                                                    fill
                                                    className="object-fit-contain p-2"
                                                />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="col">
                                            <h5 className="mb-2 text-white" style={{ fontSize: '1.1rem' }}>{item.title}</h5>
                                            <div className="text-muted small mb-3">
                                                {/* Placeholders for attributes */}
                                                <span className="me-3">Колір: стандартний</span>
                                                <span>Вага: 1 кг</span>
                                            </div>
                                            <div className="d-flex gap-3">
                                                <button className="btn btn-link p-0 text-decoration-none text-muted small">В обране</button>
                                                <button className="btn btn-link p-0 text-decoration-none text-danger small" onClick={() => removeItem(item.id)}>Видалити</button>
                                            </div>
                                        </div>

                                        {/* Price & Quantity */}
                                        <div className="col-auto text-end d-flex flex-column align-items-end justify-content-between" style={{ minHeight: '120px' }}>
                                            <div className="mb-3">
                                                <h4 className="mb-0 text-white fw-bold">{item.price} ₴</h4>
                                                {/* Fake old price for visual fidelity */}
                                                <div className="text-muted text-decoration-line-through small">{(item.price * 1.2).toFixed(0)} ₴</div>
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
                            <Link href="/checkout" className="btn btn-success w-100 btn-lg mb-4 fw-bold py-3" style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }}>
                                Перейти до оформлення
                            </Link>
                            
                            <p className="text-muted small mb-4">
                                Доступні способи і час доставки можна вибрати при оформленні замовлення
                            </p>

                            <h5 className="card-title text-white mb-4">Ваша корзина</h5>
                            
                            <div className="d-flex justify-content-between mb-2 text-white">
                                <span>Товари ({totalItems})</span>
                                <span>{total.toFixed(0)} ₴</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4 text-danger">
                                <span>Знижка</span>
                                <span>- 0 ₴</span>
                            </div>

                            <hr className="border-secondary" />

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="h5 mb-0 text-white">Загальна вартість</span>
                                <span className="h4 mb-0 text-white fw-bold">{total.toFixed(0)} ₴</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
