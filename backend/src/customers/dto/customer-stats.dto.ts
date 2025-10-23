import { ApiProperty } from '@nestjs/swagger';

export class CustomerStatsDto {
  @ApiProperty({ example: 15, description: 'Total number of purchases' })
  totalPurchases: number;

  @ApiProperty({ example: 1250.50, description: 'Total amount spent' })
  totalSpent: number;

  @ApiProperty({ example: 83.37, description: 'Average order value' })
  averageOrderValue: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Date of last purchase' })
  lastPurchaseDate: Date | null;

  @ApiProperty({ example: 150, description: 'Current loyalty points' })
  loyaltyPoints: number;

  @ApiProperty({ example: 5, description: 'Number of purchases this month' })
  purchasesThisMonth: number;

  @ApiProperty({ example: 250.75, description: 'Amount spent this month' })
  spentThisMonth: number;
}
