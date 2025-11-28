'use client';

import { useEffect } from 'react';

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <>
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                
                @keyframes checkmarkPop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                
                .toast-container {
                    animation: slideDown 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                .checkmark-circle {
                    animation: checkmarkPop 0.5s ease 0.2s both;
                }
            `}</style>
            
            <div
                className="position-fixed top-0 start-50 translate-middle-x toast-container"
                style={{
                    zIndex: 9999,
                    marginTop: '20px'
                }}
            >
                <div
                    className="shadow-lg border-0 rounded-3"
                    style={{
                        background: '#48A9A6',
                        minWidth: '320px',
                        maxWidth: '500px',
                        padding: '16px 20px',
                        boxShadow: '0 4px 12px rgba(72, 169, 166, 0.3)'
                    }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="d-flex align-items-center justify-content-center checkmark-circle"
                            style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                borderRadius: '50%',
                                flexShrink: 0,
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="4 10 8 14 16 6" />
                            </svg>
                        </div>
                        <div className="flex-grow-1">
                            <p 
                                className="mb-0 fw-bold" 
                                style={{ 
                                    color: 'white',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '1rem',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0.8,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
