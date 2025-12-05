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
  const settings = await getSettings(['book_title', 'book_price', 'author_name', 'author_bio', 'site_description']);

  // Получаем товары. Предполагаем, что пособие - это один из товаров.
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(1); // Берем один главный товар

  const bookTitle = settings.book_title || 'Breathe Self Space';
  const authorName = settings.author_name || 'Анна Клим';
  const authorBio = settings.author_bio || 'Практикуючий психолог та спеціаліст із кризового реагування в гуманітарних місіях. У цій книзі я зібрала лише дієві методики.';
  const siteDescription = settings.site_description || 'Інструкція з експлуатації себе. Ваш персональний воркбук з інструментами для подолання стресу та тривоги.';

  if (error) {
    console.error('Error fetching products:', error);
    return <div className="container py-5 text-center text-danger">Помилка завантаження.</div>;
  }

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3" style={{ color: 'var(--primary-color)' }}>{bookTitle}</h1>
        <p className="lead mb-4 mx-auto" style={{ maxWidth: '700px', color: 'var(--text-secondary)' }}>
          {siteDescription}
        </p>
      </div>

      {/* Product Section */}
      <div className="row justify-content-center mb-5">
        {!products || products.length === 0 ? (
          <div className="col-12 text-center">
            <p className="text-muted">Посібник скоро з'явиться у продажу.</p>
          </div>
        ) : (
          products.map((product) => (
            <div className="col-md-6 col-lg-5 col-xl-4" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))
        )}
      </div>

      {/* About the Author Section */}
      <div className="mt-5 pt-5 border-top" style={{ borderColor: 'rgba(0, 7, 94, 0.1)' }}>
        <div className="row align-items-center">
          <div className="col-md-4 text-center mb-4 mb-md-0">
            <div className="position-relative d-inline-block rounded-circle overflow-hidden border border-3" style={{ width: '250px', height: '250px', borderColor: 'var(--primary-color)' }}>
              <img
                src="https://uugsiyattuabotlmegfe.supabase.co/storage/v1/object/public/product-images/portretdevyshki11_1.jpg.webp"
                alt={authorName}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          <div className="col-md-8 text-center text-md-start">
            <h2 className="mb-3 fw-bold" style={{ color: 'var(--primary-color)' }}>{authorName}</h2>
            <h4 className="mb-4 text-muted fst-italic">Автор посібника, Психолог</h4>
            <div className="lead mb-4" style={{ color: 'var(--text-primary)', lineHeight: '1.8' }}>
              {authorBio}
              <p className="mt-3">
                "Я створила цей посібник, щоб кожен міг мати під рукою інструмент для самодопомоги та повернення до стану рівноваги."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
