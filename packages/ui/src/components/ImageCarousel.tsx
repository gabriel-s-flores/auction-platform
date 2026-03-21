import type { ImageDto } from "@auction/shared-types";
import { useCallback, useEffect, useState } from "react";

export interface ImageCarouselProps {
 images: ImageDto[];
 className?: string;
}

export function ImageCarousel({ images, className = "" }: ImageCarouselProps) {
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isLightboxOpen, setIsLightboxOpen] = useState(false);
 const [touchStart, setTouchStart] = useState<number | null>(null);
 const [touchEnd, setTouchEnd] = useState<number | null>(null);

 const minSwipeDistance = 50;

 const goToNext = useCallback(() => {
 setCurrentIndex((prev) => (prev + 1) % images.length);
 }, [images.length]);

 const goToPrev = useCallback(() => {
 setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
 }, [images.length]);

 const goToSlide = useCallback((index: number) => {
 setCurrentIndex(index);
 }, []);

 const openLightbox = useCallback(() => {
 setIsLightboxOpen(true);
 }, []);

 const closeLightbox = useCallback(() => {
 setIsLightboxOpen(false);
 }, []);

 const handleLightboxKeyDown = useCallback(
 (e: React.KeyboardEvent) => {
 switch (e.key) {
 case "ArrowLeft":
 goToPrev();
 break;
 case "ArrowRight":
 goToNext();
 break;
 case "Escape":
 closeLightbox();
 break;
 }
 },
 [goToNext, goToPrev, closeLightbox]
 );

 // Global keyboard navigation for lightbox
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (!isLightboxOpen) return;

 switch (e.key) {
 case "ArrowLeft":
 goToPrev();
 break;
 case "ArrowRight":
 goToNext();
 break;
 case "Escape":
 closeLightbox();
 break;
 }
 };

 window.addEventListener("keydown", handleKeyDown);
 return () => window.removeEventListener("keydown", handleKeyDown);
 }, [isLightboxOpen, goToNext, goToPrev, closeLightbox]);

 // Touch handlers for mobile swipe
 const onTouchStart = (e: React.TouchEvent) => {
 setTouchEnd(null);
 const touch = e.targetTouches[0];
 if (touch) setTouchStart(touch.clientX);
 };

 const onTouchMove = (e: React.TouchEvent) => {
 const touch = e.targetTouches[0];
 if (touch) setTouchEnd(touch.clientX);
 };

 const onTouchEnd = () => {
 if (!touchStart || !touchEnd) return;

 const distance = touchStart - touchEnd;
 const isLeftSwipe = distance > minSwipeDistance;
 const isRightSwipe = distance < -minSwipeDistance;

 if (isLeftSwipe) {
 goToNext();
 } else if (isRightSwipe) {
 goToPrev();
 }
 };

 if (!images.length) {
 return (
 <div className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`}>
 <div className="text-center p-8">
 <svg
 className="w-12 h-12 mx-auto text-slate-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={1.5}
 d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
 />
 </svg>
 <p className="mt-2 text-sm text-slate-500">Sem imagens</p>
 </div>
 </div>
 );
 }

 const currentImage = images[currentIndex];
 if (!currentImage) {
 return null; // Should not happen after the length check
 }

 return (
 <>
 {/* Main carousel */}
 <div className={`relative ${className}`}>
 {/* Main image */}
 <div
 className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 cursor-pointer"
 onClick={openLightbox}
 onKeyDown={(e) => {
 if (e.key === "Enter" || e.key === " ") {
 e.preventDefault();
 openLightbox();
 }
 }}
 onTouchStart={onTouchStart}
 onTouchMove={onTouchMove}
 onTouchEnd={onTouchEnd}
 role="button"
 tabIndex={0}
 aria-label="Abrir visualização ampliada"
 >
 {images.map((image, index) => (
 <div
 key={image.id}
 className={`absolute inset-0 transition-opacity duration-300 ease-out ${
 index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
 }`}
 >
 <img
 src={image.url}
 alt={image.alt || `Imagem ${index + 1}`}
 className="w-full h-full object-cover"
 loading={index === 0 ? "eager" : "lazy"}
 />
 </div>
 ))}

 {/* Counter badge */}
 <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
 {currentIndex + 1} / {images.length}
 </div>

 {/* Primary badge */}
 {currentImage.isPrimary && (
 <div className="absolute top-3 left-3 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
 Principal
 </div>
 )}

 {/* Navigation arrows */}
 {images.length > 1 && (
 <>
 <button
 type="button"
 className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition"
 onClick={(e) => {
 e.stopPropagation();
 goToPrev();
 }}
 aria-label="Imagem anterior"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 </button>
 <button
 type="button"
 className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition"
 onClick={(e) => {
 e.stopPropagation();
 goToNext();
 }}
 aria-label="Próxima imagem"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </button>
 </>
 )}
 </div>

 {/* Thumbnail strip */}
 {images.length > 1 && (
 <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
 {images.map((image, index) => (
 <button
 key={image.id}
 type="button"
 className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
 index === currentIndex
 ? "border-primary-600 ring-2 ring-primary-200"
 : "border-transparent hover:border-slate-300"
 }`}
 onClick={() => goToSlide(index)}
 >
 <img
 src={image.thumbnailUrl}
 alt={image.alt || `Miniatura ${index + 1}`}
 className="w-full h-full object-cover"
 />
 </button>
 ))}
 </div>
 )}

 {/* Dot indicators */}
 {images.length > 1 && (
 <div className="flex justify-center gap-1.5 mt-3">
 {images.map((_, index) => (
 <button
 key={index}
 type="button"
 className={`w-2 h-2 rounded-full transition ${
 index === currentIndex ? "bg-primary-600" : "bg-slate-300 hover:bg-slate-400"
 }`}
 onClick={() => goToSlide(index)}
 aria-label={`Ir para imagem ${index + 1}`}
 />
 ))}
 </div>
 )}
 </div>

 {/* Lightbox */}
 {isLightboxOpen && (
 <div
 className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
 onClick={closeLightbox}
 onKeyDown={handleLightboxKeyDown}
 role="button"
 tabIndex={0}
 aria-label="Fechar visualização ampliada"
 >
 {/* Close button */}
 <button
 type="button"
 className="absolute top-4 right-4 text-white/80 hover:text-white transition"
 onClick={closeLightbox}
 aria-label="Fechar"
 >
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>

 {/* Navigation in lightbox */}
 {images.length > 1 && (
 <>
 <button
 type="button"
 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition p-2"
 onClick={(e) => {
 e.stopPropagation();
 goToPrev();
 }}
 aria-label="Imagem anterior"
 >
 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 </button>
 <button
 type="button"
 className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition p-2"
 onClick={(e) => {
 e.stopPropagation();
 goToNext();
 }}
 aria-label="Próxima imagem"
 >
 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </button>
 </>
 )}

 {/* Image */}
 <img
 src={currentImage.url}
 alt={currentImage.alt || `Imagem ${currentIndex + 1}`}
 className="max-w-[90vw] max-h-[85vh] object-contain"
 />

 {/* Counter */}
 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full">
 {currentIndex + 1} / {images.length}
 </div>
 </div>
 )}
 </>
 );
}
