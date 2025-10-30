import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { MarkReceivedDto } from './dto/mark-received.dto';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Purchases')
@Controller('purchases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Supplier or product not found' })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.purchaseService.createPurchaseOrder(createPurchaseOrderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  findAll(@Query() queryDto: PurchaseQueryDto) {
    return this.purchaseService.findAll(queryDto);
  }

  @Get('returns')
  @ApiOperation({ summary: 'Get all purchase returns' })
  @ApiResponse({ status: 200, description: 'Purchase returns retrieved successfully' })
  findAllReturns(@Query() queryDto: any) {
    return this.purchaseService.findAllReturns(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  @ApiResponse({ status: 400, description: 'Cannot update received order' })
  update(
    @Param('id') id: string, 
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    @Request() req: any
  ) {
    const userId = req.user?.id;
    return this.purchaseService.update(id, updatePurchaseOrderDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete received order' })
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.purchaseService.remove(id, userId);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Mark purchase order as received' })
  @ApiResponse({ status: 200, description: 'Purchase order marked as received' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  @ApiResponse({ status: 400, description: 'Order already received or no warehouse found' })
  markAsReceived(
    @Param('id') id: string,
    @Body() markReceivedDto: MarkReceivedDto,
    @Request() req: any
  ) {
    const userId = req.user?.id;
    return this.purchaseService.markAsReceived(id, markReceivedDto, userId);
  }

  @Post('returns')
  @ApiOperation({ summary: 'Create purchase return' })
  @ApiResponse({ status: 201, description: 'Purchase return created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  createReturn(@Body() createPurchaseReturnDto: CreatePurchaseReturnDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.purchaseService.createPurchaseReturn(createPurchaseReturnDto, userId);
  }

  @Patch('returns/:id/approve')
  @ApiOperation({ summary: 'Approve a purchase return' })
  @ApiResponse({ status: 200, description: 'Purchase return approved successfully' })
  @ApiResponse({ status: 404, description: 'Purchase return not found' })
  @ApiResponse({ status: 400, description: 'Return cannot be approved' })
  approveReturn(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.purchaseService.approvePurchaseReturn(id, userId);
  }

  @Patch('returns/:id/reject')
  @ApiOperation({ summary: 'Reject a purchase return' })
  @ApiResponse({ status: 200, description: 'Purchase return rejected successfully' })
  @ApiResponse({ status: 404, description: 'Purchase return not found' })
  @ApiResponse({ status: 400, description: 'Return cannot be rejected' })
  rejectReturn(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.purchaseService.rejectPurchaseReturn(id, userId);
  }

  @Patch('returns/:id/complete')
  @ApiOperation({ summary: 'Mark a purchase return as completed' })
  @ApiResponse({ status: 200, description: 'Purchase return marked as completed successfully' })
  @ApiResponse({ status: 404, description: 'Purchase return not found' })
  @ApiResponse({ status: 400, description: 'Return cannot be completed' })
  completeReturn(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.purchaseService.completePurchaseReturn(id, userId);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Update payment for a purchase order' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  @ApiResponse({ status: 400, description: 'Invalid payment amount' })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: any,
    @Request() req,
  ) {
    return this.purchaseService.updatePayment(id, updatePaymentDto, req.user.id);
  }

  @Get(':id/payment-history')
  @ApiOperation({ summary: 'Get payment history for a purchase order' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async getPaymentHistory(@Param('id') id: string) {
    return this.purchaseService.getPaymentHistory(id);
  }
}
