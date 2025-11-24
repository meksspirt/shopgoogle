import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    // Перевірка доступу до адмін-панелі
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Дозволити доступ до сторінки логіну
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Перевірити сесію для всіх інших адмін-сторінок
        const session = await verifySession();

        if (!session) {
            // Якщо немає сесії - редірект на логін
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
