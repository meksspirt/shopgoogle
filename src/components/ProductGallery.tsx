'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function ProductGallery({ images }: { images: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    // If no images, show placeholder
    const displayImages = images && images.length > 0
        ? images
        : [images[0]];

    const slides = displayImages.map(src => ({ src }));

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    return (
        <>
            <div className="position-relative">
                {/* Main Image */}
                <div
                    className="position-relative"
                    style={{ height: '500px', width: '100%', cursor: 'pointer', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}
                    onClick={() => setLightboxIndex(currentIndex)}
                >
                    <Image
                        src={displayImages[currentIndex]}
                        alt={`Product image ${currentIndex + 1}`}
                        fill
                        className="object-fit-contain"
                    />

                    {/* Navigation Arrows */}
                    {displayImages.length > 1 && (
                        <>
                            <button
                                className="position-absolute top-50 start-0 translate-middle-y btn btn-light btn-sm ms-2"
                                style={{ zIndex: 10, opacity: 0.8 }}
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            >
                                ‹
                            </button>
                            <button
                                className="position-absolute top-50 end-0 translate-middle-y btn btn-light btn-sm me-2"
                                style={{ zIndex: 10, opacity: 0.8 }}
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>

                {/* Indicator Dots */}
                {displayImages.length > 1 && (
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        {displayImages.map((_, index) => (
                            <button
                                key={index}
                                className="btn p-0 border-0"
                                onClick={() => setCurrentIndex(index)}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: index === currentIndex ? '#000' : '#ccc',
                                    transition: 'all 0.3s ease'
                                }}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Thumbnail Strip */}
                {displayImages.length > 1 && (
                    <div className="d-flex gap-2 mt-3 overflow-auto pb-2">
                        {displayImages.map((src, index) => (
                            <div
                                key={index}
                                className={`position-relative flex-shrink-0 ${index === currentIndex ? 'border border-2 border-dark' : 'border'}`}
                                style={{ width: '80px', height: '80px', cursor: 'pointer', borderRadius: '4px', overflow: 'hidden' }}
                                onClick={() => setCurrentIndex(index)}
                            >
                                <Image
                                    src={src}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-fit-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Lightbox
                open={lightboxIndex >= 0}
                index={lightboxIndex}
                close={() => setLightboxIndex(-1)}
                slides={slides}
            />
        </>
    );
}
