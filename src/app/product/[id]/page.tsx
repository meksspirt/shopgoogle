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
                <div className="col-md-6">
                    <ProductGallery images={product.images || [product.image_url]} />
                </div>
                <div className="col-md-6">
                    <h1 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600' }}>
                        {product.title}
                    </h1>

                    <h2 className="mb-4" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {product.price} грн
                    </h2>

                    <div className="alert alert-info d-flex align-items-center mb-4" role="alert" style={{ backgroundColor: 'rgba(56, 74, 158, 0.2)', borderColor: 'var(--primary-color)', color: '#e6f1ff' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-patch-check-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                            <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.896-.011a2.89 2.89 0 0 0-2.924 2.924l.01.896-.636.622a2.89 2.89 0 0 0 0 4.134l.638.622-.011.896a2.89 2.89 0 0 0 2.924 2.924l.896-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.638.896.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.896.636-.622a2.89 2.89 0 0 0 0-4.134l-.638-.622.011-.896a2.89 2.89 0 0 0-2.924-2.924l-.896.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
                        </svg>
                        <div>
                            Товар якісний, хороший, складений професійним психологом.
                        </div>
                    </div>

                    <div className="mb-4">
                        <AddToCartButton product={product} />
                    </div>

                    <hr className="my-4" />

                    <div className="mt-4">
                        <h5 className="fw-bold mb-3">Опис</h5>
                        <p className="text-muted" style={{ lineHeight: '1.7' }}>
                            {product.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
