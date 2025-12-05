'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface SuccessPageButtonsProps {
    orderId: string;
}

export default function SuccessPageButtons({ orderId }: SuccessPageButtonsProps) {
    const [monobankLink, setMonobankLink] = useState('https://send.monobank.ua/');

    useEffect(() => {
        const fetchMonobankLink = async () => {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'monobank_payment_link')
                .single();

            if (!error && data?.value) {
                setMonobankLink(data.value);
            }
        };

        fetchMonobankLink();
    }, []);

    return (
        <>
            {/* Payment Button */}
            <div className="d-grid gap-3 mb-4">
                <a
                    href={monobankLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-lg py-3 fw-bold"
                    style={{
                        fontFamily: 'var(--font-body)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        borderRadius: '8px'
                    }}
                >
                    💳 Оплатити через Monobank
                </a>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2 d-sm-flex justify-content-center">
                <Link
                    href={`/profile#order-${orderId}`}
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                    style={{
                        fontFamily: 'var(--font-body)',
                        minHeight: '48px',
                        borderWidth: '2px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        padding: '0.75rem 1.5rem'
                    }}
                >
                    Відстежити замовлення
                </Link>
                <Link
                    href="/"
                    className="btn btn-dark d-flex align-items-center justify-content-center"
                    style={{
                        fontFamily: 'var(--font-body)',
                        minHeight: '48px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        padding: '0.75rem 1.5rem'
                    }}
                >
                    Продовжити покупки
                </Link>
            </div>
        </>
    );
}
