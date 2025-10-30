'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Search, 
  Eye, 
  Trash2, 
  RotateCcw,
  Download,
  FileText,
  ArrowLeft,
  Calendar,
  DollarSign,
  Package,
  Check,
  X
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'

interface PurchaseReturn {
  id: string
  returnNumber: string
  purchaseOrder: {
    id: string
    orderNumber: string
  }
  supplier: {
    id: string
    name: string
    contactPerson?: string
    email?: string
  }
  returnDate: string
  reason: string
  totalAmount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
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
    reason?: string
  }>
  creator: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface PurchaseReturnsResponse {
  data: PurchaseReturn[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

export default function PurchaseReturnListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Fetch suppliers for filter
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<{ data: Array<{ id: string; name: string }> }> => {
      const response = await apiClient.get('/suppliers')
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch purchase returns
  const { data: returns, isLoading, error } = useQuery({
    queryKey: ['purchase-returns', { 
      search: searchTerm, 
      status: statusFilter, 
      supplierId: supplierFilter,
      dateFrom,
      dateTo,
      page: currentPage,
      limit: pageSize
    }],
    queryFn: async (): Promise<PurchaseReturnsResponse> => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (supplierFilter && supplierFilter !== 'all') params.append('supplierId', supplierFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      params.append('page', currentPage.toString())
      params.append('limit', pageSize.toString())

      const response = await apiClient.get(`/purchases/returns?${params.toString()}`)
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/purchases/returns/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] })
      toast.success('Purchase return deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete purchase return')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this purchase return?')) {
      deleteMutation.mutate(id)
    }
  }

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/purchases/returns/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] })
      toast.success('Purchase return approved successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve purchase return')
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/purchases/returns/${id}/reject`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] })
      toast.success('Purchase return rejected successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject purchase return')
    },
  })

  const handleApprove = (id: string) => {
    if (confirm('Are you sure you want to approve this purchase return?')) {
      approveMutation.mutate(id)
    }
  }

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this purchase return?')) {
      rejectMutation.mutate(id)
    }
  }

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/purchases/returns/${id}/complete`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] })
      toast.success('Purchase return marked as completed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete purchase return')
    },
  })

  const handleComplete = (id: string) => {
    if (confirm('Are you sure you want to mark this purchase return as completed? This should only be done after the supplier has taken back the returned items.')) {
      completeMutation.mutate(id)
    }
  }

  const handleViewDetails = (returnItem: PurchaseReturn) => {
    setSelectedReturn(returnItem)
    setShowDetails(true)
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (supplierFilter) params.append('supplierId', supplierFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const response = await apiClient.get(`/purchases/returns/export/${format}?${params.toString()}`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `purchase-returns.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Export ${format.toUpperCase()} downloaded successfully`)
    } catch (error) {
      toast.error('Failed to export data')
    }
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
        <p className="text-red-500">Error loading purchase returns: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-white">Purchase Returns</h1>
          <p className="text-gray-400">Manage and track purchase returns</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <RotateCcw className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-100">Total Returns</p>
                <p className="text-2xl font-semibold text-white">
                  {returns?.total || 0}
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
                <p className="text-sm font-medium text-yellow-100">Pending Returns</p>
                <p className="text-2xl font-semibold text-white">
                  {returns?.data?.filter(r => r.status === 'PENDING').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-100">Approved Returns</p>
                <p className="text-2xl font-semibold text-white">
                  {returns?.data?.filter(r => r.status === 'APPROVED').length || 0}
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
                <p className="text-sm font-medium text-green-100">Completed Returns</p>
                <p className="text-2xl font-semibold text-white">
                  {returns?.data?.filter(r => r.status === 'COMPLETED').length || 0}
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
                  ${Array.isArray(returns?.data) ? returns.data.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search returns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers?.data?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Purchase Returns Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Purchase Returns</CardTitle>
          <CardDescription className="text-gray-400">
            Showing {returns?.data?.length || 0} of {returns?.total || 0} returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Return #</TableHead>
                  <TableHead className="text-gray-300">Order #</TableHead>
                  <TableHead className="text-gray-300">Supplier</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Reason</TableHead>
                  <TableHead className="text-gray-300">Total</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns?.data?.map((returnItem) => (
                  <TableRow key={returnItem.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell className="text-white font-medium">
                      {returnItem.returnNumber}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {returnItem.purchaseOrder?.orderNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div>
                        <div className="font-medium">{returnItem.supplier?.name || 'N/A'}</div>
                        {returnItem.supplier?.contactPerson && (
                          <div className="text-sm text-gray-400">{returnItem.supplier.contactPerson}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(returnItem.returnDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[returnItem.status]}>
                        {returnItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs truncate">
                      {returnItem.reason}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      ${Number(returnItem.totalAmount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(returnItem)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {returnItem.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(returnItem.id)}
                              className="text-green-400 hover:text-green-300"
                              disabled={approveMutation.isPending}
                              title="Approve Return"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(returnItem.id)}
                              className="text-red-400 hover:text-red-300"
                              disabled={rejectMutation.isPending}
                              title="Reject Return"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {returnItem.status === 'APPROVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComplete(returnItem.id)}
                            className="text-blue-400 hover:text-blue-300"
                            disabled={completeMutation.isPending}
                            title="Mark as Completed (after supplier takes back items)"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(returnItem.id)}
                          className="text-red-400 hover:text-red-300"
                          disabled={deleteMutation.isPending}
                          title="Delete Return"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Return Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Purchase Return Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Return #{selectedReturn?.returnNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-6">
              {/* Return Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Return Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Return Number:</span>
                      <span className="text-white">{selectedReturn.returnNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Number:</span>
                      <span className="text-white">{selectedReturn.purchaseOrder?.orderNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Return Date:</span>
                      <span className="text-white">{format(new Date(selectedReturn.returnDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className={statusColors[selectedReturn.status]}>
                        {selectedReturn.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reason:</span>
                      <span className="text-white">{selectedReturn.reason}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Supplier Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{selectedReturn.supplier?.name || 'N/A'}</span>
                    </div>
                    {selectedReturn.supplier?.contactPerson && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contact:</span>
                        <span className="text-white">{selectedReturn.supplier.contactPerson}</span>
                      </div>
                    )}
                    {selectedReturn.supplier?.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{selectedReturn.supplier.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Return Items</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Product</TableHead>
                        <TableHead className="text-gray-300">SKU</TableHead>
                        <TableHead className="text-gray-300">Quantity</TableHead>
                        <TableHead className="text-gray-300">Cost Price</TableHead>
                        <TableHead className="text-gray-300">Reason</TableHead>
                        <TableHead className="text-gray-300">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReturn.items?.map((item) => (
                        <TableRow key={item.id} className="border-gray-700">
                          <TableCell className="text-white">{item.product?.name || 'N/A'}</TableCell>
                          <TableCell className="text-gray-300">{item.product?.sku || 'N/A'}</TableCell>
                          <TableCell className="text-gray-300">
                            {item.quantity} {item.product?.uom?.symbol || ''}
                          </TableCell>
                          <TableCell className="text-gray-300">${Number(item.costPrice || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-gray-300">{item.reason || 'N/A'}</TableCell>
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
                  <span className="text-2xl font-bold text-white">${Number(selectedReturn.totalAmount || 0).toFixed(2)}</span>
                </div>
                {selectedReturn.remarks && (
                  <div className="mt-2">
                    <span className="text-gray-400">Remarks:</span>
                    <p className="text-white mt-1">{selectedReturn.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
