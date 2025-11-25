import Link from 'next/link';

export default async function SuccessPage({ searchParams }: { searchParams: { orderId: string } }) {
    const { orderId } = await searchParams;

    return (
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

                    {/* Payment Button */}
                    <div className="d-grid gap-3 mb-4">
                        <a 
                            href="https://sitechecker.pro/ru/website-safety/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-lg py-3 fw-bold"
                            style={{ 
                                fontFamily: 'var(--font-body)', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1px',
                                backgroundColor: '#28a745',
                                borderColor: '#28a745',
                                color: '#ffffff',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#218838';
                                e.currentTarget.style.borderColor = '#1e7e34';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#28a745';
                                e.currentTarget.style.borderColor = '#28a745';
                            }}
                        >
                            💳 Оплатити через Monobank
                        </a>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2 d-sm-flex justify-content-center">
                        <Link 
                            href={`/track?orderId=${orderId}`}
                            className="btn d-flex align-items-center justify-content-center"
                            style={{ 
                                fontFamily: 'var(--font-body)', 
                                minHeight: '48px',
                                backgroundColor: '#ffffff',
                                border: '2px solid #00075e',
                                color: '#00075e',
                                borderRadius: '8px',
                                fontWeight: 600,
                                padding: '0.75rem 1.5rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#00075e';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.color = '#00075e';
                            }}
                        >
                            Відстежити замовлення
                        </Link>
                        <Link 
                            href="/" 
                            className="btn d-flex align-items-center justify-content-center"
                            style={{ 
                                fontFamily: 'var(--font-body)', 
                                minHeight: '48px',
                                backgroundColor: '#343434',
                                border: '2px solid #343434',
                                color: '#ffffff',
                                borderRadius: '8px',
                                fontWeight: 600,
                                padding: '0.75rem 1.5rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1a1a1a';
                                e.currentTarget.style.borderColor = '#1a1a1a';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#343434';
                                e.currentTarget.style.borderColor = '#343434';
                            }}
                        >
                            Продовжити покупки
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
