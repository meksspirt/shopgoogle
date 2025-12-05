import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import { Metadata } from 'next';
import { getSettings } from '@/lib/getSettings';

export const revalidate = 0; // Disable static caching for now

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings(['site_title', 'site_description', 'og_image', 'site_url']);
  const siteUrl = settings.site_url || 'https://www.calmcraft.shop';

  let ogImage = settings.og_image || '/og-image.png';
  if (ogImage.startsWith('/')) {
    ogImage = `${siteUrl}${ogImage}`;
  }

  return {
    title: settings.site_title || 'CalmCraft - Психологічний посібник',
    description: settings.site_description || 'Психологічний посібник від практикуючого психолога.',
    openGraph: {
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Психологічний посібник',
        },
      ],
    },
  };
}

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

      {/* About the Author Section */}
      <div className="mt-5 pt-5 border-top" style={{ borderColor: 'rgba(0, 7, 94, 0.1)' }}>
        <div className="row align-items-center">
          <div className="col-md-4 text-center mb-4 mb-md-0">
            <div className="position-relative d-inline-block rounded-circle overflow-hidden border border-3" style={{ width: '200px', height: '200px', borderColor: 'var(--primary-color)' }}>
              <img
                src="https://uugsiyattuabotlmegfe.supabase.co/storage/v1/object/public/product-images/portretdevyshki11_1.jpg.webp"
                alt="Author"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          <div className="col-md-8">
            <h2 className="mb-4 fw-bold" style={{ color: 'var(--primary-color)' }}>Про Автора</h2>
            <p className="lead mb-4" style={{ color: 'var(--text-primary)' }}>
              Привіт! Я професійний психолог з багаторічним досвідом. Моя мета — допомогти вам знайти гармонію та покращити якість вашого життя через перевірені методики та знання.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Всі матеріали та книги, представлені в цьому магазині, ретельно відібрані та створені з урахуванням сучасних психологічних досліджень. Я вірю, що кожен заслуговує на щасливе та збалансоване життя.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
