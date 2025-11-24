'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({
        title: '',
        description: '',
        price: '',
        images: [] as string[],
        mainImageIndex: 0,
        availability: 'in_stock' as 'in_stock' | 'pre_order',
        discount_percent: 0
    });
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

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

    useEffect(() => {
        fetchOrders();
        fetchProducts();
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
                    discount_percent: parseInt(newProduct.discount_percent.toString()) || 0
                }]);

            if (error) throw error;

            alert('Товар успішно створено!');
            setNewProduct({ title: '', description: '', price: '', images: [], mainImageIndex: 0, availability: 'in_stock', discount_percent: 0 });
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
                    discount_percent: parseInt(editingProduct.discount_percent?.toString() || '0') || 0
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
                                                    Inst: <span className="text-primary">@{order.instagram_nick}</span>
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
                                                {order.status === 'shipped' && (
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-dark text-white border-secondary"
                                                        placeholder="ТТН"
                                                        defaultValue={order.tracking_number || ''}
                                                        onBlur={(e) => updateTrackingNumber(order.id, e.target.value)}
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                )}
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
                            <div className="col-md-6">
                                <label className="form-label small text-muted text-uppercase fw-bold">Знижка (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="form-select-lg bg-dark text-white border-secondary"
                                    value={newProduct.discount_percent}
                                    onChange={e => setNewProduct({ ...newProduct, discount_percent: parseInt(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid' }}
                                />
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
                        <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                            <div className="position-relative" style={{ height: '200px' }}>
                                <Image
                                    src={product.image_url}
                                    alt={product.title}
                                    fill
                                    className="object-fit-cover"
                                />
                            </div>
                            <div className="card-body">
                                <h5 className="card-title text-white">{product.title}</h5>
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
                                        <div className="col-md-6">
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
