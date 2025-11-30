'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Form, Button, Alert, Card, Tabs, Tab } from 'react-bootstrap';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const router = useRouter();

    useEffect(() => {
        // Проверяем, залогинен ли уже пользователь
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/admin');
            }
        };
        checkUser();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🔐 Спроба входу...', { email });

        try {
            // Сначала пробуем войти напрямую через Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error('❌ Supabase auth error:', authError);
                setError('Невірний email або пароль: ' + authError.message);
                setLoading(false);
                return;
            }

            console.log('✅ Supabase auth успішна:', authData.user.id);

            // Теперь проверяем права администратора через API
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            console.log('📡 Відповідь API:', res.status);

            const data = await res.json();
            console.log('📦 Дані API:', data);

            if (res.ok && data.success) {
                console.log('✅ Успішний вхід, редірект на /admin');
                // Даем время на установку сессии
                setTimeout(() => {
                    router.push('/admin');
                    router.refresh();
                }, 100);
            } else {
                console.error('❌ Помилка перевірки прав:', data.error);
                // Выходим, если не администратор
                await supabase.auth.signOut();
                setError(data.error || 'Помилка входу');
            }
        } catch (err: any) {
            console.error('💥 Виняток:', err);
            setError('Сталася помилка. Спробуйте ще раз: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                setError('');
                alert('Реєстрація успішна! Зверніться до адміністратора для надання прав доступу.');
                setActiveTab('login');
            }
        } catch (err: any) {
            setError(err.message || 'Помилка реєстрації');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Card style={{ width: '100%', maxWidth: '450px', borderRadius: '12px' }} className="shadow">
                <Card.Body className="p-4">
                    <h2 className="text-center mb-4 fw-bold" style={{ color: '#00075e', fontFamily: 'var(--font-heading)' }}>
                        Панель адміністратора
                    </h2>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k as 'login' | 'register')}
                        className="mb-3"
                        justify
                    >
                        <Tab eventKey="login" title="Вхід">
                            <Form onSubmit={handleLogin}>
                                <Form.Group className="mb-3" controlId="loginEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Введіть email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="loginPassword">
                                    <Form.Label>Пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Введіть пароль"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>

                                <Button 
                                    type="submit" 
                                    className="w-100" 
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#00075e',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {loading ? 'Вхід...' : 'Увійти'}
                                </Button>
                            </Form>
                        </Tab>
                        
                        <Tab eventKey="register" title="Реєстрація">
                            <Form onSubmit={handleRegister}>
                                <Form.Group className="mb-3" controlId="registerEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Введіть email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="registerPassword">
                                    <Form.Label>Пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Мінімум 6 символів"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        style={{ borderRadius: '8px' }}
                                    />
                                    <Form.Text className="text-muted">
                                        Після реєстрації зверніться до адміністратора для надання прав доступу
                                    </Form.Text>
                                </Form.Group>

                                <Button 
                                    type="submit" 
                                    className="w-100" 
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#00075e',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {loading ? 'Реєстрація...' : 'Зареєструватися'}
                                </Button>
                            </Form>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
}
