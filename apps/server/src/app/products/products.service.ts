import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@p2p/db';
import { CreateProductDto, UpdateProductDto } from '@p2p/shared/types';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, sellerId: string) {
    const { title, description, price, category, condition, images } = createProductDto;
    
    return this.prisma.listing.create({
      data: {
        title,
        description,
        price,
        category,
        condition,
        images: images || [],
        sellerId,
        status: 'ACTIVE', // Default status
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ListingWhereUniqueInput;
    where?: Prisma.ListingWhereInput;
    orderBy?: Prisma.ListingOrderByWithRelationInput;
    includeOffers?: boolean;
  }) {
    const { skip, take, cursor, where, orderBy, includeOffers } = params;
    
    // Map 'product' where inputs to 'listing' where inputs if needed
    // In this case, since we just map back to prisma, we use the Listing types
    
    return this.prisma.listing.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        seller: { select: { id: true, name: true, email: true } },
        offers: includeOffers
          ? {
              select: {
                id: true,
                status: true,
                amount: true,
                buyerId: true,
                createdAt: true,
                buyer: { select: { id: true, name: true, email: true } },
              },
            }
          : undefined,
      },
    });
  }

  async findOne(id: string) {
    // Rename variable to product
    const product = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: { id: true, name: true, email: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const product = await this.findOne(id);
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You can only edit your own products');
    }
    
    const { status, ...rest } = updateProductDto;
    
    return this.prisma.listing.update({
      where: { id },
      data: {
        ...rest,
        status: status as any // Cast if enum names match
      },
    });
  }

  async remove(id: string, userId: string) {
     const product = await this.findOne(id);
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }
    return this.prisma.listing.delete({ where: { id } });
  }
}
