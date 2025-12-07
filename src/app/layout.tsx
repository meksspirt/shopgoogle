import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import JsonLd from "@/components/JsonLd";
import Script from "next/script";
import localFont from "next/font/local";
import { getSettings } from "@/lib/getSettings";
import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Facebook Pixel ID
const FACEBOOK_PIXEL_ID = "2252045738624082";

// Настройка кастомного шрифта Quincy CF
const quincy = localFont({
  src: [
    {
      path: './fonts/fonnts.com-Quincy_CF_Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/fonnts.com-Quincy_CF_Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-quincy',
  display: 'swap',
  fallback: ['serif'],
});

// Настройка шрифта Carelia для логотипа
const carelia = localFont({
  src: './fonts/Carelia-Upright.ttf',
  variable: '--font-carelia',
  display: 'swap',
  fallback: ['serif'],
});

// Динамические meta теги из настроек
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings([
    'site_title',
    'site_description',
    'site_keywords',
    'site_url',
    'site_author',
    'og_image',
    'fb_app_id'
  ]);

  const siteUrl = settings.site_url || 'https://www.calmcraft.shop';
  const siteName = settings.site_title || 'Breathe Self Space';
  const siteDescription = settings.site_description || 'Інструкція з експлуатації себе. Ваш персональний воркбук з інструментами КПТ та техніками самодопомоги.';
  const siteKeywords = settings.site_keywords || 'психологія, воркбук, саморозвиток, КПТ, ментальне здоров\'я, Анна Клим';

  // Формируем абсолютный URL для изображения
  let ogImage = settings.og_image || '/og-image.png';
  if (ogImage.startsWith('/')) {
    ogImage = `${siteUrl}${ogImage}`;
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: siteKeywords,
    authors: [{ name: settings.site_author || 'CalmCraft' }],
    creator: settings.site_author || 'CalmCraft',
    publisher: settings.site_author || 'CalmCraft',

    // Robots meta
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'uk_UA',
      url: siteUrl,
      siteName: siteName,
      title: siteName,
      description: siteDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteName,
          type: 'image/png',
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: siteDescription,
      creator: '@CalmCraft',
      images: [ogImage],
    },

    // Verification tags (можно добавить свои)
    verification: {
      google: settings.google_verification || '',
      yandex: settings.yandex_verification || '',
    },

    // Alternate languages
    alternates: {
      canonical: siteUrl,
      languages: {
        'uk-UA': siteUrl,
      },
    },

    // App links (для мобильных приложений, если они есть)
    // applicationName: siteName,

    // Manifest для PWA
    manifest: '/manifest.json',

    // Facebook App ID for monetization tools
    facebook: settings.fb_app_id ? {
      appId: settings.fb_app_id,
    } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        {/* SEO Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Предотвращение мигания темы */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'academic') {
                    document.documentElement.classList.add('academic-theme');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2252045738624082');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2252045738624082&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
        {/* End Meta Pixel Code */}
        
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-RTC49E8P33"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RTC49E8P33');
            `,
          }}
        />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" async></script>
      </head>
      <body className={`${quincy.variable} ${carelia.variable}`}>
        <JsonLd />
        <Navbar />
        <main className="min-vh-100">
          {children}
        </main>
        <Footer />
        <ThemeToggle />
        <Analytics />
        <SpeedInsights />
        
        {/* Monolytics tracking code */}
        <Script
          id="monolytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function (windowArg, documentArg, scriptSrc, argA, argB) {
                windowArg.monolytics = windowArg.monolytics || function () {
                  (windowArg.monolytics.q = windowArg.monolytics.q || []).push(arguments)
                };
                windowArg._monolyticsSettings = {domainCode: 'BRaENFgVV4'};
                argA = documentArg.getElementsByTagName('head')[0];
                argB = documentArg.createElement('script');
                argB.async = 1;
                argB.src = scriptSrc;
                argA.appendChild(argB);
              })(window, document, 'https://cloud.monolytics.app/tracker.js');
            `,
          }}
        />
      </body>
    </html>
  );
}
