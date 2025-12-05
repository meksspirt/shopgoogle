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
    availability?: string;
    discount_percent?: number;
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
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-fit-cover"
                            style={{ transition: 'transform 0.3s ease' }}
                        />
                        {product.availability === 'pre_order' && (
                            <div className="position-absolute top-0 end-0 m-2">
                                <span className="badge bg-warning text-dark px-3 py-2" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                                    Предзаказ
                                </span>
                            </div>
                        )}
                        {product.discount_percent && product.discount_percent > 0 && (
                            <div className="position-absolute top-0 start-0 m-2">
                                <span className="badge bg-danger px-3 py-2" style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                                    -{product.discount_percent}%
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="card-body d-flex flex-column p-3" style={{ backgroundColor: '#fff' }}>
                        <h5 className="card-title mb-2" style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: '#00075e'
                        }}>
                            {product.title}
                        </h5>
                        <div className="card-text small mb-3 flex-grow-1" style={{
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            color: '#374151'
                        }} dangerouslySetInnerHTML={{ __html: product.description }} />
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                            <div>
                                {product.discount_percent && product.discount_percent > 0 ? (
                                    <>
                                        <div className="text-decoration-line-through small" style={{ color: '#9ca3af' }}>
                                            {product.price} грн
                                        </div>
                                        <span className="fw-bold" style={{ fontSize: '1.35rem', color: 'var(--primary-color)' }}>
                                            {Math.round(product.price * (1 - product.discount_percent / 100))} грн
                                        </span>
                                    </>
                                ) : (
                                    <span className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                                        {product.price} грн
                                    </span>
                                )}
                            </div>
                            <button
                                className="btn btn-primary btn-sm px-3"
                                onClick={addToCart}
                                style={{
                                    borderRadius: '4px',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: '600'
                                }}
                            >
                                {product.availability === 'pre_order' ? 'Предзаказ' : 'Купити'}
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
