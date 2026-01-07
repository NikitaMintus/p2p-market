import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionStatus } from '@prisma/client';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('my')
  findMy(@Request() req) {
    return this.transactionsService.findMyTransactions(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TransactionStatus, @Request() req) {
    return this.transactionsService.updateStatus(id, req.user.userId, status);
  }
}

