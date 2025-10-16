'use client'

import React, { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, ArrowUp, ArrowUpDown, RotateCcw, Download, Printer, FileText } from 'lucide-react'
import jsPDF from 'jspdf'

interface TransactionReceiptProps {
  transaction: {
    id: string
    product: {
      name: string
      sku: string
      uom: {
        symbol: string
      }
    }
    type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT'
    quantity: number
    referenceNo?: string
    remarks?: string
    fromLocation?: {
      name: string
      type: string
    }
    toLocation?: {
      name: string
      type: string
    }
    creator: {
      name: string
    }
    createdAt: string
  }
  onClose?: () => void
}

export default function TransactionReceipt({ transaction, onClose }: TransactionReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return <ArrowDown className="h-6 w-6 text-green-600" />
      case 'ISSUE':
        return <ArrowUp className="h-6 w-6 text-red-600" />
      case 'TRANSFER':
        return <ArrowUpDown className="h-6 w-6 text-blue-600" />
      case 'ADJUSTMENT':
        return <RotateCcw className="h-6 w-6 text-orange-600" />
      default:
        return <ArrowUpDown className="h-6 w-6 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ISSUE':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ADJUSTMENT':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return 'Stock Receipt'
      case 'ISSUE':
        return 'Stock Issue'
      case 'TRANSFER':
        return 'Stock Transfer'
      case 'ADJUSTMENT':
        return 'Stock Adjustment'
      default:
        return 'Stock Transaction'
    }
  }

  const generatePDF = () => {
    if (!receiptRef.current) return

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 20

    // Helper functions
    const addText = (text: string, x: number, y: number, fontSize: number = 12, fontStyle: string = 'normal', color: number[] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize)
      pdf.setFont('helvetica', fontStyle)
      pdf.setTextColor(color[0], color[1], color[2])
      pdf.text(text, x, y)
      return y + (fontSize * 0.35) + 5
    }

    const addLine = (y: number, color: number[] = [200, 200, 200], thickness: number = 0.5) => {
      pdf.setDrawColor(color[0], color[1], color[2])
      pdf.setLineWidth(thickness)
      pdf.line(20, y, pageWidth - 20, y)
      return y + 10
    }

    // Header with professional styling
    pdf.setFillColor(59, 130, 246) // Blue background
    pdf.rect(0, 0, pageWidth, 45, 'F')
    
    pdf.setTextColor(255, 255, 255)
    yPosition = addText('INVENTORY MANAGEMENT SYSTEM', 20, 18, 18, 'bold')
    yPosition = addText('Stock Transaction Receipt', 20, 28, 14, 'normal')
    
    // Transaction ID and Date
    pdf.setTextColor(0, 0, 0)
    yPosition = 50
    yPosition = addText(`Transaction ID: ${transaction.id}`, pageWidth - 80, yPosition, 10)
    yPosition = addText(`Date: ${new Date(transaction.createdAt).toLocaleString()}`, pageWidth - 80, yPosition, 10)
    
    // Transaction Type Badge with better styling
    yPosition = 65
    const typeColor = transaction.type === 'RECEIPT' ? [34, 197, 94] : 
                     transaction.type === 'ISSUE' ? [239, 68, 68] :
                     transaction.type === 'TRANSFER' ? [59, 130, 246] : [249, 115, 22]
    
    pdf.setFillColor(typeColor[0], typeColor[1], typeColor[2])
    pdf.roundedRect(20, yPosition - 8, 80, 18, 3, 3, 'F')
    pdf.setTextColor(255, 255, 255)
    yPosition = addText(getTransactionTitle(transaction.type), 25, yPosition, 12, 'bold')
    
    // Main Content
    pdf.setTextColor(0, 0, 0)
    yPosition = 90
    
    // Product Information
    yPosition = addText('PRODUCT INFORMATION', 20, yPosition, 14, 'bold')
    yPosition = addLine(yPosition)
    
    yPosition = addText(`Product Name: ${transaction.product.name}`, 20, yPosition, 12)
    yPosition = addText(`SKU: ${transaction.product.sku}`, 20, yPosition, 12)
    yPosition = addText(`Quantity: ${transaction.quantity} ${transaction.product.uom.symbol}`, 20, yPosition, 12)
    
    if (transaction.referenceNo) {
      yPosition = addText(`Reference: ${transaction.referenceNo}`, 20, yPosition, 12)
    }
    
    if (transaction.remarks) {
      yPosition = addText(`Remarks: ${transaction.remarks}`, 20, yPosition, 12)
    }
    
    yPosition += 10
    
    // Location Information
    yPosition = addText('LOCATION INFORMATION', 20, yPosition, 14, 'bold')
    yPosition = addLine(yPosition)
    
    if (transaction.fromLocation) {
      yPosition = addText(`From: ${transaction.fromLocation.name} (${transaction.fromLocation.type})`, 20, yPosition, 12)
    }
    
    if (transaction.toLocation) {
      yPosition = addText(`To: ${transaction.toLocation.name} (${transaction.toLocation.type})`, 20, yPosition, 12)
    }
    
    yPosition += 10
    
    // Transaction Details
    yPosition = addText('TRANSACTION DETAILS', 20, yPosition, 14, 'bold')
    yPosition = addLine(yPosition)
    
    yPosition = addText(`Type: ${getTransactionTitle(transaction.type)}`, 20, yPosition, 12)
    yPosition = addText(`Performed By: ${transaction.creator.name}`, 20, yPosition, 12)
    yPosition = addText(`Timestamp: ${new Date(transaction.createdAt).toLocaleString()}`, 20, yPosition, 12)
    
    // Footer
    yPosition = pageHeight - 40
    yPosition = addLine(yPosition, [200, 200, 200], 1)
    
    pdf.setTextColor(100, 100, 100)
    pdf.setFontSize(8)
    pdf.text('This receipt was generated automatically by the Inventory Management System', 20, yPosition)
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 60, yPosition)
    
    // Save PDF
    const fileName = `transaction-receipt-${transaction.id}.pdf`
    pdf.save(fileName)
  }

  const printReceipt = () => {
    if (!receiptRef.current) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Receipt - ${transaction.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { max-width: 600px; margin: 0 auto; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
            .info-row { margin: 8px 0; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .badge-receipt { background: #dcfce7; color: #166534; }
            .badge-issue { background: #fef2f2; color: #dc2626; }
            .badge-transfer { background: #dbeafe; color: #2563eb; }
            .badge-adjustment { background: #fed7aa; color: #ea580c; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <style jsx>{`
        @media print {
          .receipt-container {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: 1px solid #000 !important;
            margin: 0 !important;
            padding: 20px !important;
            max-width: none !important;
            width: 100% !important;
          }
          
          .receipt-header {
            background: #3b82f6 !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .receipt-content {
            background: white !important;
            color: black !important;
          }
          
          .receipt-section {
            background: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .receipt-badge {
            background: #dcfce7 !important;
            color: #166534 !important;
            border: 1px solid #bbf7d0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .receipt-badge-issue {
            background: #fef2f2 !important;
            color: #dc2626 !important;
            border: 1px solid #fecaca !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .receipt-badge-transfer {
            background: #dbeafe !important;
            color: #2563eb !important;
            border: 1px solid #bfdbfe !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .receipt-badge-adjustment {
            background: #fed7aa !important;
            color: #ea580c !important;
            border: 1px solid #fed7aa !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .receipt-actions {
            display: none !important;
          }
          
          .receipt-footer {
            border-top: 2px solid #000 !important;
            margin-top: 20px !important;
            padding-top: 10px !important;
            font-size: 10px !important;
            color: #666 !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        .print-only {
          display: none;
        }
      `}</style>
      <Card ref={receiptRef} className="shadow-lg receipt-container">
        <CardHeader className="bg-blue-600 text-white receipt-header">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">INVENTORY MANAGEMENT SYSTEM</CardTitle>
              <p className="text-blue-100 mt-1">Stock Transaction Receipt</p>
            </div>
            <div className="text-right text-sm">
              <p>Transaction ID: {transaction.id}</p>
              <p>{new Date(transaction.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 receipt-content">
          {/* Transaction Type Badge */}
          <div className="mb-6">
            <Badge className={`${getTransactionColor(transaction.type)} text-sm px-3 py-1 receipt-badge ${
              transaction.type === 'ISSUE' ? 'receipt-badge-issue' :
              transaction.type === 'TRANSFER' ? 'receipt-badge-transfer' :
              transaction.type === 'ADJUSTMENT' ? 'receipt-badge-adjustment' : ''
            }`}>
              {getTransactionIcon(transaction.type)}
              <span className="ml-2">{getTransactionTitle(transaction.type)}</span>
            </Badge>
          </div>

          {/* Product Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Product Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg receipt-section">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium">{transaction.product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">SKU</p>
                  <p className="font-medium font-mono">{transaction.product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium text-lg">{transaction.quantity} {transaction.product.uom.symbol}</p>
                </div>
                {transaction.referenceNo && (
                  <div>
                    <p className="text-sm text-gray-600">Reference</p>
                    <p className="font-medium">{transaction.referenceNo}</p>
                  </div>
                )}
              </div>
              {transaction.remarks && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Remarks</p>
                  <p className="text-sm">{transaction.remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Location Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg receipt-section">
              {transaction.fromLocation && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">From Location</p>
                  <p className="font-medium">{transaction.fromLocation.name} ({transaction.fromLocation.type})</p>
                </div>
              )}
              {transaction.toLocation && (
                <div>
                  <p className="text-sm text-gray-600">To Location</p>
                  <p className="font-medium">{transaction.toLocation.name} ({transaction.toLocation.type})</p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Transaction Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg receipt-section">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transaction Type</p>
                  <p className="font-medium">{getTransactionTitle(transaction.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Performed By</p>
                  <p className="font-medium">{transaction.creator.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t receipt-actions">
            <Button onClick={generatePDF} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={printReceipt} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>

          {/* Print Footer */}
          <div className="receipt-footer print-only">
            <p>This receipt was generated automatically by the Inventory Management System</p>
            <p>Generated: {new Date().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
