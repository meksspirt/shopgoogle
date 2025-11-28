'use client';

import Modal from './Modal';
import ImageUpload from './ImageUpload';

interface EditProductModalProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    onChange: (product: any) => void;
}

export default function EditProductModal({ 
    product, 
    isOpen, 
    onClose, 
    onSave,
    onChange 
}: EditProductModalProps) {
    
    if (!product) return null;

    return (
        <Modal
            id="edit-product-modal"
            title="Редагувати товар"
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
        >
            <form onSubmit={onSave}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>
                            Назва книги
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            required
                            value={product.title}
                            onChange={e => onChange({ ...product, title: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>
                            Ціна (грн)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            required
                            value={product.price}
                            onChange={e => onChange({ ...product, price: e.target.value })}
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>
                            Опис
                        </label>
                        <textarea
                            className="form-control"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            rows={3}
                            required
                            value={product.description}
                            onChange={e => onChange({ ...product, description: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>
                            Наявність
                        </label>
                        <select
                            className="form-select"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.availability || 'in_stock'}
                            onChange={e => onChange({ ...product, availability: e.target.value })}
                        >
                            <option value="in_stock">В наявності</option>
                            <option value="pre_order">Предзаказ</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>
                            Знижка (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.discount_percent || 0}
                            onChange={e => onChange({ ...product, discount_percent: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>
                            Кількість на складі
                        </label>
                        <input
                            type="number"
                            min="0"
                            className="form-control"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.stock_quantity || 0}
                            onChange={e => onChange({ ...product, stock_quantity: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    
                    {/* Book Characteristics */}
                    <div className="col-12">
                        <hr className="my-3" style={{ borderColor: '#e5e7eb' }} />
                        <h6 style={{ color: '#00075e', fontWeight: 600 }}>Характеристики книги</h6>
                    </div>
                    
                    <div className="col-md-4">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Автор</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.author || ''} 
                            onChange={e => onChange({ ...product, author: e.target.value })} 
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Видавництво</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.publisher || ''} 
                            onChange={e => onChange({ ...product, publisher: e.target.value })} 
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Перекладач</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.translator || ''} 
                            onChange={e => onChange({ ...product, translator: e.target.value })} 
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Рік видання</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.year || new Date().getFullYear()} 
                            onChange={e => onChange({ ...product, year: parseInt(e.target.value) || new Date().getFullYear() })} 
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Мова</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.language || 'Українська'} 
                            onChange={e => onChange({ ...product, language: e.target.value })} 
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Кількість сторінок</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.pages || 0} 
                            onChange={e => onChange({ ...product, pages: parseInt(e.target.value) || 0 })} 
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Обкладинка</label>
                        <select 
                            className="form-select" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.cover_type || ''} 
                            onChange={e => onChange({ ...product, cover_type: e.target.value })}
                        >
                            <option value="">Оберіть</option>
                            <option value="Тверда">Тверда</option>
                            <option value="М'яка">М'яка</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>ISBN</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.isbn || ''} 
                            onChange={e => onChange({ ...product, isbn: e.target.value })} 
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Формат</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            placeholder="140x210мм" 
                            value={product.format || ''} 
                            onChange={e => onChange({ ...product, format: e.target.value })} 
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>Тип книги</label>
                        <select 
                            className="form-select" 
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#00075e'
                            }}
                            value={product.book_type || 'Паперова книга'} 
                            onChange={e => onChange({ ...product, book_type: e.target.value })}
                        >
                            <option value="Паперова книга">Паперова книга</option>
                            <option value="Електронна книга">Електронна книга</option>
                        </select>
                    </div>

                    <div className="col-12">
                        <ImageUpload
                            onUploadComplete={(urls, mainIndex) => onChange({ ...product, images: urls, mainImageIndex: mainIndex })}
                            currentImages={product.images || [product.image_url]}
                            mainImageIndex={product.mainImageIndex || 0}
                            maxImages={5}
                        />
                    </div>
                </div>
                <div className="d-flex gap-2 mt-4">
                    <button 
                        type="submit" 
                        className="btn btn-success px-4"
                        style={{
                            fontWeight: 600,
                            borderRadius: '8px'
                        }}
                    >
                        Зберегти зміни
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary px-4" 
                        onClick={onClose}
                        style={{
                            fontWeight: 600,
                            borderRadius: '8px'
                        }}
                    >
                        Скасувати
                    </button>
                </div>
            </form>
        </Modal>
    );
}
