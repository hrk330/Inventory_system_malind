import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFReceiptTemplate } from './receipt-templates/pdf-template';
import { ThermalReceiptTemplate } from './receipt-templates/thermal-template';
import { GenerateReceiptDto } from './dto/generate-receipt.dto';
import { EmailReceiptDto } from './dto/email-receipt.dto';
import { ReceiptFormat, ReceiptType } from '@prisma/client';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ReceiptsService {
  private readonly receiptsDir = join(process.cwd(), 'temp', 'receipts');

  constructor(private prisma: PrismaService) {
    // Ensure receipts directory exists
    if (!existsSync(this.receiptsDir)) {
      mkdirSync(this.receiptsDir, { recursive: true });
    }
  }

  async generatePDF(saleId: string, userId: string) {
    const sale = await this.getSaleWithRelations(saleId);

    const template = new PDFReceiptTemplate();
    const doc = template.generateReceipt(sale);

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber();

    // Create file path
    const fileName = `receipt-${receiptNumber}.pdf`;
    const filePath = join(this.receiptsDir, fileName);

    // Write PDF to file
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    
    return new Promise((resolve, reject) => {
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          writeFileSync(filePath, pdfBuffer);

          // Create receipt record
          const receipt = await this.prisma.receipt.create({
            data: {
              saleId,
              receiptNumber,
              receiptType: ReceiptType.ORIGINAL,
              format: ReceiptFormat.PDF,
              filePath,
              generatedBy: userId,
            },
          });

          resolve({
            receipt,
            filePath,
            fileName,
          });
        } catch (error) {
          reject(error);
        }
      });

      doc.on('error', reject);
      doc.end();
    });
  }

  async generateThermal(saleId: string, userId: string) {
    const sale = await this.getSaleWithRelations(saleId);

    const template = new ThermalReceiptTemplate();
    const thermalText = template.generateReceipt(sale);

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber();

    // Create receipt record (no file path for thermal)
    const receipt = await this.prisma.receipt.create({
      data: {
        saleId,
        receiptNumber,
        receiptType: ReceiptType.ORIGINAL,
        format: ReceiptFormat.THERMAL,
        generatedBy: userId,
      },
    });

    return {
      receipt,
      thermalText,
    };
  }

  async emailReceipt(saleId: string, emailReceiptDto: EmailReceiptDto, userId: string) {
    const sale = await this.getSaleWithRelations(saleId);

    if (!sale.customer?.email && !emailReceiptDto.emailAddress) {
      throw new BadRequestException('No email address available for customer');
    }

    const emailAddress = emailReceiptDto.emailAddress || sale.customer!.email!;

    // Generate PDF receipt
    const { filePath, fileName } = await this.generatePDF(saleId, userId) as any;

    // Create email transporter (configure with your SMTP settings)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@malindtech.com',
      to: emailAddress,
      subject: `Receipt for Sale ${sale.saleNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your purchase!</h2>
          <p>Please find your receipt attached for sale <strong>${sale.saleNumber}</strong>.</p>
          <p><strong>Sale Details:</strong></p>
          <ul>
            <li>Date: ${new Date(sale.saleDate).toLocaleDateString()}</li>
            <li>Total Amount: $${Number(sale.totalAmount).toFixed(2)}</li>
            <li>Location: ${sale.location.name}</li>
          </ul>
          <p>If you have any questions about this receipt, please contact us.</p>
          <p>Best regards,<br>Malind Tech Solutions</p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    };

    try {
      const result = await transporter.sendMail(mailOptions);

      // Update receipt record with email info
      await this.prisma.receipt.update({
        where: { id: (await this.generatePDF(saleId, userId) as any).receipt.id },
        data: {
          emailedTo: emailAddress,
          emailedAt: new Date(),
        },
      });

      return {
        success: true,
        messageId: result.messageId,
        emailAddress,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  async getReceiptsBySale(saleId: string) {
    return this.prisma.receipt.findMany({
      where: { saleId },
      include: {
        generator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async downloadReceipt(receiptId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (receipt.format !== ReceiptFormat.PDF) {
      throw new BadRequestException('Only PDF receipts can be downloaded');
    }

    if (!receipt.filePath) {
      throw new BadRequestException('Receipt file not found');
    }

    // Increment print count
    await this.prisma.receipt.update({
      where: { id: receiptId },
      data: {
        printCount: { increment: 1 },
        printedAt: new Date(),
      },
    });

    return {
      filePath: receipt.filePath,
      fileName: `receipt-${receipt.receiptNumber}.pdf`,
    };
  }

  async getThermalReceipt(receiptId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (receipt.format !== ReceiptFormat.THERMAL) {
      throw new BadRequestException('Only thermal receipts can be retrieved as text');
    }

    // Get sale data and generate thermal text
    const sale = await this.getSaleWithRelations(receipt.saleId);
    const template = new ThermalReceiptTemplate();
    const thermalText = template.generateReceipt(sale);

    // Increment print count
    await this.prisma.receipt.update({
      where: { id: receiptId },
      data: {
        printCount: { increment: 1 },
        printedAt: new Date(),
      },
    });

    return {
      thermalText,
      receiptNumber: receipt.receiptNumber,
    };
  }

  private async getSaleWithRelations(saleId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        location: true,
        saleItems: {
          include: { product: true },
        },
        payments: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  private async generateReceiptNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastReceipt = await this.prisma.receipt.findFirst({
      where: {
        receiptNumber: {
          startsWith: `RCP-${dateStr}`,
        },
      },
      orderBy: { receiptNumber: 'desc' },
    });

    let sequence = 1;
    if (lastReceipt) {
      const lastSequence = parseInt(lastReceipt.receiptNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `RCP-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}
