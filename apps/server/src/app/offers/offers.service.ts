import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@p2p/db';
import { CreateOfferDto } from '@p2p/shared/types';
import { OfferStatus, ListingStatus } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class OffersService {
  constructor(
      private prisma: PrismaService,
      private notificationsGateway: NotificationsGateway
  ) {}

  async create(createOfferDto: CreateOfferDto, buyerId: string) {
    // Rename listing to product for code consistency, though DB is listing
    const product = await this.prisma.listing.findUnique({ where: { id: createOfferDto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'ACTIVE') throw new BadRequestException('Product is not active');
    if (product.sellerId === buyerId) throw new BadRequestException('Cannot make offer on own product');

    const newOffer = await this.prisma.offer.create({
      data: {
        amount: createOfferDto.amount,
        message: createOfferDto.message,
        listingId: createOfferDto.productId, // Map productId to listingId
        buyerId,
      },
    });

    this.notificationsGateway.notifyUser(product.sellerId, {
        type: 'NEW_OFFER',
        message: `New offer of $${newOffer.amount} for ${product.title}`,
        productId: product.id,
        offerId: newOffer.id
    });

    return newOffer;
  }

  async accept(offerId: string, sellerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });

    if (!offer) throw new NotFoundException('Offer not found');
    // Map listing to product
    const product = offer.listing;

    if (product.sellerId !== sellerId) throw new ForbiddenException('Not your product');
    if (offer.status !== 'PENDING') throw new BadRequestException('Offer is not pending');

    return this.prisma.$transaction(async (tx) => {
      const acceptedOffer = await tx.offer.update({
        where: { id: offerId },
        data: { status: OfferStatus.ACCEPTED },
      });

      await tx.listing.update({
        where: { id: offer.listingId },
        data: { status: ListingStatus.SOLD },
      });

      await tx.offer.updateMany({
        where: { listingId: offer.listingId, id: { not: offerId }, status: OfferStatus.PENDING },
        data: { status: OfferStatus.DECLINED },
      });

      const transaction = await tx.transaction.create({
        data: {
          offerId: offer.id,
          buyerId: offer.buyerId,
          sellerId: sellerId,
          status: 'OFFER_ACCEPTED',
        },
      });

      this.notificationsGateway.notifyUser(offer.buyerId, {
          type: 'OFFER_ACCEPTED',
          message: `Your offer for ${product.title} was accepted!`,
          productId: offer.listingId,
          transactionId: transaction.id
      });

      return {
        ...acceptedOffer,
        transactionId: transaction.id
      };
    });
  }
  
  async decline(offerId: string, sellerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });

    if (!offer) throw new NotFoundException('Offer not found');
    const product = offer.listing;

    if (product.sellerId !== sellerId) throw new ForbiddenException('Not your product');
    
    const declinedOffer = await this.prisma.offer.update({
        where: { id: offerId },
        data: { status: OfferStatus.DECLINED },
    });

    this.notificationsGateway.notifyUser(offer.buyerId, {
        type: 'OFFER_DECLINED',
        message: `Your offer for ${product.title} was declined.`,
        productId: offer.listingId
    });

    return declinedOffer;
  }

  async withdraw(offerId: string, buyerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });

    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.buyerId !== buyerId) throw new ForbiddenException('Not your offer');
    if (offer.status !== 'PENDING') throw new BadRequestException('Cannot withdraw processed offer');
    
    const product = offer.listing;

    const withdrawnOffer = await this.prisma.offer.update({
        where: { id: offerId },
        data: { status: OfferStatus.WITHDRAWN },
    });

    this.notificationsGateway.notifyUser(product.sellerId, {
        type: 'OFFER_WITHDRAWN',
        message: `Offer for ${product.title} was withdrawn by the buyer.`,
        productId: offer.listingId,
        offerId: offer.id
    });

    return withdrawnOffer;
  }

  async findByProduct(productId: string) {
      return this.prisma.offer.findMany({
          where: { listingId: productId },
          include: { buyer: { select: { id: true, name: true } } },
      });
  }

  async findByBuyer(buyerId: string) {
    const offers = await this.prisma.offer.findMany({
        where: { buyerId },
        include: { listing: true },
        orderBy: { createdAt: 'desc' }
    });

    // Map listing -> product for frontend
    return offers.map(offer => ({
        ...offer,
        product: offer.listing,
        listing: undefined
    }));
  }

  async findBySeller(sellerId: string) {
    const offers = await this.prisma.offer.findMany({
        where: { listing: { sellerId } },
        include: { 
            listing: true, 
            buyer: { select: { id: true, name: true, email: true } } 
        },
        orderBy: { createdAt: 'desc' }
    });

    // Map listing -> product for frontend
    return offers.map(offer => ({
        ...offer,
        product: offer.listing,
        listing: undefined
    }));
  }
}
