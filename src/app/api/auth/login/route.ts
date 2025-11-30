import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email та пароль обов\'язкові' }, { status: 400 });
        }

        // Вход через Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error);
            return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
        }

        // Проверяем, является ли пользователь администратором
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile?.is_admin) {
            // Выходим, если не администратор
            await supabase.auth.signOut();
            return NextResponse.json({ error: 'Доступ заборонено. Тільки для адміністраторів.' }, { status: 403 });
        }

        return NextResponse.json({ 
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                isAdmin: true
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
    }
}
