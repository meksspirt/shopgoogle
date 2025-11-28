'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface ImageUploadProps {
    onUploadComplete: (urls: string[], mainImageIndex: number) => void;
    currentImages?: string[];
    mainImageIndex?: number;
    maxImages?: number;
}

export default function ImageUpload({
    onUploadComplete,
    currentImages = [],
    mainImageIndex = 0,
    maxImages = 5
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>(currentImages);
    const [selectedMainIndex, setSelectedMainIndex] = useState(mainImageIndex);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await uploadImages(files);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length > 0) {
            await uploadImages(files);
        }
    };

    const uploadImages = async (files: File[]) => {
        // Check if adding these files would exceed max
        if (imageUrls.length + files.length > maxImages) {
            setError(`Максимум ${maxImages} зображень`);
            return;
        }

        // Validate all files
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setError('Усі файли повинні бути зображеннями');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Розмір файлу не повинен перевищувати 5MB');
                return;
            }
        }

        setError(null);
        setUploading(true);

        try {
            const uploadedUrls: string[] = [];

            for (const file of files) {
                // Create a unique filename
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload to Supabase Storage
                const { data, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            const newImageUrls = [...imageUrls, ...uploadedUrls];
            setImageUrls(newImageUrls);
            onUploadComplete(newImageUrls, selectedMainIndex);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError('Помилка завантаження. Переконайтеся, що bucket "product-images" створено в Supabase Storage.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImageUrls = imageUrls.filter((_, i) => i !== index);
        let newMainIndex = selectedMainIndex;

        // Adjust main image index if needed
        if (index === selectedMainIndex) {
            newMainIndex = 0; // Default to first image
        } else if (index < selectedMainIndex) {
            newMainIndex = selectedMainIndex - 1;
        }

        setImageUrls(newImageUrls);
        setSelectedMainIndex(newMainIndex);
        onUploadComplete(newImageUrls, newMainIndex);
    };

    const setMainImage = (index: number) => {
        setSelectedMainIndex(index);
        onUploadComplete(imageUrls, index);
    };

    return (
        <div>
            <label className="form-label small fw-bold" style={{ color: '#00075e', textTransform: 'uppercase' }}>
                Зображення товару ({imageUrls.length}/{maxImages})
            </label>
            <p className="small mb-3" style={{ color: '#6b7280' }}>Клікніть на зображення, щоб зробити його головним</p>

            {/* Upload Area */}
            {imageUrls.length < maxImages && (
                <div
                    className={`border border-2 rounded p-4 text-center mb-3 ${uploading ? 'opacity-50' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        minHeight: '150px',
                        backgroundColor: isDragging ? '#f0f9ff' : '#f9fafb',
                        borderColor: isDragging ? '#3b82f6' : '#e5e7eb',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '120px' }}>
                        <svg
                            className="mb-3"
                            width="48"
                            height="48"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            style={{ color: '#6b7280' }}
                        >
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                        </svg>
                        <p className="mb-2" style={{ color: '#6b7280' }}>
                            {uploading ? 'Завантаження...' : 'Перетягніть зображення сюди або клікніть для вибору'}
                        </p>
                        <p className="small" style={{ color: '#9ca3af' }}>PNG, JPG, GIF до 5MB (можна кілька)</p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="d-none"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </div>
            )}

            {/* Image Gallery */}
            {imageUrls.length > 0 && (
                <div className="row g-3">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="col-4">
                            <div
                                className={`position-relative ${index === selectedMainIndex ? 'border border-3 border-primary rounded' : ''}`}
                                style={{ paddingTop: '100%', cursor: 'pointer' }}
                                onClick={() => setMainImage(index)}
                            >
                                <Image
                                    src={url}
                                    alt={`Image ${index + 1}`}
                                    fill
                                    className="object-fit-cover rounded"
                                />
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    style={{ zIndex: 10 }}
                                >
                                    &times;
                                </button>
                                {index === selectedMainIndex && (
                                    <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">
                                        Головне
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
}
