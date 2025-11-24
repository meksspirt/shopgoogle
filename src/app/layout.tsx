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
  src: './fonts/Carelia-Upright.woff',
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
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" async></script>
      </head>
      <body className={`${quincy.variable} ${carelia.variable} ${quincy.className}`} style={{ fontFamily: 'var(--font-quincy), serif' }}>
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
