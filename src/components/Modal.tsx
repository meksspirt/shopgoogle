'use client';

import { useEffect, ReactNode } from 'react';
import MicroModal from 'micromodal';

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
        try {
            MicroModal.init({
                onClose: onClose,
                disableScroll: true,
                awaitCloseAnimation: true
            });
        } catch (error) {
            console.error('MicroModal init error:', error);
        }
    }, [onClose]);

    useEffect(() => {
        try {
            if (isOpen) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    MicroModal.show(id);
                }, 10);
            } else {
                // Only try to close if modal is actually open
                const modalElement = document.getElementById(id);
                if (modalElement && modalElement.classList.contains('is-open')) {
                    MicroModal.close(id);
                }
            }
        } catch (error) {
            console.error('MicroModal show/close error:', error);
        }
    }, [isOpen, id]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div 
            className="modal micromodal-slide" 
            id={id} 
            aria-hidden="true"
        >
            <div className="modal__overlay" tabIndex={-1} data-micromodal-close>
                <div 
                    className={`modal__container ${sizeClasses[size]}`}
                    role="dialog" 
                    aria-modal="true" 
                    aria-labelledby={`${id}-title`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="modal__header">
                        <h2 className="modal__title" id={`${id}-title`}>
                            {title}
                        </h2>
                        {showCloseButton && (
                            <button 
                                className="modal__close" 
                                aria-label="Close modal" 
                                data-micromodal-close
                            >
                                ✕
                            </button>
                        )}
                    </header>
                    <main className="modal__content" id={`${id}-content`}>
                        {children}
                    </main>
                </div>
            </div>

            <style jsx>{`
                .modal {
                    display: none;
                }

                .modal.is-open {
                    display: block;
                }

                .modal__overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1050;
                }

                .modal__container {
                    background-color: #ffffff;
                    padding: 0;
                    max-width: 90%;
                    max-height: 90vh;
                    border-radius: 12px;
                    overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .modal__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    border-radius: 12px 12px 0 0;
                }

                .modal__title {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #00075e;
                    font-family: var(--font-heading);
                }

                .modal__close {
                    background: transparent;
                    border: none;
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #6b7280;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .modal__close:hover {
                    background-color: #e5e7eb;
                    color: #00075e;
                }

                .modal__content {
                    padding: 1.5rem;
                }

                @keyframes mmfadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes mmfadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                @keyframes mmslideIn {
                    from { transform: translateY(15%); }
                    to { transform: translateY(0); }
                }

                @keyframes mmslideOut {
                    from { transform: translateY(0); }
                    to { transform: translateY(-10%); }
                }

                .micromodal-slide {
                    display: none;
                }

                .micromodal-slide.is-open {
                    display: block;
                }

                .micromodal-slide[aria-hidden="false"] .modal__overlay {
                    animation: mmfadeIn 0.3s cubic-bezier(0.0, 0.0, 0.2, 1);
                }

                .micromodal-slide[aria-hidden="false"] .modal__container {
                    animation: mmslideIn 0.3s cubic-bezier(0, 0, 0.2, 1);
                }

                .micromodal-slide[aria-hidden="true"] .modal__overlay {
                    animation: mmfadeOut 0.3s cubic-bezier(0.0, 0.0, 0.2, 1);
                }

                .micromodal-slide[aria-hidden="true"] .modal__container {
                    animation: mmslideOut 0.3s cubic-bezier(0, 0, 0.2, 1);
                }

                .micromodal-slide .modal__container,
                .micromodal-slide .modal__overlay {
                    will-change: transform;
                }

                @media (max-width: 768px) {
                    .modal__container {
                        max-width: 95%;
                        max-height: 95vh;
                    }

                    .modal__header {
                        padding: 1rem;
                    }

                    .modal__content {
                        padding: 1rem;
                    }

                    .modal__title {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
}
