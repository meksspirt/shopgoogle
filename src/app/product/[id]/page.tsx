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
