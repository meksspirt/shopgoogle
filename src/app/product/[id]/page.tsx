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
                    <li className="breadcrumb-item"><Link href="/" style={{ color: 'var(--accent-color)' }}>Головна</Link></li>
                    <li className="breadcrumb-item active" aria-current="page" style={{ color: 'var(--text-secondary)' }}>{product.title}</li>
                </ol>
            </nav>

            <div className="row g-4">
                {/* Left Column: Gallery */}
                <div className="col-lg-5 col-md-6">
                    <div className="sticky-top" style={{ top: '100px' }}>
                        <ProductGallery images={product.images || [product.image_url]} />
                        
                        {/* Sticky button under gallery - shown when main button scrolls out */}
                        <div id="sticky-cart-button" className="mt-3 d-none">
                            <AddToCartButton product={product} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Product Info */}
                <div className="col-lg-7 col-md-6">
                    {/* Author */}
                    {product.author && (
                        <div className="mb-2">
                            <small style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                                Автор: <Link href="#" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>{product.author}</Link>
                            </small>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="mb-3" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', color: '#e6f1ff' }}>
                        {product.title}
                    </h1>

                    {/* Badges */}
                    <div className="d-flex gap-2 mb-3">
                        {product.availability === 'pre_order' && (
                            <span className="badge bg-warning text-dark px-3 py-1" style={{ fontSize: '0.85rem' }}>
                                Предзаказ
                            </span>
                        )}
                        {product.discount_percent > 0 && (
                            <span className="badge bg-danger px-3 py-1" style={{ fontSize: '0.85rem' }}>
                                Акція -{product.discount_percent}%
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        {product.discount_percent > 0 ? (
                            <div className="d-flex align-items-baseline gap-3">
                                <h2 className="mb-0" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#28a745', fontFamily: 'var(--font-heading)' }}>
                                    {Math.round(product.price * (1 - product.discount_percent / 100))} грн
                                </h2>
                                <span className="text-decoration-line-through" style={{ fontSize: '1.3rem', color: 'var(--text-secondary)' }}>
                                    {Math.round(product.price)} грн
                                </span>
                            </div>
                        ) : (
                            <h2 className="mb-0" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#e6f1ff', fontFamily: 'var(--font-heading)' }}>
                                {Math.round(product.price)} грн
                            </h2>
                        )}
                    </div>

                    {/* Stock Status */}
                    {product.stock_quantity !== undefined && (
                        <div className="mb-3 p-2 rounded" style={{ backgroundColor: 'rgba(109, 119, 250, 0.1)' }}>
                            <small style={{ 
                                color: product.stock_quantity > 10 ? '#28a745' : product.stock_quantity > 0 ? '#ffc107' : '#dc3545', 
                                fontFamily: 'var(--font-heading)', 
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                {product.stock_quantity > 10 ? `✓ В наявності` :
                                 product.stock_quantity > 0 ? `⚠ Залишилось ${product.stock_quantity} од.` :
                                 '✗ Немає в наявності'}
                            </small>
                        </div>
                    )}

                    {/* Main cart button */}
                    <div id="main-cart-button" className="mb-4">
                        <AddToCartButton product={product} />
                    </div>

                    {/* Info Badge */}
                    <div className="alert alert-info d-flex align-items-center mb-4 py-2" role="alert" style={{ backgroundColor: 'rgba(56, 74, 158, 0.15)', border: '1px solid rgba(56, 74, 158, 0.3)', fontSize: '0.9rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="flex-shrink-0 me-2" viewBox="0 0 16 16" style={{ color: 'var(--accent-color)' }}>
                            <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.896-.011a2.89 2.89 0 0 0-2.924 2.924l.01.896-.636.622a2.89 2.89 0 0 0 0 4.134l.638.622-.011.896a2.89 2.89 0 0 0 2.924 2.924l.896-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.638.896.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.896.636-.622a2.89 2.89 0 0 0 0-4.134l-.638-.622.011-.896a2.89 2.89 0 0 0-2.924-2.924l-.896.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
                        </svg>
                        <small style={{ color: 'var(--text-secondary)' }}>
                            Товар розроблений професійним психологом
                        </small>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                        <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: '#e6f1ff', fontSize: '1.2rem' }}>Опис</h5>
                        <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            {product.description}
                        </p>
                    </div>

                    {/* Book Characteristics */}
                    {(product.author || product.publisher || product.year || product.pages) && (
                        <div className="mt-4">
                            <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', fontSize: '1.3rem' }}>Характеристики</h5>
                            <div className="card border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                <div className="card-body p-4">
                                    <table className="table table-sm mb-0" style={{ fontSize: '1rem' }}>
                                        <tbody>
                                        {product.author && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ width: '40%', color: '#cccccc', border: 'none', fontWeight: '500' }}>Автор</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.author}</td>
                                            </tr>
                                        )}
                                        {product.publisher && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>Видавництво</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.publisher}</td>
                                            </tr>
                                        )}
                                        {product.translator && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>Перекладач</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.translator}</td>
                                            </tr>
                                        )}
                                        {product.year && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>Рік видання</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.year}</td>
                                            </tr>
                                        )}
                                        {product.language && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>Мова</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.language}</td>
                                            </tr>
                                        )}
                                        {product.pages > 0 && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>Кількість сторінок</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.pages}</td>
                                            </tr>
                                        )}
                                        {product.cover_type && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>Обкладинка</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.cover_type}</td>
                                            </tr>
                                        )}
                                        {product.isbn && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>ISBN</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.isbn}</td>
                                            </tr>
                                        )}
                                        {product.format && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>Формат</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.format}</td>
                                            </tr>
                                        )}
                                        {product.book_type && (
                                            <tr>
                                                <td className="py-3 px-0" style={{ color: '#cccccc', border: 'none', fontWeight: '500' }}>Тип</td>
                                                <td className="py-3 px-0" style={{ color: '#ffffff', border: 'none', fontWeight: '600' }}>{product.book_type}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        </div>
                    )}
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
