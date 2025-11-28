'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Footer() {
    const [settings, setSettings] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('settings')
                .select('*')
                .in('key', ['company_name', 'support_phone', 'instagram_link', 'working_hours']);

            if (data) {
                const settingsObj: { [key: string]: string } = {};
                data.forEach(setting => {
                    settingsObj[setting.key] = setting.value || '';
                });
                setSettings(settingsObj);
            }
        };

        fetchSettings();
    }, []);

    const companyName = settings.company_name || 'CalmCraft';
    const phone = settings.support_phone;
    const instagram = settings.instagram_link;
    const workingHours = settings.working_hours;

    return (
        <footer className="bg-dark text-white py-4 mt-auto">
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h5 className="fw-bold mb-3">{companyName}</h5>
                        {workingHours && (
                            <p className="small opacity-75 mb-2">
                                <span className="me-2">🕐</span>
                                {workingHours}
                            </p>
                        )}
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h6 className="fw-bold mb-3">Контакти</h6>
                        {phone && (
                            <p className="small mb-2">
                                <a href={`tel:${phone}`} className="text-white text-decoration-none" style={{ opacity: 0.9 }}>
                                    <span className="me-2" style={{ color: 'var(--accent-button)' }}>📞</span>
                                    {phone}
                                </a>
                            </p>
                        )}
                        {instagram && (
                            <p className="small mb-2">
                                <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none" style={{ opacity: 0.9 }}>
                                    <span className="me-2" style={{ color: 'var(--accent-button)' }}>📷</span>
                                    Instagram
                                </a>
                            </p>
                        )}
                    </div>
                    <div className="col-md-4">
                        <h6 className="fw-bold mb-3">Навігація</h6>
                        <p className="small mb-2">
                            <Link href="/" className="text-white text-decoration-none" style={{ opacity: 0.9 }}>
                                Каталог
                            </Link>
                        </p>
                        <p className="small mb-2">
                            <Link href="/track" className="text-white text-decoration-none" style={{ opacity: 0.9 }}>
                                Відстежити замовлення
                            </Link>
                        </p>
                        <p className="small mb-2">
                            <Link href="/cart" className="text-white text-decoration-none" style={{ opacity: 0.9 }}>
                                Кошик
                            </Link>
                        </p>
                    </div>
                </div>
                <hr className="my-3 opacity-25" />
                <div className="text-center">
                    <small style={{ opacity: 0.7, color: '#000545' }}>&copy; 2024 {companyName}. Всі права захищено.</small>
                </div>
            </div>
        </footer>
    );
}
