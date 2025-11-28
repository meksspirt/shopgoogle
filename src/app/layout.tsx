import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import Navbar from "@/components/Navbar";
import localFont from "next/font/local";

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

export const metadata = {
  title: "CalmCraft",
  description: "Ваш улюблений книжковий магазин",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5B9LGQBN');`
        }} />
        {/* End Google Tag Manager */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" async></script>
      </head>
      <body className={`${quincy.variable} ${carelia.variable}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5B9LGQBN"
            height="0" width="0" style={{display: 'none', visibility: 'hidden'}}></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Navbar />
        <main className="min-vh-100">
          {children}
        </main>
        <footer className="bg-dark text-white text-center py-4 mt-auto">
          <div className="container">
            <small className="opacity-75">&copy; 2024 CalmCraft. Всі права захищено.</small>
          </div>
        </footer>
      </body>
    </html>
  );
}
