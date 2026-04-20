import type { AuctionDto, ImageDto } from "@auction/shared-types";

interface MockImageOptions {
  accentColor?: string;
  backgroundColor?: string;
  isPrimary?: boolean;
  position?: number;
}

const imagePalette = [
  { accentColor: "#f59e0b", backgroundColor: "#0f172a" },
  { accentColor: "#bfdbfe", backgroundColor: "#1d4ed8" },
  { accentColor: "#a7f3d0", backgroundColor: "#065f46" },
  { accentColor: "#fecdd3", backgroundColor: "#9f1239" },
] as const;

function createMockImageUrl(label: string, backgroundColor: string, accentColor: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="background" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${backgroundColor}" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#background)" rx="36" />
      <circle cx="930" cy="180" r="170" fill="${accentColor}" fill-opacity="0.22" />
      <circle cx="250" cy="720" r="210" fill="${accentColor}" fill-opacity="0.18" />
      <rect x="120" y="140" width="420" height="520" rx="32" fill="rgba(255,255,255,0.08)" />
      <rect x="620" y="220" width="360" height="24" rx="12" fill="rgba(255,255,255,0.25)" />
      <rect x="620" y="276" width="280" height="18" rx="9" fill="rgba(255,255,255,0.16)" />
      <rect x="620" y="324" width="220" height="18" rx="9" fill="rgba(255,255,255,0.16)" />
      <text x="620" y="470" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="76" font-weight="700">
        ${label}
      </text>
      <text x="620" y="540" fill="${accentColor}" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="600">
        Storybook mock
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getPalette(position: number) {
  return imagePalette[position % imagePalette.length] ?? imagePalette[0];
}

export function createStoryImage(id: string, label: string, options: MockImageOptions = {}): ImageDto {
  const position = options.position ?? 0;
  const palette = getPalette(position);
  const backgroundColor = options.backgroundColor ?? palette.backgroundColor;
  const accentColor = options.accentColor ?? palette.accentColor;
  const url = createMockImageUrl(label, backgroundColor, accentColor);

  return {
    id,
    url,
    thumbnailUrl: url,
    alt: label,
    position,
    isPrimary: options.isPrimary ?? false,
  };
}

export function normalizeStoryImages(images: ImageDto[]): ImageDto[] {
  if (!images.length) {
    return [];
  }

  const primaryId = images.find((image) => image.isPrimary)?.id ?? images[0]?.id;

  return images.map((image, index) => ({
    ...image,
    isPrimary: image.id === primaryId,
    position: index,
  }));
}

export const placeholderImageUrl = createMockImageUrl(
  "Carregando imagem",
  "#cbd5e1",
  "#e2e8f0"
);

export const missingImageUrl = "/__missing-storybook-image__.png";

export const mockGalleryImages = normalizeStoryImages([
  createStoryImage("image-1", "Pulseira dourada", { isPrimary: true, position: 0 }),
  createStoryImage("image-2", "Detalhe lateral", { position: 1 }),
  createStoryImage("image-3", "Caixa original", { position: 2 }),
]);

const baseAuction: AuctionDto = {
  id: "auction-base",
  title: "Relógio mecânico vintage",
  description: "Peça revisada, com caixa original e certificado de autenticidade.",
  startingPrice: 3500,
  highestBid: 4200,
  status: "OPEN",
  endsAt: "2026-12-31T23:59:59.000Z",
  sellerId: "seller-1",
  version: 3,
  rejectionReason: null,
  approvedById: "admin-1",
  approvedAt: "2026-04-18T20:00:00.000Z",
  createdAt: "2026-04-15T12:00:00.000Z",
  updatedAt: "2026-04-19T20:00:00.000Z",
  images: mockGalleryImages,
};

export function createAuction(overrides: Partial<AuctionDto>): AuctionDto {
  return {
    ...baseAuction,
    ...overrides,
  };
}

export const openAuction = createAuction({
  id: "auction-open",
  title: "Relógio mecânico vintage",
  highestBid: 4200,
  status: "OPEN",
});

export const criticalAuction = createAuction({
  id: "auction-critical",
  title: "Bolsa de coleção em couro italiano",
  highestBid: 9800,
  status: "OPEN",
});

export const closedAuction = createAuction({
  id: "auction-closed",
  title: "Câmera analógica edição limitada",
  highestBid: 5600,
  status: "CLOSED",
});

export const openTimeRemaining = {
  isExpired: false,
  isCritical: false,
  isWarning: false,
  formattedTime: "06:45:12",
  displayText: "Encerra em 6 horas e 45 minutos",
};

export const criticalTimeRemaining = {
  isExpired: false,
  isCritical: true,
  isWarning: true,
  formattedTime: "00:01:42",
  displayText: "Prorrogação ativa",
};

export const closedTimeRemaining = {
  isExpired: true,
  isCritical: false,
  isWarning: false,
  formattedTime: "00:00:00",
  displayText: "Encerrado",
};