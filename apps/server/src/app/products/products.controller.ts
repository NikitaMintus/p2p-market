import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from '@p2p/shared/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Prisma, ListingStatus } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: ListingStatus,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
    @Query('sort') sort?: string,
    @Query('includeOffers') includeOffers?: string,
    @Query('excludeSeller') excludeSeller?: string,
  ) {
    // Map ProductStatus (from DTO/Query) to ListingStatus (DB) if necessary, 
    // but here we are using ListingStatus directly in the query param type for simplicity 
    // or string if coming from frontend. The frontend sends strings "ACTIVE", etc. which match.
    
    const where: Prisma.ListingWhereInput = {
        status: status || 'ACTIVE', 
    };
    if (category) where.category = category;
    if (excludeSeller) where.sellerId = { not: excludeSeller };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const takeNumber = take ? Number(take) : 10;
    const cursorObj = cursor ? { id: cursor } : undefined;
    const skip = cursor ? 1 : 0; // Skip the cursor itself

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') {
        orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
        orderBy = { price: 'desc' };
    }

    return this.productsService.findAll({ 
        where,
        take: takeNumber,
        skip,
        cursor: cursorObj,
        orderBy,
        includeOffers: includeOffers === 'true',
    });
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('includeOffers') includeOffers?: string,
  ) {
    return this.productsService.findAll({
      where: { sellerId: userId },
      includeOffers: includeOffers === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    return this.productsService.update(id, updateProductDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.productsService.remove(id, req.user.userId);
  }
}
