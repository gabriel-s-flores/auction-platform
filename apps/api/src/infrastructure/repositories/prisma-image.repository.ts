import type { Image } from "#domain/entities/image";
import type {
  CreateImageInput,
  ImageRepository
} from "#domain/repositories/image-repository";
import { prisma } from "#infrastructure/database/prisma-client";

function mapImage(model: {
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
}): Image {
  return {
    id: model.id,
    auctionId: model.auctionId,
    url: model.url,
    publicId: model.publicId,
    alt: model.alt,
    position: model.position,
    isPrimary: model.isPrimary,
    mimeType: model.mimeType,
    size: model.size,
    createdAt: model.createdAt,
  };
}

export class PrismaImageRepository implements ImageRepository {
  async findByAuctionId(auctionId: string): Promise<Image[]> {
    const images = await prisma.image.findMany({
      where: { auctionId },
      orderBy: { position: "asc" },
    });
    return images.map(mapImage);
  }

  async findById(imageId: string): Promise<Image | null> {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });
    return image ? mapImage(image) : null;
  }

  async create(input: CreateImageInput): Promise<Image> {
    const image = await prisma.image.create({
      data: {
        auctionId: input.auctionId,
        url: input.url,
        publicId: input.publicId,
        alt: input.alt,
        position: input.position,
        isPrimary: input.isPrimary,
        mimeType: input.mimeType,
        size: input.size,
      },
    });
    return mapImage(image);
  }

  async createMany(inputs: CreateImageInput[]): Promise<Image[]> {
    const images = await prisma.$transaction(
      inputs.map(input =>
        prisma.image.create({
          data: {
            auctionId: input.auctionId,
            url: input.url,
            publicId: input.publicId,
            alt: input.alt,
            position: input.position,
            isPrimary: input.isPrimary,
            mimeType: input.mimeType,
            size: input.size,
          },
        })
      )
    );
    return images.map(mapImage);
  }

  async delete(imageId: string): Promise<void> {
    await prisma.image.delete({
      where: { id: imageId },
    });
  }

  async deleteByAuctionId(auctionId: string): Promise<void> {
    await prisma.image.deleteMany({
      where: { auctionId },
    });
  }

  async updatePositions(
    positions: { id: string; position: number; isPrimary: boolean }[]
  ): Promise<void> {
    await prisma.$transaction(
      positions.map(p =>
        prisma.image.update({
          where: { id: p.id },
          data: { position: p.position, isPrimary: p.isPrimary },
        })
      )
    );
  }

  async getNextPosition(auctionId: string): Promise<number> {
    const result = await prisma.image.aggregate({
      where: { auctionId },
      _max: { position: true },
    });
    return (result._max.position ?? -1) + 1;
  }
}
