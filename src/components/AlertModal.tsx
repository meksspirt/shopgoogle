'use client';

import Modal from './Modal';

interface AlertModalProps {
    id: string;
    title: string;
    message: string;
    isOpen: boolean;
    onClose: () => void;
    type?: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
}

export default function AlertModal({
    id,
    title,
    message,
    isOpen,
    onClose,
    type = 'info',
    buttonText = 'OK'
}: AlertModalProps) {
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    return (
        <Modal
            id={id}
            title={title}
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            showCloseButton={false}
        >
            <div className="py-3 text-center">
                <div 
                    className="mb-3"
                    style={{
                        fontSize: '3rem',
                        color: colors[type],
                        fontWeight: 'bold'
                    }}
                >
                    {icons[type]}
                </div>
                <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
                    {message}
                </p>
            </div>
            <div className="d-flex justify-content-center mt-4">
                <button
                    type="button"
                    className="btn btn-primary px-5"
                    onClick={onClose}
                    style={{
                        fontWeight: 600,
                        borderRadius: '8px',
                        backgroundColor: colors[type],
                        borderColor: colors[type]
                    }}
                >
                    {buttonText}
                </button>
            </div>
        </Modal>
    );
}
