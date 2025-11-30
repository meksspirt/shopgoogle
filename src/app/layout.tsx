import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import localFont from "next/font/local";
import { getSettings } from "@/lib/getSettings";
import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  const settings = await getSettings(['site_title', 'site_description', 'site_keywords']);

  return {
    title: settings.site_title || 'CalmCraft - Книжковий магазин',
    description: settings.site_description || 'Ваш улюблений книжковий магазин',
    keywords: settings.site_keywords || 'книги, книжковий магазин, купити книги',
    openGraph: {
      title: settings.site_title || 'CalmCraft',
      description: settings.site_description || 'Ваш улюблений книжковий магазин',
      type: 'website',
      locale: 'uk_UA',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.site_title || 'CalmCraft',
      description: settings.site_description || 'Ваш улюблений книжковий магазин',
    },
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
        <Navbar />
        <main className="min-vh-100">
          {children}
        </main>
        <Footer />
        <ThemeToggle />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
