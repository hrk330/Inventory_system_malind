import { Sale, Customer, Location, SaleItem, Payment } from '@prisma/client';

export interface SaleWithRelations extends Sale {
  customer?: Customer | null;
  location: Location;
  saleItems: (SaleItem & { product?: any })[];
  payments: Payment[];
}

export class ThermalReceiptTemplate {
  private readonly lineWidth = 32; // 58mm thermal printer width
  private readonly separator = '-'.repeat(this.lineWidth);

  generateReceipt(sale: SaleWithRelations): string {
    const lines: string[] = [];

    // Header
    lines.push(this.centerText('MALIND TECH'));
    lines.push(this.centerText('Inventory Management'));
    lines.push(this.centerText('123 Business Street'));
    lines.push(this.centerText('Tech City, TC 12345'));
    lines.push(this.centerText('Phone: +1 (555) 123-4567'));
    lines.push('');
    lines.push(this.separator);

    // Sale Information
    lines.push(this.centerText('RECEIPT'));
    lines.push('');
    lines.push(`Receipt #: ${sale.saleNumber}`);
    lines.push(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`);
    lines.push(`Time: ${new Date(sale.saleDate).toLocaleTimeString()}`);
    lines.push(`Location: ${sale.location.name}`);
    lines.push(`Type: ${sale.saleType}`);
    lines.push('');

    // Customer Information (if available)
    if (sale.customer) {
      lines.push(this.separator);
      lines.push('CUSTOMER:');
      lines.push(`Name: ${sale.customer.name}`);
      if (sale.customer.phone) {
        lines.push(`Phone: ${sale.customer.phone}`);
      }
      lines.push('');
    }

    // Items
    lines.push(this.separator);
    lines.push('ITEMS:');
    lines.push('');

    sale.saleItems.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.itemName}`);
      if (item.itemDescription) {
        lines.push(`   ${item.itemDescription}`);
      }
      lines.push(`   Qty: ${item.quantity} x $${Number(item.unitPrice).toFixed(2)}`);
      
      if (Number(item.itemDiscountAmount) > 0) {
        lines.push(`   Discount: -$${Number(item.itemDiscountAmount).toFixed(2)}`);
      }
      
      if (Number(item.itemTaxAmount) > 0) {
        lines.push(`   Tax: $${Number(item.itemTaxAmount).toFixed(2)}`);
      }
      
      lines.push(`   Total: $${Number(item.lineTotal).toFixed(2)}`);
      lines.push('');
    });

    // Totals
    lines.push(this.separator);
    lines.push('TOTALS:');
    lines.push(`Subtotal: $${Number(sale.subtotal).toFixed(2)}`);
    
    if (Number(sale.discountAmount) > 0) {
      lines.push(`Discount: -$${Number(sale.discountAmount).toFixed(2)}`);
    }
    
    if (Number(sale.taxAmount) > 0) {
      lines.push(`Tax (${sale.taxRate}%): $${Number(sale.taxAmount).toFixed(2)}`);
    }
    
    lines.push(`TOTAL: $${Number(sale.totalAmount).toFixed(2)}`);
    lines.push('');

    // Payments
    if (sale.payments.length > 0) {
      lines.push(this.separator);
      lines.push('PAYMENTS:');
      sale.payments.forEach((payment, index) => {
        lines.push(`${index + 1}. ${payment.paymentMethod}: $${Number(payment.amount).toFixed(2)}`);
        if (payment.referenceNumber) {
          lines.push(`   Ref: ${payment.referenceNumber}`);
        }
      });
      lines.push('');
      lines.push(`Amount Paid: $${Number(sale.amountPaid).toFixed(2)}`);
      if (Number(sale.changeGiven) > 0) {
        lines.push(`Change Given: $${Number(sale.changeGiven).toFixed(2)}`);
      }
      lines.push('');
    }

    // Footer
    lines.push(this.separator);
    lines.push(this.centerText('Thank you for your business!'));
    lines.push(this.centerText('This is a computer-generated receipt.'));
    lines.push('');
    lines.push(this.centerText(`Generated: ${new Date().toLocaleString()}`));
    lines.push('');
    lines.push(this.centerText('---'));
    lines.push(''); // Extra line for cutting

    return lines.join('\n');
  }

  private centerText(text: string): string {
    const padding = Math.max(0, Math.floor((this.lineWidth - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  private leftAlignText(text: string, width: number = this.lineWidth): string {
    return text.padEnd(width);
  }

  private rightAlignText(text: string, width: number = this.lineWidth): string {
    return text.padStart(width);
  }

  private formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  private formatLine(left: string, right: string): string {
    const totalWidth = this.lineWidth;
    const rightWidth = right.length;
    const leftWidth = totalWidth - rightWidth;
    
    return left.substring(0, leftWidth).padEnd(leftWidth) + right;
  }
}
