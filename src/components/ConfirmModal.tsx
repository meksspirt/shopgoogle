'use client';

import Modal from './Modal';

interface ConfirmModalProps {
    id: string;
    title: string;
    message: string;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
}

export default function ConfirmModal({
    id,
    title,
    message,
    isOpen,
    onConfirm,
    onCancel,
    confirmText = 'Так',
    cancelText = 'Ні',
    confirmButtonClass = 'btn-danger'
}: ConfirmModalProps) {
    
    const handleConfirm = () => {
        onConfirm();
        onCancel(); // Close modal after confirm
    };

    return (
        <Modal
            id={id}
            title={title}
            isOpen={isOpen}
            onClose={onCancel}
            size="sm"
            showCloseButton={false}
        >
            <div className="py-3">
                <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
                    {message}
                </p>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-4">
                <button
                    type="button"
                    className="btn btn-secondary px-4"
                    onClick={onCancel}
                    style={{
                        fontWeight: 600,
                        borderRadius: '8px'
                    }}
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    className={`btn ${confirmButtonClass} px-4`}
                    onClick={handleConfirm}
                    style={{
                        fontWeight: 600,
                        borderRadius: '8px'
                    }}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
