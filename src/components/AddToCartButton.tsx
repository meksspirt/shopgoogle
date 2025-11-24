'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

export default function AddToCartButton({ product }: { product: any }) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);

    const addToCart = (redirect = false) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find((item: any) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));

        if (redirect) {
            router.push('/cart');
        } else {
            setShowToast(true);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    return (
        <>
            <div>
                {/* Quantity Selector */}
                <div className="d-flex align-items-center gap-3 mb-3">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={decreaseQuantity}
                        style={{ width: '40px', height: '40px' }}
                    >
                        −
                    </button>
                    <input
                        type="number"
                        className="form-control text-center"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ width: '70px', height: '40px' }}
                        min="1"
                    />
                    <button
                        className="btn btn-outline-secondary"
                        onClick={increaseQuantity}
                        style={{ width: '40px', height: '40px' }}
                    >
                        +
                    </button>
                    <button
                        className="btn btn-dark px-5"
                        onClick={() => addToCart(false)}
                        style={{
                            height: '40px',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: '500'
                        }}
                    >
                        Додати в кошик
                    </button>
                </div>
            </div>

            <Toast
                message="Додано в кошик!"
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </>
    );
}
