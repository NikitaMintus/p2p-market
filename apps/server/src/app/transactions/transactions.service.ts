import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@p2p/db';
import { TransactionStatus } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TransactionsService {
  constructor(
      private prisma: PrismaService,
      private notificationsGateway: NotificationsGateway
  ) {}

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        offer: {
          include: {
            listing: true,
          },
        },
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    
    // Only buyer or seller can view
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
        throw new ForbiddenException('Access denied');
    }

    // Map listing to product for API consistency
    const { offer, ...rest } = transaction;
    // Rename listing -> product immediately
    const { listing: product, ...offerRest } = offer;
    
    return {
        ...rest,
        offer: {
            ...offerRest,
            product: product,
            productId: product.id
        }
    };
  }

  async findMyTransactions(userId: string) {
      const transactions = await this.prisma.transaction.findMany({
          where: {
              OR: [{ buyerId: userId }, { sellerId: userId }]
          },
          include: {
              offer: {
                include: {
                  listing: true,
                },
              },
              buyer: { select: { name: true } },
              seller: { select: { name: true } }
          },
          orderBy: { updatedAt: 'desc' }
      });

      // Map listing to product for API consistency
      return transactions.map(tx => {
          const { offer, ...rest } = tx;
          const { listing: product, ...offerRest } = offer;
          return {
              ...rest,
              offer: {
                  ...offerRest,
                  product: product,
                  productId: product.id
              }
          };
      });
  }

  async updateStatus(id: string, userId: string, status: TransactionStatus) {
    // Note: We use the findOne wrapper which returns mapped object
    const transaction = await this.findOne(id, userId);
    
    // Status transition logic
    // OFFER_ACCEPTED -> PAYMENT_PENDING (Auto or Manual) -> PAID -> SHIPPED -> DELIVERED -> COMPLETED
    
    let validTransition = false;

    // Buyer actions
    if (userId === transaction.buyerId) {
        if (status === 'PAID' && transaction.status === 'OFFER_ACCEPTED') {
             validTransition = true;
        } else if (status === 'DELIVERED' && transaction.status === 'SHIPPED') {
            validTransition = true;
        } else if (status === 'COMPLETED' && transaction.status === 'DELIVERED') {
             validTransition = true;
        } else if (status === 'DISPUTED') { // Can dispute at any active stage
             validTransition = true;
        }
    }

    // Seller actions
    if (userId === transaction.sellerId) {
        if (status === 'SHIPPED' && transaction.status === 'PAID') {
            validTransition = true;
        } else if (status === 'CANCELLED') {
             validTransition = true;
        }
    }

    if (!validTransition) {
        throw new BadRequestException(`Invalid status transition from ${transaction.status} to ${status} by user`);
    }

    const updatedTransaction = await this._update(id, status);

    const recipientId = userId === transaction.buyerId ? transaction.sellerId : transaction.buyerId;
    this.notificationsGateway.notifyUser(recipientId, {
        type: 'TRANSACTION_UPDATE',
        message: `Transaction for ${transaction.offer.product.title} is now ${status}`,
        productId: transaction.offer.productId,
        transactionId: transaction.id,
        status: status
    });

    return updatedTransaction;
  }

  private async _update(id: string, status: TransactionStatus) {
      return this.prisma.transaction.update({
          where: { id },
          data: { status }
      });
  }
}
