import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import Navbar from "@/components/Navbar";
import localFont from "next/font/local";

// Настройка кастомного шрифта Quincy CF
const quincy = localFont({
  src: [
    {
      path: './fonts/Fontspring-DEMO-quincycf-regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Fontspring-DEMO-quincycf-bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-quincy',
  display: 'swap',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" async></script>
      </head>
      <body className={quincy.variable}>
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
