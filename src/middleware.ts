import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
    // Перевірка доступу до адмін-панелі
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Дозволити доступ до сторінки логіну
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Получаем токен из cookies
        const token = request.cookies.get('sb-uugsiyattuabotlmegfe-auth-token');
        
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            // Создаем Supabase клиент для проверки сессии
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // Проверяем сессию
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }

            // Проверяем права администратора
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();

            if (!profile?.is_admin) {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
        } catch (error) {
            console.error('Middleware auth error:', error);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
