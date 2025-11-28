import { createClient } from '@supabase/supabase-js';

// Создаем серверный клиент для использования в Server Components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseKey);

export async function getSettings(keys: string[]) {
    try {
        const { data, error } = await supabaseServer
            .from('settings')
            .select('*')
            .in('key', keys);

        if (error) {
            console.error('Error fetching settings:', error);
            return {};
        }

        const settings: { [key: string]: string } = {};
        data?.forEach(setting => {
            settings[setting.key] = setting.value || '';
        });

        return settings;
    } catch (error) {
        console.error('Error in getSettings:', error);
        return {};
    }
}

export async function getSetting(key: string): Promise<string> {
    try {
        const { data, error } = await supabaseServer
            .from('settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            console.error(`Error fetching setting ${key}:`, error);
            return '';
        }

        return data?.value || '';
    } catch (error) {
        console.error(`Error in getSetting for ${key}:`, error);
        return '';
    }
}
