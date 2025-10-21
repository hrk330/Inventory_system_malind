'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Toast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api-client'
import { Package, MapPin, Plus, Edit, ArrowRightLeft, Search, Filter, X, RefreshCw, Settings, TrendingUp, TrendingDown } from 'lucide-react'
import { useForm } from 'react-hook-form'

// Types
interface StockBalance {
  id: string
  productId: string
  locationId: string
  quantity: number
  lastUpdated: string
  product: {
    id: string
    name: string
    sku: string
    uom: {
      symbol: string
    }
    reorderLevel: number
  }
  location: {
    id: string
    name: string
    type: string
  }
}

interface Product {
  id: string
  name: string
  sku: string
  uom: {
    id: string
    symbol: string
  }
}

interface Location {
  id: string
  name: string
  type: string
}

interface StockAdjustmentForm {
  productId: string
  locationId: string
  adjustmentType: 'add' | 'subtract' | 'set'
  quantity: number
  reason: string
}

interface StockTransferForm {
  productId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
  reason: string
}

// Custom hook for debounced search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function BalancesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })

  const debouncedSearch = useDebounce(search, 300)

  // Form setup
  const { register: registerAdjustment, handleSubmit: handleAdjustmentSubmit, reset: resetAdjustment, setValue: setAdjustmentValue, formState: { errors: adjustmentErrors } } = useForm<StockAdjustmentForm>()
  const { register: registerTransfer, handleSubmit: handleTransferSubmit, reset: resetTransfer, setValue: setTransferValue, formState: { errors: transferErrors } } = useForm<StockTransferForm>()

  // Fetch stock balances
  const { data: balances, isLoading } = useQuery({
    queryKey: ['stock-balances', debouncedSearch, locationFilter, productFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (locationFilter !== 'all') params.append('locationId', locationFilter)
      if (productFilter !== 'all') params.append('productId', productFilter)
      return apiClient.get(`/stock/balances?${params.toString()}`).then(res => res.data)
    },
  })

  // Fetch products for dropdowns
  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then(res => res.data),
  })

  // Fetch locations for dropdowns
  const { data: locationsResponse } = useQuery({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations').then(res => res.data),
  })

  const products = productsResponse?.data || productsResponse || []
  const locations = locationsResponse?.data || locationsResponse || []

  // Stock adjustment mutation
  const adjustmentMutation = useMutation({
    mutationFn: async (data: StockAdjustmentForm) => {
      const payload = {
        productId: data.productId,
        fromLocationId: (data.adjustmentType === 'subtract' || data.adjustmentType === 'set') ? data.locationId : undefined,
        toLocationId: data.adjustmentType === 'add' ? data.locationId : undefined,
        type: data.adjustmentType === 'set' ? 'ADJUSTMENT' : (data.adjustmentType === 'add' ? 'RECEIPT' : 'ISSUE'),
        quantity: Number(data.quantity),
        remarks: data.reason || undefined
      }
      console.log('📊 Stock adjustment payload:', payload)
      const response = await apiClient.post('/stock/transactions', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] })
      setIsAdjustmentOpen(false)
      resetAdjustment()
      setToast({
        message: '✅ Stock adjusted successfully!',
        type: 'success',
        isVisible: true
      })
    },
    onError: (error: any) => {
      console.error('❌ Stock adjustment error:', error.response?.data)
      setToast({
        message: `❌ Error adjusting stock: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
        isVisible: true
      })
    }
  })

  // Stock transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: StockTransferForm) => {
      const payload = {
        productId: data.productId,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        type: 'TRANSFER',
        quantity: Number(data.quantity),
        remarks: data.reason || undefined
      }
      console.log('🔄 Stock transfer payload:', payload)
      const response = await apiClient.post('/stock/transactions', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] })
      setIsTransferOpen(false)
      resetTransfer()
      setToast({
        message: '✅ Stock transferred successfully!',
        type: 'success',
        isVisible: true
      })
    },
    onError: (error: any) => {
      console.error('❌ Stock transfer error:', error.response?.data)
      setToast({
        message: `❌ Error transferring stock: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
        isVisible: true
      })
    }
  })

  // Handlers
  const handleAdjustment = (data: StockAdjustmentForm) => {
    console.log('📝 Form data received:', data)
    
    // Validate required fields
    if (!data.productId || !data.locationId || !data.quantity) {
      setToast({
        message: '❌ Please fill in all required fields',
        type: 'error',
        isVisible: true
      })
      return
    }
    
    if (data.quantity <= 0) {
      setToast({
        message: '❌ Quantity must be greater than 0',
        type: 'error',
        isVisible: true
      })
      return
    }
    
    adjustmentMutation.mutate(data)
  }

  const handleTransfer = (data: StockTransferForm) => {
    console.log('📝 Transfer form data received:', data)
    
    // Validate required fields
    if (!data.productId || !data.fromLocationId || !data.toLocationId || !data.quantity) {
      setToast({
        message: '❌ Please fill in all required fields',
        type: 'error',
        isVisible: true
      })
      return
    }
    
    if (data.quantity <= 0) {
      setToast({
        message: '❌ Quantity must be greater than 0',
        type: 'error',
        isVisible: true
      })
      return
    }
    
    if (data.fromLocationId === data.toLocationId) {
      setToast({
        message: '❌ From and to locations cannot be the same',
        type: 'error',
        isVisible: true
      })
      return
    }
    
    transferMutation.mutate(data)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['stock-balances'] })
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const clearFilters = () => {
    setSearch('')
    setLocationFilter('all')
    setProductFilter('all')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Balances</h1>
          <p className="text-gray-600">Manage stock levels across all locations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAdjustmentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adjust Stock
          </Button>
          <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transfer Stock
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Products</p>
                <p className="text-2xl font-semibold text-white">
                  {new Set((balances?.data || balances || [])?.map((b: any) => b.product.id)).size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Locations</p>
                <p className="text-2xl font-semibold text-white">
                  {new Set((balances?.data || balances || [])?.map((b: any) => b.location.id)).size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Stock Units</p>
                <p className="text-2xl font-semibold text-white">
                  {(balances?.data || balances || [])?.reduce((sum: number, balance: any) => sum + balance.quantity, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Low Stock Items</p>
                <p className="text-2xl font-semibold text-white">
                  {(balances?.data || balances || [])?.filter((b: any) => b.quantity <= b.product.reorderLevel).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products or locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {(locations?.data || locations)?.map((location: Location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {(products?.data || products)?.map((product: Product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {(search || locationFilter !== 'all' || productFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Balances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Balances</CardTitle>
          <CardDescription>
            Current stock levels for all products across all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(balances?.data || balances || [])?.map((balance: StockBalance) => (
                <TableRow key={`${balance.product.id}-${balance.location.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{balance.product.name}</div>
                      <div className="text-sm text-gray-300">SKU: {balance.product.sku}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{balance.location.name}</div>
                      <div className="text-sm text-gray-300 capitalize">
                        {balance.location.type.toLowerCase()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      balance.quantity <= balance.product.reorderLevel 
                        ? 'bg-red-100 text-red-800' 
                        : balance.quantity > balance.product.reorderLevel * 2
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {balance.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{balance.product.uom.symbol}</TableCell>
                  <TableCell>{balance.product.reorderLevel}</TableCell>
                  <TableCell>
                    {new Date(balance.lastUpdated).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdjustmentValue('productId', balance.product.id)
                        setAdjustmentValue('locationId', balance.location.id)
                        setIsAdjustmentOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(balances?.data || balances || [])?.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No stock balances found</p>
              <p className="text-sm text-gray-400 mt-2">
                {search || locationFilter !== 'all' || productFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Add stock to products to see them here'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Add, subtract, or set stock quantity for a product at a location
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustmentSubmit(handleAdjustment)} className="space-y-4">
            <div>
              <Label htmlFor="adjustment-product">Product *</Label>
              <Select onValueChange={(value) => setAdjustmentValue('productId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {(products?.data || products)?.map((product: Product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {adjustmentErrors.productId && (
                <p className="text-sm text-red-600 mt-1">{adjustmentErrors.productId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adjustment-location">Location *</Label>
              <Select onValueChange={(value) => setAdjustmentValue('locationId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {(locations?.data || locations)?.map((location: Location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {adjustmentErrors.locationId && (
                <p className="text-sm text-red-600 mt-1">{adjustmentErrors.locationId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adjustment-type">Adjustment Type *</Label>
              <Select onValueChange={(value: 'add' | 'subtract' | 'set') => setAdjustmentValue('adjustmentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock</SelectItem>
                  <SelectItem value="subtract">Subtract Stock</SelectItem>
                  <SelectItem value="set">Set Exact Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adjustment-quantity">Quantity *</Label>
              <Input
                id="adjustment-quantity"
                type="number"
                min="0"
                {...registerAdjustment('quantity', { required: 'Quantity is required', min: 0 })}
                placeholder="Enter quantity"
              />
              {adjustmentErrors.quantity && (
                <p className="text-sm text-red-600 mt-1">{adjustmentErrors.quantity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adjustment-reason">Reason</Label>
              <Input
                id="adjustment-reason"
                {...registerAdjustment('reason')}
                placeholder="Enter reason for adjustment"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustmentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={adjustmentMutation.isPending}>
                {adjustmentMutation.isPending ? 'Adjusting...' : 'Adjust Stock'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Transfer Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>
              Move stock from one location to another
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit(handleTransfer)} className="space-y-4">
            <div>
              <Label htmlFor="transfer-product">Product *</Label>
              <Select onValueChange={(value) => setTransferValue('productId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {(products?.data || products)?.map((product: Product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transfer-from">From Location *</Label>
              <Select onValueChange={(value) => setTransferValue('fromLocationId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source location" />
                </SelectTrigger>
                <SelectContent>
                  {(locations?.data || locations)?.map((location: Location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transfer-to">To Location *</Label>
              <Select onValueChange={(value) => setTransferValue('toLocationId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination location" />
                </SelectTrigger>
                <SelectContent>
                  {(locations?.data || locations)?.map((location: Location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transfer-quantity">Quantity *</Label>
              <Input
                id="transfer-quantity"
                type="number"
                min="0"
                {...registerTransfer('quantity', { required: 'Quantity is required', min: 0 })}
                placeholder="Enter quantity to transfer"
              />
            </div>
            <div>
              <Label htmlFor="transfer-reason">Reason</Label>
              <Input
                id="transfer-reason"
                {...registerTransfer('reason')}
                placeholder="Enter reason for transfer"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={transferMutation.isPending}>
                {transferMutation.isPending ? 'Transferring...' : 'Transfer Stock'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}