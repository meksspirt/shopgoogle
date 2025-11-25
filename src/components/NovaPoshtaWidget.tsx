'use client';

import { useEffect, useRef, useState } from 'react';

interface NovaPoshtaWidgetProps {
    onSelect: (data: {
        city: string;
        warehouse: string;
        warehouseId: string;
        fullAddress: string;
    }) => void;
    initialCity?: string;
    initialWarehouse?: string;
}

export default function NovaPoshtaWidget({ onSelect, initialCity, initialWarehouse }: NovaPoshtaWidgetProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [selectedDescription, setSelectedDescription] = useState('Обрати відділення або поштомат');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    useEffect(() => {
        // Get geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude.toString());
                    setLongitude(position.coords.longitude.toString());
                },
                (error) => {
                    console.error("Помилка отримання геолокації:", error);
                }
            );
        }

        // Set initial values if provided
        if (initialCity && initialWarehouse) {
            setSelectedText(initialWarehouse);
            setSelectedDescription(initialCity);
        }
    }, [initialCity, initialWarehouse]);

    const openFrame = () => {
        setIsModalOpen(true);
        
        setTimeout(() => {
            if (iframeRef.current) {
                iframeRef.current.src = 'https://widget.novapost.com/division/index.html';
                
                iframeRef.current.onload = () => {
                    const data = {
                        placeName: 'Київ',
                        latitude: latitude,
                        longitude: longitude,
                        domain: window.location.hostname,
                        id: selectedDepartmentId,
                    };
                    iframeRef.current?.contentWindow?.postMessage(data, '*');
                };
            }
        }, 100);
    };

    const closeFrame = () => {
        setIsModalOpen(false);
        if (iframeRef.current) {
            iframeRef.current.src = '';
        }
    };

    useEffect(() => {
        const handleFrameMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://widget.novapost.com') {
                return;
            }

            if (event.data && typeof event.data === 'object') {
                const shortName = event.data.shortName || 'Обрати відділення або поштомат';
                const city = event.data.addressParts?.city || '';
                const street = event.data.addressParts?.street || '';
                const building = event.data.addressParts?.building || '';
                const fullAddress = `${city}, вул. ${street}, ${building}`;

                setSelectedText(shortName);
                setSelectedDescription(fullAddress);
                setSelectedDepartmentId(event.data.id);

                // Call parent callback
                onSelect({
                    city: city,
                    warehouse: shortName,
                    warehouseId: event.data.id,
                    fullAddress: fullAddress
                });

                closeFrame();
                return;
            }

            if (event.data === 'closeFrame') {
                closeFrame();
            }
        };

        if (isModalOpen) {
            window.addEventListener('message', handleFrameMessage);
        }

        return () => {
            window.removeEventListener('message', handleFrameMessage);
        };
    }, [isModalOpen, selectedDepartmentId, onSelect]);

    return (
        <>
            <div 
                className="nova-poshta-button"
                onClick={openFrame}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '11px 40px 11px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    position: 'relative',
                    boxSizing: 'border-box',
                    minHeight: '60px',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00075e';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.9401 16.4237H16.0596V21.271H19.2101L15.39 25.0911C14.6227 25.8585 13.3791 25.8585 12.6118 25.0911L8.79166 21.271H11.9401V16.4237ZM21.2688 19.2102V8.78972L25.091 12.6098C25.8583 13.3772 25.8583 14.6207 25.091 15.3881L21.2688 19.2102ZM16.0596 6.73099V11.5763H11.9401V6.73099H8.78958L12.6097 2.90882C13.377 2.14148 14.6206 2.14148 15.3879 2.90882L19.2101 6.73099H16.0596ZM2.90868 12.6098L6.72877 8.78972V19.2102L2.90868 15.3901C2.14133 14.6228 2.14133 13.3772 2.90868 12.6098Z" fill="#DA291C"/>
                    </svg>
                </div>
                <div style={{ 
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: '20px',
                    height: '16px'
                }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.49399 1.44891L10.0835 5.68541L10.1057 5.70593C10.4185 5.99458 10.6869 6.24237 10.8896 6.4638C11.1026 6.69642 11.293 6.95179 11.4023 7.27063C11.5643 7.74341 11.5643 8.25668 11.4023 8.72946C11.293 9.0483 11.1026 9.30367 10.8896 9.53629C10.6869 9.75771 10.4184 10.0055 10.1057 10.2942L10.0835 10.3147L5.49398 14.5511L4.47657 13.4489L9.06607 9.21246C9.40722 8.89756 9.62836 8.69258 9.78328 8.52338C9.93272 8.36015 9.96962 8.28306 9.98329 8.24318C10.0373 8.08559 10.0373 7.9145 9.98329 7.7569C9.96963 7.71702 9.93272 7.63993 9.78328 7.4767C9.62837 7.3075 9.40722 7.10252 9.06608 6.78761L4.47656 2.55112L5.49399 1.44891Z" fill="#6b7280"/>
                    </svg>
                </div>
                <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500
                }}>
                    <span style={{
                        fontSize: '16px',
                        lineHeight: '21px',
                        color: '#00075e',
                        fontWeight: 500,
                        marginBottom: selectedText ? '5px' : '0'
                    }}>
                        {selectedText}
                    </span>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '18px',
                        color: '#6b7280'
                    }}>
                        {selectedDescription}
                    </span>
                </div>
            </div>

            {isModalOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                    onClick={closeFrame}
                >
                    <div 
                        style={{
                            position: 'relative',
                            width: '80%',
                            height: '80%',
                            backgroundColor: 'white',
                            overflow: 'hidden',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            borderRadius: '8px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header style={{
                            position: 'relative',
                            height: '80px',
                            padding: '0 20px',
                            borderBottom: '1px solid #E2E8F0',
                            lineHeight: '80px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#000'
                            }}>
                                Вибрати відділення
                            </h2>
                            <span 
                                onClick={closeFrame}
                                style={{
                                    cursor: 'pointer',
                                    fontSize: '32px',
                                    color: '#333',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                &times;
                            </span>
                        </header>
                        <iframe 
                            ref={iframeRef}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 81px)',
                                border: 'none'
                            }}
                            allow="geolocation"
                        />
                    </div>
                </div>
            )}

            <style jsx>{`
                @media screen and (max-width: 767px) {
                    .nova-poshta-button {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}
