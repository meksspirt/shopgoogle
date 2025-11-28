import { supabase } from '@/lib/supabaseClient';
import Script from 'next/script';
import SuccessPageButtons from '@/components/SuccessPageButtons';

export default async function SuccessPage({ searchParams }: { searchParams: { orderId: string } }) {
    const { orderId } = await searchParams;

    // Fetch order data for enhanced conversion tracking
    let orderData = null;
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('customer_email, customer_phone, customer_name, customer_city')
            .eq('id', orderId)
            .single();
        
        if (!error && data) {
            orderData = data;
        }
    } catch (error) {
        console.error('Error fetching order data:', error);
    }

    // Parse name into first and last name
    const nameParts = orderData?.customer_name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Format phone to E.164 format (+380XXXXXXXXX)
    const formatPhoneToE164 = (phone: string): string => {
        if (!phone) return '';
        
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');
        
        // If starts with 380, add +
        if (digits.startsWith('380')) {
            return '+' + digits;
        }
        
        // If starts with 0, replace with +380
        if (digits.startsWith('0')) {
            return '+380' + digits.slice(1);
        }
        
        // If starts with 80, replace with +3
        if (digits.startsWith('80')) {
            return '+3' + digits;
        }
        
        // If just 9 digits, assume it's without country code
        if (digits.length === 9) {
            return '+380' + digits;
        }
        
        // Otherwise return with + if not empty
        return digits ? '+' + digits : '';
    };

    const formattedPhone = formatPhoneToE164(orderData?.customer_phone || '');

    return (
        <>
            {/* Enhanced Conversion Tracking Script */}
            {orderData && (
                <Script
                    id="gtag-enhanced-conversion"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            gtag('set', 'user_data', {
                                "email": ${JSON.stringify(orderData.customer_email || '')},
                                "phone_number": ${JSON.stringify(formattedPhone)},
                                "address": {
                                    "first_name": ${JSON.stringify(firstName)},
                                    "last_name": ${JSON.stringify(lastName)},
                                    "city": ${JSON.stringify(orderData.customer_city || '')}
                                }
                            });
                        `,
                    }}
                />
            )}

            <div className="container py-5">
            <div className="card shadow-sm mx-auto" style={{ 
                maxWidth: '650px', 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
            }}>
                <div className="card-body py-5 px-4 px-md-5">
                    {/* Success Icon */}
                    <div className="mb-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#28a745" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="fw-bold mb-3 text-center" style={{ 
                        fontFamily: 'var(--font-heading)', 
                        color: '#00075e',
                        fontSize: '1.75rem'
                    }}>
                        Замовлення успішно оформлено!
                    </h2>
                    
                    <p className="mb-4 text-center" style={{ 
                        fontFamily: 'var(--font-body)', 
                        color: '#6b7280',
                        fontSize: '1rem'
                    }}>
                        Дякуємо за покупку.
                    </p>

                    {/* Order Number */}
                    <div className="mb-4 p-4 text-center" style={{ 
                        backgroundColor: '#f9fafb',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px'
                    }}>
                        <p className="mb-2 fw-bold" style={{ 
                            fontFamily: 'var(--font-body)', 
                            color: '#6b7280', 
                            fontSize: '0.875rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: '1px' 
                        }}>
                            Номер вашого замовлення:
                        </p>
                        <h3 className="fw-bold m-0" style={{ 
                            fontFamily: 'var(--font-heading)', 
                            fontSize: '2.5rem', 
                            letterSpacing: '3px', 
                            color: '#00075e'
                        }}>
                            {orderId}
                        </h3>
                    </div>

                    {/* Warning Alert */}
                    <div className="mb-4 p-3" style={{ 
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '8px'
                    }}>
                        <p className="mb-0 text-center" style={{ 
                            fontFamily: 'var(--font-body)', 
                            color: '#92400e', 
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            <strong>Важливо!</strong> При оплаті обов'язково вкажіть номер замовлення <strong>{orderId}</strong> в коментарі до платежу.
                        </p>
                    </div>

                    <p className="mb-4 text-center" style={{ 
                        fontFamily: 'var(--font-body)', 
                        color: '#6b7280',
                        fontSize: '0.95rem'
                    }}>
                        Ви можете використовувати цей номер для відстеження статусу замовлення.
                    </p>

                    <SuccessPageButtons orderId={orderId} />
                </div>
            </div>
        </div>
        </>
    );
}
