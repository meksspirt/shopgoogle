import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // Перевірка доступу до адмін-панелі
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Дозволити доступ до сторінки логіну
        if (request.nextUrl.pathname === '/admin/login') {
            console.log('🔓 Middleware: доступ до /admin/login дозволено');
            return NextResponse.next();
        }

        console.log('🔍 Middleware: перевірка доступу до', request.nextUrl.pathname);

        // Получаем все cookies с префиксом supabase
        const allCookies = request.cookies.getAll();
        const supabaseCookies = allCookies.filter(cookie => 
            cookie.name.includes('sb-') && cookie.name.includes('auth-token')
        );

        console.log('🍪 Знайдено Supabase cookies:', supabaseCookies.length);

        if (supabaseCookies.length === 0) {
            console.log('❌ Middleware: немає auth токена, редірект на логін');
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // Пропускаем проверку в middleware, проверка будет на клиенте
        console.log('✅ Middleware: токен знайдено, пропускаємо');
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
