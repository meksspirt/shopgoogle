'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
    const [cartCount, setCartCount] = useState(0);
    const [storeName, setStoreName] = useState('CalmCraft');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Initial check for cart items
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((acc: number, item: any) => acc + item.quantity, 0));

        // Listen for custom event 'cartUpdated'
        const handleCartUpdate = () => {
            const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(updatedCart.reduce((acc: number, item: any) => acc + item.quantity, 0));
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    useEffect(() => {
        // Fetch settings
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('settings')
                .select('*')
                .in('key', ['store_name']);

            data?.forEach(setting => {
                if (setting.key === 'store_name') setStoreName(setting.value || 'CalmCraft');
            });
        };

        fetchSettings();

        // Check auth status
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <nav className="navbar navbar-expand-lg sticky-top">
            <div className="container">
                <Link href="/" className="navbar-brand fw-bold text-white" style={{ fontFamily: 'var(--font-carelia, serif)', fontSize: '1.8rem', letterSpacing: '2px' }}>
                    {storeName}
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-lg-center">
                        <li className="nav-item">
                            <Link href="/" className="nav-link">
                                Каталог
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href={isLoggedIn ? "/profile" : "/profile/login"} className="nav-link">
                                {isLoggedIn ? "Профіль" : "Увійти"}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/cart" className="nav-link">
                                <span className="position-relative">
                                    Кошик
                                    {cartCount > 0 && (
                                        <span
                                            className="position-absolute badge rounded-pill bg-danger"
                                            style={{
                                                top: '-5px',
                                                right: '-20px',
                                                fontSize: '0.7rem',
                                                padding: '0.25em 0.5em',
                                                minWidth: '1.5em'
                                            }}
                                        >
                                            {cartCount}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
