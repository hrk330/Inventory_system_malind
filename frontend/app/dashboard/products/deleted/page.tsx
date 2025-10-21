'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { apiClient } from '@/lib/api-client'
import { Search, RotateCcw, Trash2, Eye, RefreshCw, X, Undo2, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'

interface DeletedProduct {
  id: string
  name: string
  sku: string
  category?: {
    id: string
    name: string
  }
  uom: {
    id: string
    name: string
    symbol: string
  }
  reorderLevel: number
  description?: string
  barcode?: string
  supplierId?: string
  supplierName?: string
  costPrice?: number
  sellingPrice?: number
  minStock: number
  maxStock?: number
  isActive: boolean
  images: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export default function DeletedProductsPage() {
  const [search, setSearch] = useState('')
  const [isRestoreOpen, setIsRestoreOpen] = useState(false)
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] = useState(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<DeletedProduct | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  // Fetch deleted products
  const { data: deletedProducts, isLoading, error } = useQuery({
    queryKey: ['deleted-products', search],
    queryFn: async () => {
      console.log('🗑️ Fetching deleted products with search:', search)
      try {
        const response = await apiClient.get('/products/deleted')
        let products = response.data
        
        // Filter based on search
        if (search) {
          products = products.filter((product: any) =>
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase()) ||
            (product.category?.name && product.category.name.toLowerCase().includes(search.toLowerCase()))
          )
        }
        
        console.log('✅ Deleted products fetched successfully:', products)
        return products
      } catch (error) {
        console.error('❌ Error fetching deleted products:', error)
        throw error
      }
    },
  })

  // Restore product mutation
  const restoreMutation = useMutation({
    mutationFn: async (productId: string) => {
      console.log('🔄 Restoring product:', productId)
      try {
        const response = await apiClient.patch(`/products/${productId}/restore`)
        console.log('✅ Product restored successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error restoring product:', error)
        throw error
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after product restoration')
      queryClient.invalidateQueries({ queryKey: ['deleted-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setIsRestoreOpen(false)
      setSelectedProduct(null)
    },
  })

  // Permanent delete mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      console.log('🗑️ Permanently deleting product:', productId)
      try {
        const response = await apiClient.delete(`/products/${productId}/permanent`)
        console.log('✅ Product permanently deleted successfully')
        return response.data
      } catch (error) {
        console.error('❌ Error permanently deleting product:', error)
        throw error
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after permanent deletion')
      queryClient.invalidateQueries({ queryKey: ['deleted-products'] })
      setIsPermanentDeleteOpen(false)
      setSelectedProduct(null)
    },
  })

  // Bulk permanent delete mutation
  const bulkPermanentDeleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      console.log('🗑️ Bulk permanently deleting products:', productIds)
      try {
        const response = await apiClient.delete('/products/bulk/permanent', {
          data: { ids: productIds }
        })
        console.log('✅ Products permanently deleted successfully')
        return response.data
      } catch (error) {
        console.error('❌ Error bulk permanently deleting products:', error)
        throw error
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after bulk permanent deletion')
      queryClient.invalidateQueries({ queryKey: ['deleted-products'] })
      setIsBulkDeleteOpen(false)
      setSelectedProducts([])
    },
  })

  const handleRestore = (product: DeletedProduct) => {
    setSelectedProduct(product)
    setIsRestoreOpen(true)
  }

  const handlePermanentDelete = (product: DeletedProduct) => {
    setSelectedProduct(product)
    setIsPermanentDeleteOpen(true)
  }

  const confirmRestore = () => {
    if (selectedProduct) {
      restoreMutation.mutate(selectedProduct.id)
    }
  }

  const confirmPermanentDelete = () => {
    if (selectedProduct) {
      permanentDeleteMutation.mutate(selectedProduct.id)
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === deletedProducts?.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(deletedProducts?.map((p: DeletedProduct) => p.id) || [])
    }
  }

  const handleBulkDelete = () => {
    if (selectedProducts.length > 0) {
      setIsBulkDeleteOpen(true)
    }
  }

  const confirmBulkDelete = () => {
    if (selectedProducts.length > 0) {
      bulkPermanentDeleteMutation.mutate(selectedProducts)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    console.log('🔄 Refreshing deleted products...')
    try {
      await queryClient.invalidateQueries({ queryKey: ['deleted-products'] })
      console.log('✅ Deleted products refreshed successfully')
    } catch (error) {
      console.error('❌ Error refreshing deleted products:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const clearSearch = () => {
    setSearch('')
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error loading deleted products. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Deleted Products</h1>
            <p className="mt-1 text-lg text-gray-300">
              Manage deleted products ({deletedProducts?.length || 0} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            >
              {viewMode === 'grid' ? 'Table View' : 'Grid View'}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            {selectedProducts.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedProducts.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search deleted products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {search && (
            <Button
              variant="outline"
              onClick={clearSearch}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {restoreMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error restoring product: {restoreMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {permanentDeleteMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error permanently deleting product: {permanentDeleteMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {bulkPermanentDeleteMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error permanently deleting products: {bulkPermanentDeleteMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Deleted Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deletedProducts?.map((product: DeletedProduct) => (
            <Card key={product.id} className="border-red-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-red-700">{product.name}</CardTitle>
                    <CardDescription>SKU: {product.sku}</CardDescription>
                  </div>
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Category:</span>
                    <span className="text-sm font-medium">{product.category?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Unit:</span>
                    <span className="text-sm font-medium">{product.uom.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Supplier:</span>
                    <span className="text-sm font-medium">{product.supplierName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Status:</span>
                    <span className="text-sm font-medium text-red-600">Deleted</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleRestore(product)}
                    disabled={restoreMutation.isPending}
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handlePermanentDelete(product)}
                    disabled={permanentDeleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === deletedProducts?.length && deletedProducts?.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedProducts?.map((product: DeletedProduct) => (
                <TableRow key={product.id} className="text-red-600">
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category?.name || 'N/A'}</TableCell>
                  <TableCell>{product.uom.symbol}</TableCell>
                  <TableCell>{product.supplierName || 'N/A'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      Deleted
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(product)}
                        disabled={restoreMutation.isPending}
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDelete(product)}
                        disabled={permanentDeleteMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {deletedProducts?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-300">
            {search ? 'No deleted products found matching your search' : 'No deleted products found'}
          </p>
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore "{selectedProduct?.name}"? This will make it active again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRestoreOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRestore} 
              disabled={restoreMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Undo2 className="h-4 w-4 mr-2" />
              {restoreMutation.isPending ? 'Restoring...' : 'Restore Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={isPermanentDeleteOpen} onOpenChange={setIsPermanentDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{selectedProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPermanentDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmPermanentDelete} 
              disabled={permanentDeleteMutation.isPending}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {permanentDeleteMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Selected Products</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedProducts.length} selected product{selectedProducts.length !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmBulkDelete} 
              disabled={bulkPermanentDeleteMutation.isPending}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {bulkPermanentDeleteMutation.isPending ? 'Deleting...' : `Permanently Delete ${selectedProducts.length} Products`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
