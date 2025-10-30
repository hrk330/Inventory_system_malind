'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ArrowLeft,
  Download,
  FileText,
  Printer,
  Package,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: {
    id: string
    name: string
    contactPerson?: string
    email?: string
    phone?: string
    address?: string
  }
  orderDate: string
  expectedDate?: string
  status: 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID'
  totalAmount: number
  amountPaid: number
  remarks?: string
  items: Array<{
    id: string
    product: {
      id: string
      name: string
      sku: string
      uom: {
        symbol: string
      }
    }
    quantity: number
    costPrice: number
    retailPrice: number
    totalPrice: number
    expiryDate?: string
  }>
  creator: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function PurchaseInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const purchaseId = params.id as string

  // Fetch purchase order details
  const { data: purchase, isLoading, error } = useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: async (): Promise<PurchaseOrder> => {
      const response = await apiClient.get(`/purchases/${purchaseId}`)
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await apiClient.get(`/purchases/${purchaseId}/pdf`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `purchase-invoice-${purchase?.orderNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF download failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading purchase invoice: {error?.message || 'Purchase not found'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const subtotal = purchase.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const tax = 0 // Assuming no tax for now
  const discount = 0 // Assuming no discount for now
  const total = subtotal + tax - discount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Purchase Invoice</h1>
            <p className="text-gray-400">Order #{purchase.orderNumber}</p>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <div className="bg-white text-black p-8 rounded-lg shadow-lg print:shadow-none">
        {/* Company Header */}
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800">INVENTORY MANAGEMENT SYSTEM</h1>
          <p className="text-gray-600 mt-2">Purchase Order Invoice</p>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">From:</h3>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">Your Company Name</p>
              <p>123 Business Street</p>
              <p>City, State 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: info@yourcompany.com</p>
            </div>
          </div>

          {/* Invoice Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details:</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Invoice #:</span>
                <span className="font-semibold">{purchase.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span>{format(new Date(purchase.orderDate), 'MMM dd, yyyy')}</span>
              </div>
              {purchase.expectedDate && (
                <div className="flex justify-between">
                  <span>Expected Date:</span>
                  <span>{format(new Date(purchase.expectedDate), 'MMM dd, yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold">{purchase.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-semibold">{purchase.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill To:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold text-lg">{purchase.supplier.name}</p>
              {purchase.supplier.contactPerson && (
                <p className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {purchase.supplier.contactPerson}
                </p>
              )}
              {purchase.supplier.email && (
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {purchase.supplier.email}
                </p>
              )}
              {purchase.supplier.phone && (
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {purchase.supplier.phone}
                </p>
              )}
              {purchase.supplier.address && (
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {purchase.supplier.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items:</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="text-gray-800 font-semibold">#</TableHead>
                  <TableHead className="text-gray-800 font-semibold">Product</TableHead>
                  <TableHead className="text-gray-800 font-semibold">SKU</TableHead>
                  <TableHead className="text-gray-800 font-semibold">Quantity</TableHead>
                  <TableHead className="text-gray-800 font-semibold">Cost Price</TableHead>
                  <TableHead className="text-gray-800 font-semibold">Retail Price</TableHead>
                  <TableHead className="text-gray-800 font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items.map((item, index) => (
                  <TableRow key={item.id} className="border-b">
                    <TableCell className="text-gray-700">{index + 1}</TableCell>
                    <TableCell className="text-gray-700 font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-gray-700">{item.product.sku}</TableCell>
                    <TableCell className="text-gray-700">
                      {item.quantity} {item.product.uom.symbol}
                    </TableCell>
                    <TableCell className="text-gray-700">${Number(item.costPrice || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-gray-700">${Number(item.retailPrice || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-gray-700 font-semibold">${Number(item.totalPrice || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {purchase.remarks && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Remarks:</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{purchase.remarks}</p>
              </div>
            )}
          </div>
          <div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary:</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-700">${Number(subtotal || 0).toFixed(2)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tax:</span>
                    <span className="text-gray-700">${Number(tax || 0).toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Discount:</span>
                    <span className="text-gray-700">-${Number(discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-800">Total:</span>
                    <span className="text-lg font-semibold text-gray-800">${Number(total || 0).toFixed(2)}</span>
                  </div>
                </div>
                {purchase.amountPaid > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Amount Paid:</span>
                    <span className="text-gray-700">${Number(purchase.amountPaid || 0).toFixed(2)}</span>
                  </div>
                )}
                {purchase.amountPaid > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Balance Due:</span>
                    <span className="text-gray-700">${Number((total - purchase.amountPaid) || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-gray-600">
          <p>Thank you for your business!</p>
          <p className="text-sm mt-2">
            This invoice was generated on {format(new Date(), 'MMM dd, yyyy')} at {format(new Date(), 'h:mm a')}
          </p>
        </div>
      </div>
    </div>
  )
}
