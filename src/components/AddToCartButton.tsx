'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddToCartButton({ product }: { product: any }) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Check if product is already in cart
    useEffect(() => {
        const checkCart = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find((item: any) => item.id === product.id);
            setIsAdded(!!existingItem);
        };
        
        checkCart();
        window.addEventListener('cartUpdated', checkCart);
        return () => window.removeEventListener('cartUpdated', checkCart);
    }, [product.id]);

    const addToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find((item: any) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Trigger animation
        setIsAnimating(true);
        setIsAdded(true);
        setTimeout(() => setIsAnimating(false), 600);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    return (
        <>
            <style jsx>{`
                @keyframes addToCartPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                @keyframes checkmark {
                    0% { transform: scale(0) rotate(0deg); }
                    50% { transform: scale(1.2) rotate(180deg); }
                    100% { transform: scale(1) rotate(360deg); }
                }
                
                .add-to-cart-btn {
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .add-to-cart-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(109, 119, 250, 0.4);
                }
                
                .add-to-cart-btn:active {
                    transform: translateY(0);
                }
                
                .add-to-cart-btn.animating {
                    animation: addToCartPulse 0.6s ease;
                }
                
                .checkmark-icon {
                    animation: checkmark 0.6s ease;
                }
                
                .quantity-btn {
                    transition: all 0.2s ease;
                    border: 2px solid #6d77fa;
                    color: #6d77fa;
                    background: transparent;
                }
                
                .quantity-btn:hover {
                    background: #6d77fa;
                    color: white;
                    transform: scale(1.1);
                }
                
                .quantity-input {
                    border: 2px solid #6d77fa;
                    background: rgba(109, 119, 250, 0.1);
                    color: #e6f1ff;
                    font-weight: 600;
                }
                
                .quantity-input:focus {
                    border-color: #b8aafa;
                    box-shadow: 0 0 0 0.2rem rgba(109, 119, 250, 0.25);
                    background: rgba(109, 119, 250, 0.15);
                }
            `}</style>

            <div>
                {/* Quantity Selector */}
                <div className="d-flex align-items-center gap-3 mb-3">
                    <button
                        className="btn quantity-btn"
                        onClick={decreaseQuantity}
                        style={{ width: '50px', height: '50px', fontSize: '1.5rem', fontWeight: 'bold' }}
                    >
                        −
                    </button>
                    <input
                        type="number"
                        className="form-control text-center quantity-input"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ width: '80px', height: '50px', fontSize: '1.2rem' }}
                        min="1"
                    />
                    <button
                        className="btn quantity-btn"
                        onClick={increaseQuantity}
                        style={{ width: '50px', height: '50px', fontSize: '1.5rem', fontWeight: 'bold' }}
                    >
                        +
                    </button>
                </div>

                {/* Add to Cart / Go to Cart Button */}
                {!isAdded ? (
                    <button
                        className={`btn w-100 add-to-cart-btn ${isAnimating ? 'animating' : ''}`}
                        onClick={addToCart}
                        style={{
                            height: '60px',
                            borderRadius: '12px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: '700',
                            fontSize: '1.2rem',
                            background: 'linear-gradient(135deg, #6d77fa 0%, #b8aafa 100%)',
                            border: 'none',
                            color: 'white',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-cart-plus me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                            <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9V5.5z"/>
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                        Додати в кошик
                    </button>
                ) : (
                    <Link href="/cart" className="btn w-100 add-to-cart-btn" style={{
                        height: '60px',
                        borderRadius: '12px',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '700',
                        fontSize: '1.2rem',
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        border: 'none',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className={`bi bi-check-circle-fill me-2 ${isAnimating ? 'checkmark-icon' : ''}`} viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                        Перейти в кошик
                    </Link>
                )}
            </div>
        </>
    );
}
