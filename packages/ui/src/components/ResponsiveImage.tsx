import { type ReactNode, useState } from "react";

import { generateSrcset, getCarouselSizes, getResponsiveUrls } from "../utils/image-utils";

export interface ResponsiveImageProps {
	/** Image URL */
	src: string;
	/** Alt text for accessibility */
	alt: string;
	/** Additional CSS classes */
	className?: string;
	/** Loading strategy - eager for above-fold, lazy for below-fold */
	loading?: "eager" | "lazy";
	/** Sizes attribute for srcset */
	sizes?: string;
	/** Placeholder blur URL (LQIP) */
	placeholderUrl?: string;
	/** Custom style */
	style?: React.CSSProperties;
	/** Click handler - when provided, renders as a button */
	onClick?: () => void;
	/** Children to overlay on the image */
	children?: ReactNode;
}

/**
 * Responsive image component with srcset for different viewport sizes
 * Uses Cloudinary transformations for optimal image delivery
 */
export function ResponsiveImage({
	src,
	alt,
	className = "",
	loading = "lazy",
	sizes,
	placeholderUrl,
	style,
	onClick,
	children,
}: ResponsiveImageProps) {
	const urls = getResponsiveUrls(src);
	const srcset = generateSrcset(urls);
	const imageSizes = sizes || getCarouselSizes();

	const [isLoaded, setIsLoaded] = useState(false);
	const [isError, setIsError] = useState(false);

	if (isError) {
		return (
			<div
				className={`flex items-center justify-center bg-slate-100 ${className}`}
				style={style}
			>
				<div className="text-center p-4">
					<svg
						className="w-8 h-8 mx-auto text-slate-400"
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
					<p className="mt-1 text-xs text-slate-500">Image not found</p>
				</div>
			</div>
		);
	}

	const imageElement = (
		<img
			src={urls.medium}
			srcSet={srcset}
			sizes={imageSizes}
			alt={alt}
			loading={loading}
			className={`w-full h-full object-cover transition-opacity duration-300 ${
				placeholderUrl && !isLoaded ? "opacity-0" : "opacity-100"
			}`}
			onLoad={() => setIsLoaded(true)}
			onError={() => setIsError(true)}
		/>
	);

	return (
		<div className={`relative overflow-hidden ${className}`} style={style}>
			{/* Blur placeholder */}
			{placeholderUrl && !isLoaded && (
				<img
					src={placeholderUrl}
					alt=""
					className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
					style={{ filter: "blur(10px)", transform: "scale(1.1)" }}
					aria-hidden="true"
				/>
			)}

			{/* Main responsive image - wrapped in button if interactive */}
			{onClick ? (
				<button
					type="button"
					onClick={onClick}
					className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
				>
					{imageElement}
				</button>
			) : (
				imageElement
			)}

			{/* Children overlay */}
			{children && (
				<div className="absolute inset-0 pointer-events-none">
					{children}
				</div>
			)}
		</div>
	);
}
