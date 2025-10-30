'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  Calendar,
  DollarSign,
  User,
  MoreHorizontal,
  CreditCard
} from 'lucide-react'
import PaymentModal from './components/payment-modal'
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
    totalPrice: number
  }>
  creator: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface PurchaseResponse {
  data: PurchaseOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const paymentStatusColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  PAID: 'bg-green-100 text-green-800',
}

export default function PurchasesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPurchaseForPayment, setSelectedPurchaseForPayment] = useState<PurchaseOrder | null>(null)

  // Fetch purchases
  const { data: purchases, isLoading, error } = useQuery({
    queryKey: ['purchases', { search: searchTerm, status: statusFilter, paymentStatus: paymentStatusFilter }],
    queryFn: async (): Promise<PurchaseResponse> => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentStatusFilter && paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter)
      params.append('page', '1')
      params.append('limit', '50')

      const response = await apiClient.get(`/purchases?${params.toString()}`)
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mark as received mutation
  const markReceivedMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/purchases/${id}/receive`, {})
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      toast.success('Purchase order marked as received')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as received')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/purchases/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      toast.success('Purchase order deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete purchase order')
    },
  })

  const handleMarkReceived = (id: string) => {
    if (confirm('Are you sure you want to mark this order as received?')) {
      markReceivedMutation.mutate(id)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleViewDetails = (purchase: PurchaseOrder) => {
    setSelectedPurchase(purchase)
    setShowDetails(true)
  }

  const handleUpdatePayment = (purchase: PurchaseOrder) => {
    setSelectedPurchaseForPayment(purchase)
    setShowPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPurchaseForPayment(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading purchases: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Purchase Orders</h1>
          <p className="text-gray-400">Manage your purchase orders and supplier relationships</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/dashboard/purchases/add')}>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-100">Total Orders</p>
                <p className="text-2xl font-semibold text-white">
                  {purchases?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-100">Pending Orders</p>
                <p className="text-2xl font-semibold text-white">
                  {Array.isArray(purchases?.data) ? purchases.data.filter(p => p.status === 'PENDING').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-100">Received Orders</p>
                <p className="text-2xl font-semibold text-white">
                  {Array.isArray(purchases?.data) ? purchases.data.filter(p => p.status === 'RECEIVED').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-100">Total Value</p>
                <p className="text-2xl font-semibold text-white">
                  ${Array.isArray(purchases?.data) ? purchases.data.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, supplier, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="RECEIVED">Received</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Purchase Orders</CardTitle>
          <CardDescription className="text-gray-400">
            Manage and track your purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Order #</TableHead>
                  <TableHead className="text-gray-300">Supplier</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Payment</TableHead>
                  <TableHead className="text-gray-300">Total</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(purchases?.data) ? purchases.data.map((purchase) => (
                  <TableRow key={purchase.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell className="text-white font-medium">
                      {purchase.orderNumber}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div>
                        <div className="font-medium">{purchase.supplier.name}</div>
                        {purchase.supplier.contactPerson && (
                          <div className="text-sm text-gray-400">{purchase.supplier.contactPerson}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div>
                        <div>{format(new Date(purchase.orderDate), 'MMM dd, yyyy')}</div>
                        {purchase.expectedDate && (
                          <div className="text-sm text-gray-400">
                            Expected: {format(new Date(purchase.expectedDate), 'MMM dd')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[purchase.status]}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusColors[purchase.paymentStatus]}>
                        {purchase.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      ${Number(purchase.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(purchase)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {purchase.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkReceived(purchase.id)}
                            className="text-green-400 hover:text-green-300"
                            disabled={markReceivedMutation.isPending}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdatePayment(purchase)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Update Payment"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(purchase.id)}
                          className="text-red-400 hover:text-red-300"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                      {isLoading ? 'Loading purchases...' : 'No purchases found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Purchase Order Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Order #{selectedPurchase?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Number:</span>
                      <span className="text-white">{selectedPurchase.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Date:</span>
                      <span className="text-white">{format(new Date(selectedPurchase.orderDate), 'MMM dd, yyyy')}</span>
                    </div>
                    {selectedPurchase.expectedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expected Date:</span>
                        <span className="text-white">{format(new Date(selectedPurchase.expectedDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className={statusColors[selectedPurchase.status]}>
                        {selectedPurchase.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Status:</span>
                      <Badge className={paymentStatusColors[selectedPurchase.paymentStatus]}>
                        {selectedPurchase.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Supplier Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{selectedPurchase.supplier.name}</span>
                    </div>
                    {selectedPurchase.supplier.contactPerson && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contact:</span>
                        <span className="text-white">{selectedPurchase.supplier.contactPerson}</span>
                      </div>
                    )}
                    {selectedPurchase.supplier.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{selectedPurchase.supplier.email}</span>
                      </div>
                    )}
                    {selectedPurchase.supplier.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-white">{selectedPurchase.supplier.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Product</TableHead>
                        <TableHead className="text-gray-300">SKU</TableHead>
                        <TableHead className="text-gray-300">Quantity</TableHead>
                        <TableHead className="text-gray-300">Cost Price</TableHead>
                        <TableHead className="text-gray-300">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPurchase.items.map((item) => (
                        <TableRow key={item.id} className="border-gray-700">
                          <TableCell className="text-white">{item.product.name}</TableCell>
                          <TableCell className="text-gray-300">{item.product.sku}</TableCell>
                          <TableCell className="text-gray-300">
                            {item.quantity} {item.product.uom.symbol}
                          </TableCell>
                          <TableCell className="text-gray-300">${Number(item.costPrice || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-white font-medium">${Number(item.totalPrice || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total Amount:</span>
                  <span className="text-2xl font-bold text-white">${Number(selectedPurchase.totalAmount || 0).toFixed(2)}</span>
                </div>
                {selectedPurchase.amountPaid > 0 && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-400">Amount Paid:</span>
                    <span className="text-white">${Number(selectedPurchase.amountPaid || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {selectedPurchaseForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          purchaseOrder={selectedPurchaseForPayment}
        />
      )}
    </div>
  )
}
