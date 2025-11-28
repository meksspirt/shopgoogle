'use client';

import { useEffect, ReactNode } from 'react';

interface ModalProps {
    id: string;
    title: string;
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export default function Modal({ 
    id, 
    title, 
    children, 
    isOpen, 
    onClose, 
    size = 'md',
    showCloseButton = true 
}: ModalProps) {
    
    useEffect(() => {
        // Disable body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        // Close on Escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div 
            className="modal-overlay" 
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1050,
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <div 
                className={`modal-container ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#ffffff',
                    maxWidth: size === 'sm' ? '500px' : size === 'md' ? '700px' : size === 'lg' ? '900px' : '1200px',
                    width: '90%',
                    maxHeight: '90vh',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    animation: 'slideIn 0.3s ease-out',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <header 
                    className="modal-header"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.5rem',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        flexShrink: 0
                    }}
                >
                    <h2 
                        style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#00075e',
                            fontFamily: 'var(--font-heading)'
                        }}
                    >
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button 
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: '#6b7280',
                                cursor: 'pointer',
                                padding: 0,
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e5e7eb';
                                e.currentTarget.style.color = '#00075e';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#6b7280';
                            }}
                        >
                            ✕
                        </button>
                    )}
                </header>
                <main 
                    style={{
                        padding: '1.5rem',
                        overflowY: 'auto',
                        flex: 1
                    }}
                >
                    {children}
                </main>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideIn {
                    from { 
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @media (max-width: 768px) {
                    .modal-container {
                        width: 95% !important;
                        max-height: 95vh !important;
                    }

                    .modal-header {
                        padding: 1rem !important;
                    }

                    .modal-header h2 {
                        font-size: 1.25rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
