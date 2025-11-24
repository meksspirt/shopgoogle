import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';

export const revalidate = 0; // Disable static caching for now

export default async function Home() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    // Fallback or error message
    return (
      <div className="container py-5 text-center">
        <h2 className="text-danger">Помилка завантаження товарів</h2>
        <p>Будь ласка, переконайтеся, що база даних налаштована та змінні середовища конфігуровані.</p>
        <pre className="bg-light p-3 d-inline-block text-start">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="mb-5 text-center fw-bold display-5">Популярні Книги</h1>

      {!products || products.length === 0 ? (
        <div className="text-center py-5">
          <p className="lead text-muted">На даний момент книги відсутні.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {products.map((product) => (
            <div className="col" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
