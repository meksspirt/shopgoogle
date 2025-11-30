import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // Временно отключаем middleware для админ-панели
    // Проверка аутентификации будет происходить на клиенте
    // Это решает проблему с cookies, которые не доступны в middleware
    
    console.log('🔓 Middleware: пропускаємо всі запити (перевірка на клієнті)');
    return NextResponse.next();
}

export const config = {
    // Отключаем matcher, чтобы middleware не блокировал запросы
    matcher: [],
};
