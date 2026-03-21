-- CreateTable
CREATE TABLE "images" (
    "id" UUID NOT NULL,
    "auctionId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "images_auctionId_idx" ON "images"("auctionId");

-- CreateIndex
CREATE INDEX "images_auctionId_position_idx" ON "images"("auctionId", "position");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
