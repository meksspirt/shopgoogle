'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({
        title: '',
        description: '',
        price: '',
        images: [] as string[],
        mainImageIndex: 0,
        availability: 'in_stock' as 'in_stock' | 'pre_order',
        discount_percent: 0,
        stock_quantity: 0,
        author: '',
        publisher: '',
        translator: '',
        year: new Date().getFullYear(),
        language: 'Українська',
        pages: 0,
        cover_type: '',
        isbn: '',
        format: '',
        book_type: 'Паперова книга'
    });
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [trackingNumbers, setTrackingNumbers] = useState<{ [key: string]: string }>({});
    const [newPromoCode, setNewPromoCode] = useState({
        code: '',
        discount_type: 'percent' as 'percent' | 'fixed',
        discount_percent: 0,
        discount_amount: 0,
        min_order_amount: 0,
        max_uses: null as number | null,
        valid_until: ''
    });

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else setOrders(data || []);
        setLoading(false);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
    };

    const fetchPromoCodes = async () => {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching promo codes:', error);
        else setPromoCodes(data || []);
    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
        fetchPromoCodes();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Помилка оновлення статусу');
            console.error(error);
        } else {
            fetchOrders();
        }
    };

    const updateTrackingNumber = async (id: string, trackingNumber: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ tracking_number: trackingNumber })
            .eq('id', id);

        if (error) {
            alert('Помилка оновлення ТТН');
            console.error(error);
        } else {
            alert('ТТН успішно збережено!');
            // Clear the tracking number from state
            setTrackingNumbers(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
            fetchOrders();
        }
    };

    const deleteOrder = async (id: string, orderNumber: string) => {
        if (!confirm(`Ви впевнені, що хочете видалити замовлення ${orderNumber}?`)) {
            return;
        }

        try {
            console.log('Deleting order:', id);

            // Используем RPC функцию для удаления заказа
            const { data, error } = await supabase
                .rpc('delete_order_with_items', { order_id_param: id });

            console.log('Delete result:', data);

            if (error) {
                console.error('Error deleting order:', error);
                throw error;
            }

            if (!data || !data.success) {
                throw new Error('Замовлення не знайдено або вже видалено');
            }

            // Обновляем список заказов
            await fetchOrders();
            
            alert('Замовлення успішно видалено');
        } catch (error: any) {
            alert('Помилка видалення замовлення: ' + (error.message || 'Невідома помилка'));
            console.error('Delete order error:', error);
            
            // Обновляем список в любом случае
            await fetchOrders();
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newProduct.images.length === 0) {
            alert('Будь ласка, завантажте принаймні одне зображення товару');
            return;
        }

        setCreatingProduct(true);

        try {
            const { error } = await supabase
                .from('products')
                .insert([{
                    title: newProduct.title,
                    description: newProduct.description,
                    price: parseFloat(newProduct.price),
                    image_url: newProduct.images[newProduct.mainImageIndex],
                    images: newProduct.images,
                    availability: newProduct.availability,
                    discount_percent: parseInt(newProduct.discount_percent.toString()) || 0,
                    stock_quantity: parseInt(newProduct.stock_quantity.toString()) || 0,
                    author: newProduct.author,
                    publisher: newProduct.publisher,
                    translator: newProduct.translator,
                    year: parseInt(newProduct.year.toString()) || new Date().getFullYear(),
                    language: newProduct.language,
                    pages: parseInt(newProduct.pages.toString()) || 0,
                    cover_type: newProduct.cover_type,
                    isbn: newProduct.isbn,
                    format: newProduct.format,
                    book_type: newProduct.book_type
                }]);

            if (error) throw error;

            alert('Товар успішно створено!');
            setNewProduct({ 
                title: '', 
                description: '', 
                price: '', 
                images: [], 
                mainImageIndex: 0, 
                availability: 'in_stock', 
                discount_percent: 0, 
                stock_quantity: 0,
                author: '',
                publisher: '',
                translator: '',
                year: new Date().getFullYear(),
                language: 'Українська',
                pages: 0,
                cover_type: '',
                isbn: '',
                format: '',
                book_type: 'Паперова книга'
            });
            fetchProducts();
        } catch (error: any) {
            console.error('Error creating product:', error);
            alert('Помилка створення товару: ' + error.message);
        } finally {
            setCreatingProduct(false);
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProduct) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    title: editingProduct.title,
                    description: editingProduct.description,
                    price: parseFloat(editingProduct.price),
                    image_url: editingProduct.images[editingProduct.mainImageIndex || 0],
                    images: editingProduct.images,
                    availability: editingProduct.availability,
                    discount_percent: parseInt(editingProduct.discount_percent?.toString() || '0') || 0,
                    stock_quantity: parseInt(editingProduct.stock_quantity?.toString() || '0') || 0,
                    author: editingProduct.author,
                    publisher: editingProduct.publisher,
                    translator: editingProduct.translator,
                    year: parseInt(editingProduct.year?.toString() || new Date().getFullYear().toString()),
                    language: editingProduct.language,
                    pages: parseInt(editingProduct.pages?.toString() || '0') || 0,
                    cover_type: editingProduct.cover_type,
                    isbn: editingProduct.isbn,
                    format: editingProduct.format,
                    book_type: editingProduct.book_type
                })
                .eq('id', editingProduct.id);

            if (error) throw error;

            alert('Товар успішно оновлено!');
            setEditingProduct(null);
            fetchProducts();
        } catch (error: any) {
            console.error('Error updating product:', error);
            alert('Помилка оновлення товару: ' + error.message);
        }
    };

    const deleteProduct = async (id: number, title: string) => {
        if (!confirm(`Ви впевнені, що хочете видалити товар "${title}"?`)) {
            return;
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Помилка видалення товару');
            console.error(error);
        } else {
            alert('Товар успішно видалено');
            fetchProducts();
        }
    };

    const handleCreatePromoCode = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { error } = await supabase
                .from('promo_codes')
                .insert([{
                    code: newPromoCode.code.toUpperCase(),
                    discount_percent: newPromoCode.discount_type === 'percent' ? newPromoCode.discount_percent : null,
                    discount_amount: newPromoCode.discount_type === 'fixed' ? newPromoCode.discount_amount : null,
                    min_order_amount: newPromoCode.min_order_amount,
                    max_uses: newPromoCode.max_uses,
                    valid_until: newPromoCode.valid_until ? new Date(newPromoCode.valid_until).toISOString() : null
                }]);

            if (error) throw error;

            alert('Промокод успішно створено!');
            setNewPromoCode({ code: '', discount_type: 'percent', discount_percent: 0, discount_amount: 0, min_order_amount: 0, max_uses: null, valid_until: '' });
            fetchPromoCodes();
        } catch (error: any) {
            console.error('Error creating promo code:', error);
            alert('Помилка створення промокоду: ' + error.message);
        }
    };

    const deletePromoCode = async (id: number, code: string) => {
        if (!confirm(`Ви впевнені, що хочете видалити промокод "${code}"?`)) {
            return;
        }

        const { error } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Помилка видалення промокоду');
            console.error(error);
        } else {
            alert('Промокод успішно видалено');
            fetchPromoCodes();
        }
    };

    const togglePromoCodeStatus = async (id: number, currentStatus: boolean) => {
        const { error } = await supabase
            .from('promo_codes')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            alert('Помилка оновлення статусу');
            console.error(error);
        } else {
            fetchPromoCodes();
        }
    };

    if (loading) return <div className="container py-5">Завантаження...</div>;

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h1 className="fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Панель адміністратора</h1>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary" onClick={() => { fetchOrders(); fetchProducts(); }}>Оновити</button>
                    <button className="btn btn-outline-danger" onClick={handleLogout}>Вийти</button>
                </div>
            </div>

            {/* Orders List - MOVED TO TOP */}
            <h3 className="mb-4 fw-bold">Замовлення</h3>
            <div className="card shadow-lg border-0 mb-5" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead style={{ backgroundColor: 'var(--secondary-color)' }}>
                                <tr>
                                    <th className="py-3">ID / Дата</th>
                                    <th className="py-3">Клієнт</th>
                                    <th className="py-3">Доставка</th>
                                    <th className="py-3">Інфо</th>
                                    <th className="py-3">Сума</th>
                                    <th className="py-3">Статус / ТТН</th>
                                    <th className="py-3">Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="py-3">
                                            <small className="text-muted d-block" title={order.id}>
                                                {order.id}
                                            </small>
                                            <small className="text-secondary">{new Date(order.created_at).toLocaleDateString()}</small>
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-bold text-white">{order.customer_name}</div>
                                            <small className="d-block text-secondary">{order.customer_email}</small>
                                            <small className="d-block text-secondary">{order.customer_phone}</small>
                                        </td>
                                        <td className="py-3">
                                            <div className="text-white">{order.customer_city}</div>
                                            <small className="text-secondary">НП: {order.nova_poshta_branch}</small>
                                        </td>
                                        <td className="py-3">
                                            {order.instagram_nick && (
                                                <div className="small text-secondary">
                                                    Inst: <a 
                                                        href={`https://www.instagram.com/${order.instagram_nick.replace('@', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary text-decoration-none"
                                                        style={{ cursor: 'pointer' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                    >
                                                        @{order.instagram_nick}
                                                    </a>
                                                </div>
                                            )}
                                            {order.visited_psychologist && (
                                                <span className="badge bg-info text-dark mt-1">Психолог: Так</span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <span className="text-warning fw-bold">{order.total_amount} грн</span>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex flex-column gap-2">
                                                <span className={`badge bg-${order.status === 'pending' ? 'warning' :
                                                    order.status === 'shipped' ? 'info' :
                                                        order.status === 'delivered' ? 'success' : 'secondary'
                                                    }`}>
                                                    {order.status === 'pending' ? 'Очікується' :
                                                     order.status === 'shipped' ? 'Відправлено' :
                                                     order.status === 'delivered' ? 'Доставлено' :
                                                     order.status === 'cancelled' ? 'Скасовано' : order.status}
                                                </span>
                                                <div className="d-flex gap-1">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-dark text-white border-secondary"
                                                        placeholder="ТТН Нова Пошта"
                                                        value={trackingNumbers[order.id] !== undefined ? trackingNumbers[order.id] : (order.tracking_number || '')}
                                                        onChange={(e) => setTrackingNumbers(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                    <button
                                                        className="btn btn-success btn-sm px-2"
                                                        onClick={() => updateTrackingNumber(order.id, trackingNumbers[order.id] !== undefined ? trackingNumbers[order.id] : (order.tracking_number || ''))}
                                                        title="Зберегти ТТН"
                                                    >
                                                        💾
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex flex-column gap-2">
                                                <select
                                                    className="form-select form-select-sm bg-dark text-white border-secondary"
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                >
                                                    <option value="pending">Очікується</option>
                                                    <option value="shipped">Відправлено</option>
                                                    <option value="delivered">Доставлено</option>
                                                    <option value="cancelled">Скасовано</option>
                                                </select>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => deleteOrder(order.id, order.id.slice(0, 8))}
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Товари</h3>
                <button 
                    className="btn btn-success"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? '✕ Закрити форму' : '+ Додати новий товар'}
                </button>
            </div>

            {/* Create Product Section - Collapsible */}
            {showCreateForm && (
            <div className="card shadow-lg border-0 mb-5" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="card-header bg-transparent border-bottom border-secondary py-3">
                    <h4 className="mb-0 fw-bold text-success">Додати новий товар</h4>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleCreateProduct}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Назва книги</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    placeholder="Введіть назву книги"
                                    value={newProduct.title}
                                    onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Ціна (грн)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    placeholder="0.00"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label small text-muted text-uppercase fw-bold">Опис</label>
                                <textarea
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    rows={3}
                                    required
                                    placeholder="Введіть опис книги"
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Наявність</label>
                                <select
                                    className="form-select form-select-lg bg-dark text-white border-secondary"
                                    value={newProduct.availability}
                                    onChange={e => setNewProduct({ ...newProduct, availability: e.target.value as 'in_stock' | 'pre_order' })}
                                >
                                    <option value="in_stock">В наявності</option>
                                    <option value="pre_order">Предзаказ</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Знижка (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    value={newProduct.discount_percent}
                                    onChange={e => setNewProduct({ ...newProduct, discount_percent: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Кількість на складі</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control form-control-lg bg-dark text-white border-secondary"
                                    required
                                    placeholder="0"
                                    value={newProduct.stock_quantity}
                                    onChange={e => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            
                            {/* Book Characteristics */}
                            <div className="col-12"><hr className="border-secondary my-3" /><h6 className="text-white">Характеристики книги</h6></div>
                            
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Автор</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.author} onChange={e => setNewProduct({ ...newProduct, author: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Видавництво</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.publisher} onChange={e => setNewProduct({ ...newProduct, publisher: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Перекладач</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.translator} onChange={e => setNewProduct({ ...newProduct, translator: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Рік видання</label>
                                <input type="number" className="form-control bg-dark text-white border-secondary" value={newProduct.year} onChange={e => setNewProduct({ ...newProduct, year: parseInt(e.target.value) || new Date().getFullYear() })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Мова</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.language} onChange={e => setNewProduct({ ...newProduct, language: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Кількість сторінок</label>
                                <input type="number" className="form-control bg-dark text-white border-secondary" value={newProduct.pages} onChange={e => setNewProduct({ ...newProduct, pages: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Обкладинка</label>
                                <select className="form-select bg-dark text-white border-secondary" value={newProduct.cover_type} onChange={e => setNewProduct({ ...newProduct, cover_type: e.target.value })}>
                                    <option value="">Оберіть</option>
                                    <option value="Тверда">Тверда</option>
                                    <option value="М'яка">М'яка</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">ISBN</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" value={newProduct.isbn} onChange={e => setNewProduct({ ...newProduct, isbn: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Формат</label>
                                <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="140x210мм" value={newProduct.format} onChange={e => setNewProduct({ ...newProduct, format: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Тип книги</label>
                                <select className="form-select bg-dark text-white border-secondary" value={newProduct.book_type} onChange={e => setNewProduct({ ...newProduct, book_type: e.target.value })}>
                                    <option value="Паперова книга">Паперова книга</option>
                                    <option value="Електронна книга">Електронна книга</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <ImageUpload
                                    onUploadComplete={(urls, mainIndex) => setNewProduct({ ...newProduct, images: urls, mainImageIndex: mainIndex })}
                                    currentImages={newProduct.images}
                                    mainImageIndex={newProduct.mainImageIndex}
                                    maxImages={5}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-success btn-lg mt-4 px-5" disabled={creatingProduct}>
                            {creatingProduct ? 'Створення...' : 'Створити товар'}
                        </button>
                    </form>
                </div>
            </div>
            )}

            {/* Products List */}
            <div className="row g-4 mb-5">
                {products.map((product) => (
                    <div key={product.id} className="col-md-6 col-lg-4">
                        <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)', cursor: 'pointer' }}>
                            <Link href={`/product/${product.id}`} target="_blank" className="text-decoration-none">
                                <div className="position-relative" style={{ height: '200px' }}>
                                    <Image
                                        src={product.image_url}
                                        alt={product.title}
                                        fill
                                        className="object-fit-cover"
                                    />
                                </div>
                            </Link>
                            <div className="card-body">
                                <Link href={`/product/${product.id}`} target="_blank" className="text-decoration-none">
                                    <h5 className="card-title text-white">{product.title}</h5>
                                </Link>
                                <p className="card-text text-muted small">
                                    {product.description.length > 50
                                        ? product.description.substring(0, 50) + '...'
                                        : product.description}
                                </p>
                                <p className="fw-bold text-warning">{product.price} грн</p>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setEditingProduct({ ...product, mainImageIndex: 0 })}
                                    >
                                        Редагувати
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteProduct(product.id, product.title)}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Promo Codes Section */}
            <h3 className="mb-4 fw-bold mt-5">Промокоди</h3>
            
            {/* Create Promo Code Form */}
            <div className="card shadow-lg border-0 mb-4" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="card-header bg-transparent border-bottom border-secondary py-3">
                    <h5 className="mb-0 fw-bold text-success">Створити промокод</h5>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleCreatePromoCode}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Код промокоду</label>
                                <input
                                    type="text"
                                    className="form-control bg-dark text-white border-secondary"
                                    required
                                    placeholder="SUMMER2024"
                                    value={newPromoCode.code}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted text-uppercase fw-bold">Тип знижки</label>
                                <select
                                    className="form-select bg-dark text-white border-secondary"
                                    value={newPromoCode.discount_type}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, discount_type: e.target.value as 'percent' | 'fixed' })}
                                >
                                    <option value="percent">Відсоток (%)</option>
                                    <option value="fixed">Фіксована сума (грн)</option>
                                </select>
                            </div>
                            {newPromoCode.discount_type === 'percent' ? (
                                <div className="col-md-2">
                                    <label className="form-label small text-muted text-uppercase fw-bold">Знижка (%)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        className="form-control bg-dark text-white border-secondary"
                                        required
                                        value={newPromoCode.discount_percent}
                                        onChange={e => setNewPromoCode({ ...newPromoCode, discount_percent: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            ) : (
                                <div className="col-md-2">
                                    <label className="form-label small text-muted text-uppercase fw-bold">Знижка (грн)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control bg-dark text-white border-secondary"
                                        required
                                        value={newPromoCode.discount_amount}
                                        onChange={e => setNewPromoCode({ ...newPromoCode, discount_amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            )}
                            <div className="col-md-2">
                                <label className="form-label small text-muted text-uppercase fw-bold">Мін. сума</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control bg-dark text-white border-secondary"
                                    value={newPromoCode.min_order_amount}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, min_order_amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-muted text-uppercase fw-bold">Макс. використань</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control bg-dark text-white border-secondary"
                                    placeholder="Необмежено"
                                    value={newPromoCode.max_uses || ''}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-bold">Діє до</label>
                                <input
                                    type="datetime-local"
                                    className="form-control bg-dark text-white border-secondary"
                                    value={newPromoCode.valid_until}
                                    onChange={e => setNewPromoCode({ ...newPromoCode, valid_until: e.target.value })}
                                />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-success px-5">Створити промокод</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Promo Codes List */}
            <div className="card shadow-lg border-0 mb-5" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead style={{ backgroundColor: 'var(--secondary-color)' }}>
                                <tr>
                                    <th className="py-3">Код</th>
                                    <th className="py-3">Знижка</th>
                                    <th className="py-3">Мін. сума</th>
                                    <th className="py-3">Використання</th>
                                    <th className="py-3">Діє до</th>
                                    <th className="py-3">Статус</th>
                                    <th className="py-3">Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoCodes.map((promo) => (
                                    <tr key={promo.id}>
                                        <td className="py-3">
                                            <span className="fw-bold text-warning">{promo.code}</span>
                                        </td>
                                        <td className="py-3">
                                            {promo.discount_percent ? 
                                                <span className="text-success">{promo.discount_percent}%</span> :
                                                <span className="text-success">{promo.discount_amount} грн</span>
                                            }
                                        </td>
                                        <td className="py-3">
                                            <span className="text-muted">{promo.min_order_amount} грн</span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-white">
                                                {promo.current_uses || 0} / {promo.max_uses || '∞'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-muted small">
                                                {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('uk-UA') : 'Безстроково'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`badge ${promo.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                {promo.is_active ? 'Активний' : 'Неактивний'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex gap-2">
                                                <button
                                                    className={`btn btn-sm ${promo.is_active ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => togglePromoCodeStatus(promo.id, promo.is_active)}
                                                >
                                                    {promo.is_active ? 'Деактивувати' : 'Активувати'}
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => deletePromoCode(promo.id, promo.code)}
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setEditingProduct(null)}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content" style={{ backgroundColor: 'var(--card-bg)' }}>
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title text-white">Редагувати товар</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setEditingProduct(null)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdateProduct}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Назва книги</label>
                                            <input
                                                type="text"
                                                className="form-control bg-dark text-white border-secondary"
                                                required
                                                value={editingProduct.title}
                                                onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Ціна (грн)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control bg-dark text-white border-secondary"
                                                required
                                                value={editingProduct.price}
                                                onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Опис</label>
                                            <textarea
                                                className="form-control bg-dark text-white border-secondary"
                                                rows={3}
                                                required
                                                value={editingProduct.description}
                                                onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Наявність</label>
                                            <select
                                                className="form-select bg-dark text-white border-secondary"
                                                value={editingProduct.availability || 'in_stock'}
                                                onChange={e => setEditingProduct({ ...editingProduct, availability: e.target.value })}
                                            >
                                                <option value="in_stock">В наявності</option>
                                                <option value="pre_order">Предзаказ</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Знижка (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="form-control bg-dark text-white border-secondary"
                                                value={editingProduct.discount_percent || 0}
                                                onChange={e => setEditingProduct({ ...editingProduct, discount_percent: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Кількість на складі</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control bg-dark text-white border-secondary"
                                                value={editingProduct.stock_quantity || 0}
                                                onChange={e => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        
                                        {/* Book Characteristics */}
                                        <div className="col-12"><hr className="border-secondary my-3" /><h6 className="text-white">Характеристики книги</h6></div>
                                        
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Автор</label>
                                            <input type="text" className="form-control bg-dark text-white border-secondary" value={editingProduct.author || ''} onChange={e => setEditingProduct({ ...editingProduct, author: e.target.value })} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Видавництво</label>
                                            <input type="text" className="form-control bg-dark text-white border-secondary" value={editingProduct.publisher || ''} onChange={e => setEditingProduct({ ...editingProduct, publisher: e.target.value })} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Перекладач</label>
                                            <input type="text" className="form-control bg-dark text-white border-secondary" value={editingProduct.translator || ''} onChange={e => setEditingProduct({ ...editingProduct, translator: e.target.value })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Рік видання</label>
                                            <input type="number" className="form-control bg-dark text-white border-secondary" value={editingProduct.year || new Date().getFullYear()} onChange={e => setEditingProduct({ ...editingProduct, year: parseInt(e.target.value) || new Date().getFullYear() })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Мова</label>
                                            <input type="text" className="form-control bg-dark text-white border-secondary" value={editingProduct.language || 'Українська'} onChange={e => setEditingProduct({ ...editingProduct, language: e.target.value })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Кількість сторінок</label>
                                            <input type="number" className="form-control bg-dark text-white border-secondary" value={editingProduct.pages || 0} onChange={e => setEditingProduct({ ...editingProduct, pages: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Обкладинка</label>
                                            <select className="form-select bg-dark text-white border-secondary" value={editingProduct.cover_type || ''} onChange={e => setEditingProduct({ ...editingProduct, cover_type: e.target.value })}>
                                                <option value="">Оберіть</option>
                                                <option value="Тверда">Тверда</option>
                                                <option value="М'яка">М'яка</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">ISBN</label>
                                            <input type="text" className="form-control bg-dark text-white border-secondary" value={editingProduct.isbn || ''} onChange={e => setEditingProduct({ ...editingProduct, isbn: e.target.value })} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Формат</label>
                                            <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="140x210мм" value={editingProduct.format || ''} onChange={e => setEditingProduct({ ...editingProduct, format: e.target.value })} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small text-muted text-uppercase fw-bold">Тип книги</label>
                                            <select className="form-select bg-dark text-white border-secondary" value={editingProduct.book_type || 'Паперова книга'} onChange={e => setEditingProduct({ ...editingProduct, book_type: e.target.value })}>
                                                <option value="Паперова книга">Паперова книга</option>
                                                <option value="Електронна книга">Електронна книга</option>
                                            </select>
                                        </div>

                                        <div className="col-12">
                                            <ImageUpload
                                                onUploadComplete={(urls, mainIndex) => setEditingProduct({ ...editingProduct, images: urls, mainImageIndex: mainIndex })}
                                                currentImages={editingProduct.images || [editingProduct.image_url]}
                                                mainImageIndex={editingProduct.mainImageIndex || 0}
                                                maxImages={5}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2 mt-4">
                                        <button type="submit" className="btn btn-success">Зберегти зміни</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Скасувати</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
