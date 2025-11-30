import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        console.log('🔐 API Login attempt for:', email);

        if (!email || !password) {
            return NextResponse.json({ error: 'Email та пароль обов\'язкові' }, { status: 400 });
        }

        // Создаем серверный Supabase клиент
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                }
            }
        );

        // Вход через Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('❌ Login error:', error.message);
            return NextResponse.json({ error: 'Невірний email або пароль: ' + error.message }, { status: 401 });
        }

        console.log('✅ User authenticated:', data.user.id);

        // Проверяем, является ли пользователь администратором
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();

        console.log('👤 Profile check:', { profile, profileError });

        if (profileError) {
            console.error('❌ Profile error:', profileError);
            return NextResponse.json({ 
                error: 'Помилка перевірки профілю: ' + profileError.message 
            }, { status: 500 });
        }

        if (!profile?.is_admin) {
            console.warn('⚠️ User is not admin');
            return NextResponse.json({ 
                error: 'Доступ заборонено. Тільки для адміністраторів.' 
            }, { status: 403 });
        }

        console.log('✅ Admin access granted');

        // Возвращаем токен сессии для установки на клиенте
        return NextResponse.json({ 
            success: true,
            session: data.session,
            user: {
                id: data.user.id,
                email: data.user.email,
                isAdmin: true
            }
        });
    } catch (error: any) {
        console.error('💥 Login exception:', error);
        return NextResponse.json({ error: 'Помилка сервера: ' + error.message }, { status: 500 });
    }
}
