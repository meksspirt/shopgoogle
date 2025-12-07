'use client';

import { useEffect } from 'react';

interface Product {
    id: number;
    title: string;
    price: number;
    discount_percent?: number;
}

export default function FacebookPixelViewContent({ product }: { product: Product }) {
    useEffect(() => {
        // Facebook Pixel - ViewContent event
        if (typeof window !== 'undefined' && (window as any).fbq) {
            const finalPrice = product.discount_percent 
                ? Math.round(product.price * (1 - product.discount_percent / 100))
                : product.price;
            
            (window as any).fbq('track', 'ViewContent', {
                content_name: product.title,
                content_ids: [product.id],
                content_type: 'product',
                value: finalPrice,
                currency: 'UAH'
            });
        }
    }, [product]);

    return null;
}
