import { Controller, Post, Body, Param, UseGuards, Request, Patch, Get } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from '@p2p/shared/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Request() req) {
    return this.offersService.create(createOfferDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept')
  accept(@Param('id') id: string, @Request() req) {
    return this.offersService.accept(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/decline')
  decline(@Param('id') id: string, @Request() req) {
    return this.offersService.decline(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/withdraw')
  withdraw(@Param('id') id: string, @Request() req) {
    return this.offersService.withdraw(id, req.user.userId);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
      return this.offersService.findByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-offers')
  findMyOffers(@Request() req) {
      return this.offersService.findByBuyer(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('incoming')
  findIncomingOffers(@Request() req) {
      return this.offersService.findBySeller(req.user.userId);
  }
}
