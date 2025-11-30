import { supabase } from './supabaseClient';

export interface AuthUser {
    id: string;
    email: string;
    isAdmin: boolean;
}

/**
 * Регистрация нового пользователя
 */
export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Вход пользователя
 */
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Выход пользователя
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    // Проверяем, является ли пользователь администратором
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    return {
        id: user.id,
        email: user.email!,
        isAdmin: profile?.is_admin || false,
    };
}

/**
 * Проверить, является ли пользователь администратором
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.isAdmin || false;
}

/**
 * Получить сессию пользователя
 */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}
