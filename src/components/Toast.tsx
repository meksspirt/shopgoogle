'use client';

import { useState, useEffect } from 'react';

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
        <div
            className="position-fixed top-0 start-50 translate-middle-x mt-4"
            style={{
                zIndex: 9999,
                animation: 'slideDown 0.3s ease-out'
            }}
        >
            <div
                className="card shadow-lg border-0"
                style={{
                    backgroundColor: '#fff',
                    minWidth: '300px',
                    maxWidth: '500px'
                }}
            >
                <div className="card-body d-flex align-items-center gap-3 p-3">
                    <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#28a745',
                            borderRadius: '50%',
                            flexShrink: 0
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="4 10 8 14 16 6" />
                        </svg>
                    </div>
                    <div className="flex-grow-1">
                        <p className="mb-0 fw-bold text-dark">{message}</p>
                    </div>
                    <button
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>
            </div>
            <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
        </div>
    );
}
