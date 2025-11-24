import Link from 'next/link';

export default async function SuccessPage({ searchParams }: { searchParams: { orderId: string } }) {
    const { orderId } = await searchParams;

    return (
        <div className="container py-5 text-center">
            <div className="card shadow-lg mx-auto" style={{ maxWidth: '650px', backgroundColor: 'var(--card-bg)' }}>
                <div className="card-body py-5 px-4">
                    <div className="mb-4 text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                        </svg>
                    </div>
                    <h2 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: '#e6f1ff' }}>
                        Замовлення успішно оформлено!
                    </h2>
                    <p className="mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
                        Дякуємо за покупку.
                    </p>

                    <div className="alert alert-light border border-secondary mb-4 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <p className="mb-2 fw-bold" style={{ fontFamily: 'var(--font-heading)', color: '#495057', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Номер вашого замовлення:
                        </p>
                        <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', letterSpacing: '3px', color: '#0d6efd' }}>
                            {orderId}
                        </h3>
                    </div>

                    <div className="alert alert-warning border-warning mb-4 p-3">
                        <p className="mb-0" style={{ fontFamily: 'var(--font-heading)', color: '#000', fontSize: '0.95rem' }}>
                            <strong>Важливо!</strong> При оплаті обов'язково вкажіть номер замовлення <strong>{orderId}</strong> в коментарі до платежу.
                        </p>
                    </div>

                    <p className="mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
                        Ви можете використовувати цей номер для відстеження статусу замовлення.
                    </p>

                    <div className="d-grid gap-3 mb-3">
                        <a 
                            href="https://sitechecker.pro/ru/website-safety/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-success btn-lg py-3 fw-bold"
                            style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}
                        >
                            💳 Оплатити через Monobank
                        </a>
                    </div>

                    <div className="d-grid gap-2 d-sm-flex justify-content-center">
                        <Link 
                            href="/track" 
                            className="btn btn-outline-primary"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Відстежити замовлення
                        </Link>
                        <Link 
                            href="/" 
                            className="btn btn-primary"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Продовжити покупки
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
