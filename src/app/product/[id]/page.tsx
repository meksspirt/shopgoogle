import { supabase } from '@/lib/supabaseClient';
import ProductGallery from '@/components/ProductGallery';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

export const revalidate = 0;

export default async function ProductPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        return (
            <div className="container py-5 text-center">
                <h2 className="text-danger">Товар не знайдено</h2>
                <Link href="/" className="btn btn-primary mt-3">Назад до каталогу</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link href="/">Головна</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{product.title}</li>
                </ol>
            </nav>

            <div className="row g-5">
                {/* Left Column: Gallery */}
                <div className="col-md-6">
                    <div className="sticky-top" style={{ top: '120px' }}>
                        <ProductGallery images={product.images || [product.image_url]} />
                        
                        {/* Sticky button under gallery - shown when main button scrolls out */}
                        <div id="sticky-cart-button" className="mt-4 d-none">
                            <AddToCartButton product={product} />
                        </div>
                    </div>
                    
                    {/* Description - shown below gallery on mobile/tablet */}
                    <div className="mt-5 d-md-none">
                        <h5 className="fw-bold mb-3">Опис</h5>
                        <p className="text-muted" style={{ lineHeight: '1.7' }}>
                            {product.description}
                        </p>
                    </div>
                </div>

                {/* Right Column: Product Info */}
                <div className="col-md-6">
                    {product.availability === 'pre_order' && (
                        <div className="mb-3">
                            <span className="badge bg-warning text-dark px-4 py-2" style={{ fontSize: '1rem', fontWeight: '600' }}>
                                Предзаказ
                            </span>
                        </div>
                    )}
                    <h1 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600' }}>
                        {product.title}
                    </h1>

                    <div className="mb-4">
                        {product.discount_percent > 0 ? (
                            <div className="d-flex align-items-center gap-3">
                                <h2 className="mb-0" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                                    {Math.round(product.price * (1 - product.discount_percent / 100))} грн
                                </h2>
                                <div className="d-flex flex-column">
                                    <span className="text-decoration-line-through text-muted" style={{ fontSize: '1.2rem' }}>
                                        {Math.round(product.price)} грн
                                    </span>
                                    <span className="badge bg-danger" style={{ fontSize: '0.9rem', width: 'fit-content' }}>
                                        -{product.discount_percent}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <h2 className="mb-0" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                {Math.round(product.price)} грн
                            </h2>
                        )}
                    </div>

                    <div className="alert alert-info d-flex align-items-center mb-4" role="alert" style={{ backgroundColor: 'rgba(56, 74, 158, 0.2)', borderColor: 'var(--primary-color)', color: '#e6f1ff' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-patch-check-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                            <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.896-.011a2.89 2.89 0 0 0-2.924 2.924l.01.896-.636.622a2.89 2.89 0 0 0 0 4.134l.638.622-.011.896a2.89 2.89 0 0 0 2.924 2.924l.896-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.638.896.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.896.636-.622a2.89 2.89 0 0 0 0-4.134l-.638-.622.011-.896a2.89 2.89 0 0 0-2.924-2.924l-.896.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
                        </svg>
                        <div>
                            Товар розроблений професійним психологом.
                        </div>
                    </div>

                    {product.stock_quantity !== undefined && (
                        <div className="mb-3">
                            <small style={{ color: product.stock_quantity > 10 ? '#28a745' : product.stock_quantity > 0 ? '#ffc107' : '#dc3545', fontFamily: 'var(--font-heading)', fontWeight: '600' }}>
                                {product.stock_quantity > 10 ? `✓ В наявності (${product.stock_quantity} од.)` :
                                 product.stock_quantity > 0 ? `⚠ Залишилось ${product.stock_quantity} од.` :
                                 '✗ Немає в наявності'}
                            </small>
                        </div>
                    )}

                    {/* Main cart button */}
                    <div id="main-cart-button" className="mb-4">
                        <AddToCartButton product={product} />
                    </div>

                    <hr className="my-4" />

                    {/* Description - shown in right column on desktop */}
                    <div className="mt-4 d-none d-md-block">
                        <h5 className="fw-bold mb-3">Опис</h5>
                        <p className="text-muted" style={{ lineHeight: '1.7' }}>
                            {product.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Script for sticky button behavior */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    if (typeof window !== 'undefined') {
                        const mainButton = document.getElementById('main-cart-button');
                        const stickyButton = document.getElementById('sticky-cart-button');
                        
                        if (mainButton && stickyButton) {
                            const observer = new IntersectionObserver(
                                ([entry]) => {
                                    if (entry.isIntersecting) {
                                        stickyButton.classList.add('d-none');
                                        stickyButton.classList.remove('d-block');
                                    } else {
                                        stickyButton.classList.remove('d-none');
                                        stickyButton.classList.add('d-block');
                                    }
                                },
                                { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
                            );
                            
                            observer.observe(mainButton);
                        }
                    }
                `
            }} />
        </div>
    );
}
