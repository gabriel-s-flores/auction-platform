import "yet-another-react-lightbox/styles.css";

import type { ImageDto } from "@auction/shared-types";
import { useCallback, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import {
  generateSrcset,
  getCarouselSizes,
  getPlaceholderUrl,
  getResponsiveUrls,
  getThumbnailByPreset,
} from "../utils/image-utils";

export interface ImageCarouselProps {
  images: ImageDto[];
  className?: string;
}

interface MainImageRenderState {
  src: string;
  srcSet?: string;
  hasFallback: boolean;
  hasError: boolean;
}

interface ThumbnailRenderState {
  src: string;
  hasFallback: boolean;
  hasError: boolean;
}

function ImageErrorPlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
      <div className="text-center">
        <svg
          className={compact ? "mx-auto h-5 w-5" : "mx-auto h-12 w-12"}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        {!compact && <p className="mt-2 text-sm text-slate-500">Não foi possível carregar a imagem</p>}
      </div>
    </div>
  );
}

function getInitialMainImageRenderState(image: ImageDto): MainImageRenderState {
  const urls = getResponsiveUrls(image.url);

  return {
    src: urls.medium || image.url,
    srcSet: generateSrcset(urls),
    hasFallback: false,
    hasError: false,
  };
}

function getInitialThumbnailRenderState(image: ImageDto): ThumbnailRenderState {
  return {
    src: image.thumbnailUrl || getThumbnailByPreset(image.url, "card"),
    hasFallback: false,
    hasError: false,
  };
}

export function ImageCarousel({ images, className = "" }: ImageCarouselProps) {
  const carouselAspectRatio = "4 / 3";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [mainImageStates, setMainImageStates] = useState<Record<string, MainImageRenderState>>({});
  const [thumbnailStates, setThumbnailStates] = useState<Record<string, ThumbnailRenderState>>({});

  const minSwipeDistance = 50;

  const getMainImageState = useCallback(
    (image: ImageDto): MainImageRenderState => {
      return mainImageStates[image.id] ?? getInitialMainImageRenderState(image);
    },
    [mainImageStates]
  );

  const getThumbnailState = useCallback(
    (image: ImageDto): ThumbnailRenderState => {
      return thumbnailStates[image.id] ?? getInitialThumbnailRenderState(image);
    },
    [thumbnailStates]
  );

  const handleMainImageError = useCallback((image: ImageDto) => {
    setMainImageStates((previousStates) => {
      const currentState = previousStates[image.id] ?? getInitialMainImageRenderState(image);

      if (!currentState.hasFallback && currentState.src !== image.url) {
        return {
          ...previousStates,
          [image.id]: {
            src: image.url,
            srcSet: undefined,
            hasFallback: true,
            hasError: false,
          },
        };
      }

      return {
        ...previousStates,
        [image.id]: {
          ...currentState,
          src: image.url,
          srcSet: undefined,
          hasFallback: true,
          hasError: true,
        },
      };
    });
  }, []);

  const handleThumbnailError = useCallback((image: ImageDto) => {
    setThumbnailStates((previousStates) => {
      const currentState = previousStates[image.id] ?? getInitialThumbnailRenderState(image);

      if (!currentState.hasFallback && currentState.src !== image.url) {
        return {
          ...previousStates,
          [image.id]: {
            src: image.url,
            hasFallback: true,
            hasError: false,
          },
        };
      }

      return {
        ...previousStates,
        [image.id]: {
          src: image.url,
          hasFallback: true,
          hasError: true,
        },
      };
    });
  }, []);

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

  // Touch handlers for mobile swipe on carousel
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
      <div
        className={`flex w-full items-center justify-center rounded-lg bg-slate-100 ${className}`}
        style={{ aspectRatio: carouselAspectRatio }}
      >
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
    return null;
  }

  // Prepare slides for lightbox with high-resolution URLs
  const slides = images.map((image) => ({
    src: getResponsiveUrls(image.url).xlarge || image.url,
    alt: image.alt || `Imagem`,
  }));

  return (
    <>
      {/* Main carousel */}
      <div className={`relative ${className}`}>
        {/* Main image */}
        <div
          className="relative overflow-hidden rounded-lg bg-slate-100 cursor-pointer group"
          style={{ aspectRatio: carouselAspectRatio }}
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
          {images.map((image, index) => {
            const placeholderUrl = getPlaceholderUrl(image.url);
            const isLoaded = loadedImages.has(image.id);
            const mainImageState = getMainImageState(image);

            return (
              <div
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                  index === currentIndex
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                {/* Blur placeholder */}
                {!isLoaded && !mainImageState.hasError && (
                  <img
                    src={placeholderUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "blur(10px)", transform: "scale(1.1)" }}
                    aria-hidden="true"
                  />
                )}

                {mainImageState.hasError ? (
                  <ImageErrorPlaceholder />
                ) : (
                  <img
                    src={mainImageState.src}
                    srcSet={mainImageState.srcSet}
                    sizes={getCarouselSizes()}
                    alt={image.alt || `Imagem ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={() => {
                      handleMainImageError(image);
                    }}
                    onLoad={() => {
                      setLoadedImages((prev) => new Set(prev).add(image.id));
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Zoom hint overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          </div>

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
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
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
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((image, index) => {
              const thumbnailState = getThumbnailState(image);

              return (
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
                  {thumbnailState.hasError ? (
                    <ImageErrorPlaceholder compact />
                  ) : (
                    <img
                      src={thumbnailState.src}
                      alt={image.alt || `Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => {
                        handleThumbnailError(image);
                      }}
                    />
                  )}
                </button>
              );
            })}
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
                  index === currentIndex
                    ? "bg-primary-600"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox with zoom */}
      <Lightbox
        open={isLightboxOpen}
        close={closeLightbox}
        index={currentIndex}
        slides={slides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleClickMaxStops: 2,
          scrollToZoom: true,
          pinchZoomV4: true,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
        }}
        on={{
          view: ({ index }) => setCurrentIndex(index),
        }}
        carousel={{
          finite: false,
          spacing: "10%",
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
        render={{
          buttonPrev: images.length <= 1 ? () => null : undefined,
          buttonNext: images.length <= 1 ? () => null : undefined,
        }}
      />
    </>
  );
}
