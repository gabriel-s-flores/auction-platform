import type { ImageDto } from "@auction/shared-types";
import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useState } from "react";

export interface ImageUploaderProps {
 images: ImageDto[];
 onChange: (images: ImageDto[]) => void;
 onUpload: (files: File[]) => Promise<ImageDto[]>;
 onDelete: (imageId: string) => Promise<void>;
 maxImages?: number;
 maxSizeMB?: number;
 disabled?: boolean;
 className?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({
 images,
 onChange,
 onUpload,
 onDelete,
 maxImages = 10,
 maxSizeMB = 10,
 disabled = false,
 className = "",
}: ImageUploaderProps) {
 const [isDragging, setIsDragging] = useState(false);
 const [isUploading, setIsUploading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const maxSizeBytes = maxSizeMB * 1024 * 1024;

 const validateFiles = useCallback(
 (files: File[]): string | null => {
 // Check number of files
 if (images.length + files.length > maxImages) {
 return `Máximo de ${maxImages} imagens permitidas`;
 }

 // Check each file
 for (const file of files) {
 if (!ACCEPTED_TYPES.includes(file.type)) {
 return `Tipo não permitido: ${file.name}. Use JPEG, PNG ou WebP`;
 }
 if (file.size > maxSizeBytes) {
 return `Arquivo muito grande: ${file.name}. Máximo: ${maxSizeMB}MB`;
 }
 }

 return null;
 },
 [images.length, maxImages, maxSizeBytes, maxSizeMB]
 );

 const handleFiles = useCallback(
 async (files: File[]) => {
 setError(null);

 const validationError = validateFiles(files);
 if (validationError) {
 setError(validationError);
 return;
 }

 setIsUploading(true);
 try {
 await onUpload(files);
 // The parent component handles updating the images state via query invalidation
 } catch (err) {
 setError(err instanceof Error ? err.message : "Erro ao enviar imagens");
 } finally {
 setIsUploading(false);
 }
 },
 [validateFiles, onUpload]
 );

 const handleDrop = useCallback(
 (e: DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);

 if (disabled) return;

 const files = Array.from(e.dataTransfer.files).filter((file) =>
 ACCEPTED_TYPES.includes(file.type)
 );

 if (files.length > 0) {
 void handleFiles(files);
 }
 },
 [disabled, handleFiles]
 );

 const handleDragOver = useCallback(
 (e: DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 if (!disabled) {
 setIsDragging(true);
 }
 },
 [disabled]
 );

 const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);
 }, []);

 const handleInputChange = useCallback(
 (e: ChangeEvent<HTMLInputElement>) => {
 const files = Array.from(e.target.files || []);
 if (files.length > 0) {
 void handleFiles(files);
 }
 // Reset input value to allow re-uploading same file
 e.target.value = "";
 },
 [handleFiles]
 );

 const handleDelete = useCallback(
 async (imageId: string) => {
 setError(null);
 try {
 await onDelete(imageId);
 } catch (err) {
 setError(err instanceof Error ? err.message : "Erro ao remover imagem");
 }
 },
 [onDelete]
 );

 const handleSetPrimary = useCallback(
 (imageId: string) => {
 const updatedImages = images.map((img) => ({
 ...img,
 isPrimary: img.id === imageId,
 }));
 onChange(updatedImages);
 },
 [images, onChange]
 );

 const canAddMore = images.length < maxImages && !disabled;

 return (
 <div className={`space-y-4 ${className}`}>
 {/* Error message */}
 {error && (
 <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm">
 {error}
 </div>
 )}

 {/* Upload zone */}
 {canAddMore && (
 <div
 className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${
 isDragging
 ? "border-primary-500 bg-primary-50"
 : "border-slate-300 hover:border-primary-400 hover:bg-slate-50"
 } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
 onDrop={handleDrop}
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 >
 <input
 type="file"
 accept={ACCEPTED_TYPES.join(",")}
 multiple
 onChange={handleInputChange}
 disabled={disabled || isUploading}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
 />

 <div className="space-y-2">
 <div className="flex justify-center">
 {isUploading ? (
 <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
 ) : (
 <svg
 className="w-10 h-10 text-slate-400"
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
 )}
 </div>

 <div>
 <p className="text-sm font-medium text-slate-700">
 {isUploading ? "Enviando..." : "Arraste imagens ou clique para selecionar"}
 </p>
 <p className="text-xs text-slate-500 mt-1">
 JPEG, PNG ou WebP. Máx. {maxSizeMB}MB.
 </p>
 </div>

 <p className="text-xs text-slate-400">
 {images.length}/{maxImages} imagens
 </p>
 </div>
 </div>
 )}

 {/* Image preview grid */}
 {images.length > 0 && (
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
 {images.map((image, index) => (
 <div
 key={image.id}
 className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
 image.isPrimary ? "border-primary-600" : "border-transparent"
 }`}
 >
 <img
 src={image.thumbnailUrl || image.url}
 alt={image.alt || `Imagem ${index + 1}`}
 className="w-full h-full object-cover"
 />

 {/* Overlay with actions */}
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
 {/* Set primary button */}
 {!image.isPrimary && (
 <button
 type="button"
 onClick={() => handleSetPrimary(image.id)}
 className="bg-white text-slate-700 hover:bg-slate-100 rounded-full p-1.5 transition"
 title="Definir como principal"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
 />
 </svg>
 </button>
 )}

 {/* Delete button */}
 <button
 type="button"
 onClick={() => void handleDelete(image.id)}
 className="bg-white text-rose-600 hover:bg-rose-50 rounded-full p-1.5 transition"
 title="Remover imagem"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
 />
 </svg>
 </button>
 </div>

 {/* Primary badge */}
 {image.isPrimary && (
 <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
 Principal
 </div>
 )}
 </div>
 ))}
 </div>
 )}

 {/* Info text */}
 {images.length > 0 && images.length < maxImages && (
 <p className="text-xs text-slate-500 text-center">
 Clique em uma imagem para defini-la como principal
 </p>
 )}
 </div>
 );
}
