'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Toast from './Toast';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    image_url: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const [showToast, setShowToast] = useState(false);

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find((item: any) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        setShowToast(true);
    };

    return (
        <>
            <Link href={`/product/${product.id}`} className="text-decoration-none">
                <div className="card h-100 shadow-sm hover-effect border-0" style={{ backgroundColor: '#fff' }}>
                    <div className="position-relative" style={{ height: '350px', overflow: 'hidden' }}>
                        <Image
                            src={product.image_url || 'https://placehold.co/400x600'}
                            alt={product.title}
                            fill
                            className="object-fit-cover"
                            style={{ transition: 'transform 0.3s ease' }}
                        />
                    </div>
                    <div className="card-body d-flex flex-column p-3" style={{ backgroundColor: '#fff' }}>
                        <h5 className="card-title mb-2 text-dark" style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                        }}>
                            {product.title}
                        </h5>
                        <p className="card-text text-muted small mb-3 flex-grow-1" style={{
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {product.description}
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                            <span className="fw-bold" style={{ fontSize: '1.25rem', color: '#000' }}>
                                {product.price} грн
                            </span>
                            <button
                                className="btn btn-dark btn-sm px-3"
                                onClick={addToCart}
                                style={{
                                    borderRadius: '20px',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: '500'
                                }}
                            >
                                Купити
                            </button>
                        </div>
                    </div>
                </div>
            </Link>

            <Toast
                message="Додано в кошик!"
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </>
    );
}
