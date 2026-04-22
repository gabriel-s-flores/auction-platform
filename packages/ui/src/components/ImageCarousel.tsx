import type { ImageDto } from "@auction/shared-types";
import type {
  CSSProperties,
  TouchEvent as ReactTouchEvent,
} from "react";
import { useCallback, useEffect, useState } from "react";

import { getThumbnailByPreset } from "../utils/image-utils";

export interface ImageCarouselProps {
  images: ImageDto[];
  className?: string;
}

interface ThumbnailRenderState {
  src: string;
  hasFallback: boolean;
  hasError: boolean;
}

const MAIN_FRAME_STYLE: CSSProperties = {
  aspectRatio: "4 / 3",
};

const THUMBNAIL_STYLE: CSSProperties = {
  width: "4rem",
  height: "4rem",
};

const PREVIEW_IMAGE_STYLE: CSSProperties = {
  maxWidth: "min(96vw, 1200px)",
  maxHeight: "88vh",
};

const PREVIEW_FALLBACK_STYLE: CSSProperties = {
  width: "80vw",
  maxWidth: "80rem",
  height: "60vh",
};

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
        {compact ? null : (
          <p className="mt-2 text-sm text-slate-500">Não foi possível carregar a imagem</p>
        )}
      </div>
    </div>
  );
}

function getThumbnailSource(image: ImageDto): string {
  return image.thumbnailUrl || getThumbnailByPreset(image.url, "strip") || image.url;
}

function getInitialThumbnailRenderState(image: ImageDto): ThumbnailRenderState {
  return {
    src: getThumbnailSource(image),
    hasFallback: false,
    hasError: false,
  };
}

interface NavigationButtonProps {
  direction: "next" | "prev";
  onClick: () => void;
}

function NavigationButton({ direction, onClick }: NavigationButtonProps) {
  const isNext = direction === "next";

  return (
    <button
      type="button"
      className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-md transition hover:bg-white ${
        isNext ? "right-3" : "left-3"
      }`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={isNext ? "Próxima imagem" : "Imagem anterior"}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={isNext ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
        />
      </svg>
    </button>
  );
}

export function ImageCarousel({ images, className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [failedMainImages, setFailedMainImages] = useState<Record<string, boolean>>({});
  const [thumbnailStates, setThumbnailStates] = useState<Record<string, ThumbnailRenderState>>({});

  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setCurrentIndex((previousIndex) => {
      if (images.length === 0) {
        return 0;
      }

      return previousIndex >= images.length ? 0 : previousIndex;
    });
  }, [images.length]);

  const currentImage = images[currentIndex];

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((previousIndex) => {
      if (images.length === 0) {
        return 0;
      }

      return (previousIndex + 1) % images.length;
    });
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((previousIndex) => {
      if (images.length === 0) {
        return 0;
      }

      return (previousIndex - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const openPreview = useCallback(() => {
    if (!currentImage || failedMainImages[currentImage.id]) {
      return;
    }

    setIsPreviewOpen(true);
  }, [currentImage, failedMainImages]);

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
        return;
      }

      if (!hasMultipleImages) {
        return;
      }

      if (event.key === "ArrowRight") {
        goToNext();
      }

      if (event.key === "ArrowLeft") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePreview, goToNext, goToPrev, hasMultipleImages, isPreviewOpen]);

  const getThumbnailState = useCallback(
    (image: ImageDto): ThumbnailRenderState => {
      return thumbnailStates[image.id] ?? getInitialThumbnailRenderState(image);
    },
    [thumbnailStates]
  );

  const handleMainImageError = useCallback((imageId: string) => {
    setFailedMainImages((previousState) => ({
      ...previousState,
      [imageId]: true,
    }));
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

  const handleTouchStart = useCallback((event: ReactTouchEvent<HTMLElement>) => {
    const touch = event.targetTouches[0];
    setTouchStartX(touch?.clientX ?? null);
  }, []);

  const handleTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      if (!hasMultipleImages || touchStartX === null) {
        setTouchStartX(null);
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        setTouchStartX(null);
        return;
      }

      const distance = touchStartX - touch.clientX;
      if (Math.abs(distance) > 50) {
        if (distance > 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }

      setTouchStartX(null);
    },
    [goToNext, goToPrev, hasMultipleImages, touchStartX]
  );

  if (!images.length) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-lg border border-stone-200 bg-slate-100 ${className}`}
        style={MAIN_FRAME_STYLE}
      >
        <div className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
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

  if (!currentImage) {
    return null;
  }

  const currentImageFailed = failedMainImages[currentImage.id] === true;

  return (
    <>
      <div className={className}>
        <div
          className="relative overflow-hidden rounded-lg border border-stone-200 bg-slate-100 shadow-sm"
          style={MAIN_FRAME_STYLE}
          aria-label="Galeria de imagens do leilão"
        >
          {currentImageFailed ? (
            <ImageErrorPlaceholder />
          ) : (
            <button
              type="button"
              className="block h-full w-full cursor-zoom-in focus:outline-none"
              onClick={openPreview}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              aria-label="Abrir visualização ampliada da imagem"
            >
              <img
                src={currentImage.url}
                alt={currentImage.alt || `Imagem ${currentIndex + 1}`}
                className="block h-full w-full object-cover"
                loading="eager"
                onError={() => {
                  handleMainImageError(currentImage.id);
                }}
              />
            </button>
          )}

          {currentImage.isPrimary ? (
            <div className="absolute left-3 top-3 rounded-full bg-primary-600 px-2 py-1 text-xs text-white">
              Principal
            </div>
          ) : null}

          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
            {currentIndex + 1} / {images.length}
          </div>

          {hasMultipleImages ? (
            <>
              <NavigationButton direction="prev" onClick={goToPrev} />
              <NavigationButton direction="next" onClick={goToNext} />
            </>
          ) : null}
        </div>

        {hasMultipleImages ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => {
              const thumbnailState = getThumbnailState(image);
              const isSelected = index === currentIndex;

              return (
                <button
                  key={image.id}
                  type="button"
                  className={`relative flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    isSelected
                      ? "border-primary-600 ring-2 ring-primary-200"
                      : "border-transparent hover:border-slate-300"
                  }`}
                  style={THUMBNAIL_STYLE}
                  onClick={() => goToSlide(index)}
                  aria-label={`Selecionar imagem ${index + 1}`}
                  aria-pressed={isSelected}
                >
                  {thumbnailState.hasError ? (
                    <ImageErrorPlaceholder compact />
                  ) : (
                    <img
                      src={thumbnailState.src}
                      alt={image.alt || `Miniatura ${index + 1}`}
                      className="block h-full w-full object-cover"
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
        ) : null}

        {hasMultipleImages ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((image, index) => {
              const isSelected = index === currentIndex;

              return (
                <button
                  key={image.id}
                  type="button"
                  className={`h-2 w-2 rounded-full transition ${
                    isSelected ? "bg-primary-600" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Ir para imagem ${index + 1}`}
                  aria-pressed={isSelected}
                />
              );
            })}
          </div>
        ) : null}
      </div>

      {isPreviewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da imagem"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-transparent"
            onClick={closePreview}
            aria-label="Fechar visualização ampliada ao clicar fora da imagem"
          />

          <button
            type="button"
            className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={closePreview}
            aria-label="Fechar visualização ampliada"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {hasMultipleImages ? (
            <>
              <NavigationButton direction="prev" onClick={goToPrev} />
              <NavigationButton direction="next" onClick={goToNext} />
            </>
          ) : null}

          <div
            className="relative z-10 flex max-h-full max-w-full items-center justify-center"
          >
            {currentImageFailed ? (
              <div style={PREVIEW_FALLBACK_STYLE}>
                <ImageErrorPlaceholder />
              </div>
            ) : (
              <img
                src={currentImage.url}
                alt={currentImage.alt || `Imagem ${currentIndex + 1}`}
                className="rounded-lg object-contain"
                style={PREVIEW_IMAGE_STYLE}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
