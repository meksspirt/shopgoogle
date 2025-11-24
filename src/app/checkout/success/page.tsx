import Link from 'next/link';

export default async function SuccessPage({ searchParams }: { searchParams: { orderId: string } }) {
    const { orderId } = await searchParams;

    return (
        <div className="container py-5 text-center">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
                <div className="card-body py-5">
                    <div className="mb-4 text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                        </svg>
                    </div>
                    <h2 className="card-title fw-bold mb-3">Замовлення успішно оформлено!</h2>
                    <p className="lead text-muted mb-4">Дякуємо за покупку.</p>

                    <div className="alert alert-light border mb-4">
                        <p className="mb-1 text-muted small">Номер вашого замовлення:</p>
                        <h4 className="fw-bold text-primary m-0">{orderId}</h4>
                    </div>

                    <p className="mb-4">Ви можете використовувати цей номер для відстеження статусу замовлення.</p>

                    <div className="d-grid gap-2 d-sm-flex justify-content-center">
                        <Link href="/track" className="btn btn-outline-primary">Відстежити замовлення</Link>
                        <Link href="/" className="btn btn-primary">Продовжити покупки</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
