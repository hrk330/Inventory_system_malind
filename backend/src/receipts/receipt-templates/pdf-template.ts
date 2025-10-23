import PDFDocument from 'pdfkit';
import { join } from 'path';
import { Sale, Customer, Location, SaleItem, Payment } from '@prisma/client';

export interface SaleWithRelations extends Sale {
  customer?: Customer | null;
  location: Location;
  saleItems: (SaleItem & { product?: any })[];
  payments: Payment[];
}

export class PDFReceiptTemplate {
  private doc: InstanceType<typeof PDFDocument>;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;

  constructor() {
    this.doc = new PDFDocument({ size: 'A4', margin: 50 });
    this.pageWidth = 595.28; // A4 width in points
    this.pageHeight = 841.89; // A4 height in points
    this.margin = 50;
  }

  generateReceipt(sale: SaleWithRelations): InstanceType<typeof PDFDocument> {
    this.addHeader();
    this.addCompanyInfo();
    this.addSaleInfo(sale);
    this.addCustomerInfo(sale.customer);
    this.addItemsTable(sale.saleItems);
    this.addTotals(sale);
    this.addPayments(sale.payments);
    this.addFooter();

    return this.doc;
  }

  private addHeader() {
    // Company Logo (if available)
    // For now, we'll add a text-based header
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('MALIND TECH', this.margin, this.margin, { align: 'center' });

    this.doc
      .fontSize(14)
      .font('Helvetica')
      .fillColor('#7f8c8d')
      .text('Inventory Management System', this.margin, this.margin + 30, { align: 'center' });

    // Add a line separator
    this.doc
      .strokeColor('#bdc3c7')
      .lineWidth(1)
      .moveTo(this.margin, this.margin + 60)
      .lineTo(this.pageWidth - this.margin, this.margin + 60)
      .stroke();
  }

  private addCompanyInfo() {
    const companyInfo = [
      'Malind Tech Solutions',
      '123 Business Street',
      'Tech City, TC 12345',
      'Phone: +1 (555) 123-4567',
      'Email: info@malindtech.com',
      'Website: www.malindtech.com',
    ];

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#34495e')
      .text(companyInfo.join('\n'), this.margin, this.margin + 80);
  }

  private addSaleInfo(sale: SaleWithRelations) {
    const saleInfo = [
      `Receipt #: ${sale.saleNumber}`,
      `Date: ${new Date(sale.saleDate).toLocaleDateString()}`,
      `Time: ${new Date(sale.saleDate).toLocaleTimeString()}`,
      `Location: ${sale.location.name}`,
      `Sale Type: ${sale.saleType}`,
      `Status: ${sale.status}`,
    ];

    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('SALE INFORMATION', this.margin, this.margin + 140);

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#34495e')
      .text(saleInfo.join('\n'), this.margin, this.margin + 160);
  }

  private addCustomerInfo(customer: Customer | null | undefined) {
    if (!customer) return;

    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('CUSTOMER INFORMATION', this.margin, this.margin + 220);

    const customerInfo = [
      `Name: ${customer.name}`,
      `Email: ${customer.email || 'N/A'}`,
      `Phone: ${customer.phone || 'N/A'}`,
      `Address: ${customer.address || 'N/A'}`,
    ];

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#34495e')
      .text(customerInfo.join('\n'), this.margin, this.margin + 240);
  }

  private addItemsTable(saleItems: (SaleItem & { product?: any })[]) {
    const startY = this.margin + 300;
    
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('ITEMS', this.margin, startY);

    // Table headers
    const tableStartY = startY + 20;
    const colWidths = [200, 60, 80, 80, 80]; // Name, Qty, Price, Discount, Total
    const colX = [this.margin, this.margin + 200, this.margin + 260, this.margin + 340, this.margin + 420];

    // Header row
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('Item', colX[0], tableStartY)
      .text('Qty', colX[1], tableStartY)
      .text('Price', colX[2], tableStartY)
      .text('Discount', colX[3], tableStartY)
      .text('Total', colX[4], tableStartY);

    // Header underline
    this.doc
      .strokeColor('#bdc3c7')
      .lineWidth(0.5)
      .moveTo(this.margin, tableStartY + 15)
      .lineTo(this.pageWidth - this.margin, tableStartY + 15)
      .stroke();

    // Items rows
    let currentY = tableStartY + 25;
    saleItems.forEach((item, index) => {
      if (currentY > this.pageHeight - 200) {
        // Add new page if needed
        this.doc.addPage();
        currentY = this.margin + 50;
      }

      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#34495e')
        .text(item.itemName, colX[0], currentY, { width: colWidths[0] })
        .text(item.quantity.toString(), colX[1], currentY)
        .text(`$${Number(item.unitPrice).toFixed(2)}`, colX[2], currentY)
        .text(`$${Number(item.itemDiscountAmount).toFixed(2)}`, colX[3], currentY)
        .text(`$${Number(item.lineTotal).toFixed(2)}`, colX[4], currentY);

      currentY += 20;
    });
  }

  private addTotals(sale: SaleWithRelations) {
    const totalsY = this.margin + 400;
    
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('TOTALS', this.margin, totalsY);

    const totals = [
      `Subtotal: $${Number(sale.subtotal).toFixed(2)}`,
      `Tax (${sale.taxRate}%): $${Number(sale.taxAmount).toFixed(2)}`,
      `Discount: -$${Number(sale.discountAmount).toFixed(2)}`,
      `Total: $${Number(sale.totalAmount).toFixed(2)}`,
      `Amount Paid: $${Number(sale.amountPaid).toFixed(2)}`,
      `Change Given: $${Number(sale.changeGiven).toFixed(2)}`,
    ];

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#34495e')
      .text(totals.join('\n'), this.margin, totalsY + 20);
  }

  private addPayments(payments: Payment[]) {
    if (payments.length === 0) return;

    const paymentsY = this.margin + 500;
    
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('PAYMENTS', this.margin, paymentsY);

    payments.forEach((payment, index) => {
      const paymentInfo = [
        `Method: ${payment.paymentMethod}`,
        `Amount: $${Number(payment.amount).toFixed(2)}`,
        `Reference: ${payment.referenceNumber || 'N/A'}`,
        `Date: ${new Date(payment.paymentDate).toLocaleString()}`,
      ];

      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#34495e')
        .text(paymentInfo.join(' | '), this.margin, paymentsY + 20 + (index * 15));
    });
  }

  private addFooter() {
    const footerY = this.pageHeight - 100;
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#7f8c8d')
      .text('Thank you for your business!', this.margin, footerY, { align: 'center' })
      .text('This is a computer-generated receipt.', this.margin, footerY + 15, { align: 'center' })
      .text(`Generated on: ${new Date().toLocaleString()}`, this.margin, footerY + 30, { align: 'center' });
  }
}
