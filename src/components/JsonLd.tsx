import { getSetting, getSettings } from '@/lib/getSettings';

export default async function JsonLd() {
    const settings = await getSettings([
        'site_title',
        'site_description',
        'site_url',
        'site_author',
        'author_name',
        'site_phone',
        'site_email',
        'book_title',
        'book_price'
    ]);

    const siteUrl = settings.site_url || 'https://calmcraft.com.ua';
    const siteName = settings.site_title || 'CalmCraft';
    const authorName = settings.author_name || settings.site_author || '';
    const bookTitle = settings.book_title || 'Психологічний посібник';

    // Professional Service Schema (Психолог как профессионал)
    const professionalServiceSchema = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: siteName,
        description: settings.site_description || 'Психологічний посібник від практикуючого психолога',
        url: siteUrl,
        image: `${siteUrl}/og-image.png`,
        telephone: settings.site_phone || '',
        email: settings.site_email || '',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'UA',
        },
        priceRange: '$$',
        serviceType: 'Психологічна допомога, Психологічні посібники',
        areaServed: {
            '@type': 'Country',
            name: 'Ukraine',
        },
    };

    // Product Schema (для самого пособия)
    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: bookTitle,
        description: settings.site_description || 'Психологічний посібник',
        image: `${siteUrl}/og-image.png`,
        brand: {
            '@type': 'Brand',
            name: authorName || siteName,
        },
        author: {
            '@type': 'Person',
            name: authorName,
            jobTitle: 'Психолог',
        },
        offers: {
            '@type': 'Offer',
            url: siteUrl,
            priceCurrency: 'UAH',
            price: settings.book_price || '',
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: siteName,
            },
        },
        category: 'Психологія, Саморозвиток',
    };

    // WebSite Schema
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        description: settings.site_description || 'Психологічний посібник',
        inLanguage: 'uk-UA',
        author: {
            '@type': 'Person',
            name: authorName,
            jobTitle: 'Психолог',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(professionalServiceSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(productSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteSchema),
                }}
            />
        </>
    );
}
