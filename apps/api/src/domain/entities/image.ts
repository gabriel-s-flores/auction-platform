export interface Image {
  id: string;
  auctionId: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  position: number;
  isPrimary: boolean;
  mimeType: string;
  size: number;
  createdAt: Date;
}
