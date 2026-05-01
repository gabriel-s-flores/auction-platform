import type { AuctionDto } from "@auction/shared-types";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import type { LinkProps } from "react-router-dom";

import { SPRING_SNAPPY, staggerItemCards } from "../utils/animation-utils";
import { getThumbnailByPreset } from "../utils/image-utils";

export interface AuctionCardProps {
  auction: AuctionDto;
  timeRemaining: {
    isExpired: boolean;
    isCritical: boolean;
    isWarning: boolean;
    formattedTime: string;
    displayText: string;
  };
  linkComponent: ComponentType<LinkProps>;
  onPlaceBid?: (auctionId: string) => void;
  /** Ativa o efeito hover "pop" (lift). Desativado por padrão. */
  enableHoverPop?: boolean;
}

const ImagePlaceholder = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
    <svg
      className="h-12 w-12 text-stone-300"
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
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const isOpen = status === "OPEN";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isOpen
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
          : "bg-stone-100 text-stone-600"
      }`}
    >
      {isOpen ? "Aberto" : "Encerrado"}
    </span>
  );
};

const TimerIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExtensionIndicator = () => (
  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
    <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
  </div>
);

export function AuctionCard({
  auction,
  timeRemaining,
  linkComponent: Link,
  onPlaceBid,
  enableHoverPop = false,
}: AuctionCardProps) {
  const hasImage = auction.images && auction.images.length > 0;
  const primaryImage = auction.images?.find((img: { isPrimary: boolean }) => img.isPrimary) ?? auction.images?.[0];
  // Use getThumbnailByPreset for better quality (400x400 with q_auto:best,f_auto)
  const thumbnailUrl = primaryImage?.url ? getThumbnailByPreset(primaryImage.url, "card") : null;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);

  const getTimerColor = () => {
    if (timeRemaining.isExpired) return "text-stone-400";
    if (timeRemaining.isCritical) return "text-rose-600";
    if (timeRemaining.isWarning) return "text-amber-600";
    return "text-slate-700";
  };

  const LinkComponent = Link;

  return (
    <motion.div
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow duration-200 hover:border-stone-300 hover:shadow-lg"
      variants={staggerItemCards}
      whileHover={
        enableHoverPop
          ? { y: -3, transition: SPRING_SNAPPY }
          : undefined
      }
    >
      {/* Image container - 1:1 aspect ratio */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {hasImage && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={auction.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}

        {/* Status badge overlay */}
        <div className="absolute left-3 top-3">
          <StatusBadge status={auction.status} />
        </div>

        {/* Anti-sniping extension indicator */}
        {timeRemaining.isCritical && !timeRemaining.isExpired && <ExtensionIndicator />}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-lg font-semibold leading-tight text-slate-900">
          {auction.title}
        </h3>

        {/* Timer - prominente com tabular-nums */}
        <div className="mt-3 flex items-center gap-2">
          <TimerIcon
            className={`h-4 w-4 flex-shrink-0 ${
              timeRemaining.isCritical ? "text-rose-500 animate-pulse" : getTimerColor()
            }`}
          />
          <span
            className={`timer-display text-2xl ${getTimerColor()} ${
              timeRemaining.isCritical ? "animate-countdown-pulse" : ""
            }`}
          >
            {timeRemaining.formattedTime}
          </span>
        </div>
        {timeRemaining.isCritical && !timeRemaining.isExpired && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            <span className="text-xs font-medium text-rose-600">Prorrogação ativa</span>
          </div>
        )}
        {/* Price - highlighted */}
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-sm text-slate-500">Maior lance:</span>
          <span className="price-display text-xl text-slate-900">
            {formatPrice(auction.highestBid)}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Buttons */}
        <div className="mt-4 flex gap-2">
          <LinkComponent
            to={auction.id ? `/auctions/${auction.id}` : `#`}
            className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Ver detalhes
          </LinkComponent>
          <button
            type="button"
            onClick={() => onPlaceBid?.(auction.id)}
            disabled={auction.status !== "OPEN" || timeRemaining.isExpired}
            className="flex-1 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Dar lance
          </button>
        </div>
      </div>
    </motion.div>
  );
}