'use client'

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Toast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api-client'
import { Plus, Search, Edit, Trash2, Eye, Filter, X, Tag, Settings, RefreshCw, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'


// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

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

// SearchInput component with proper communication
const SearchInput = memo(({ onSearchChange }: { onSearchChange: (value: string) => void }) => {
  const [localSearch, setLocalSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Internal debouncing
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value)
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(value)
    }, 300)
  }, [onSearchChange])
  
  // Calculate if we're currently searching
  const [isSearching, setIsSearching] = useState(false)
  
  useEffect(() => {
    if (localSearch) {
      setIsSearching(true)
      const timer = setTimeout(() => setIsSearching(false), 300)
      return () => clearTimeout(timer)
    } else {
      setIsSearching(false)
    }
  }, [localSearch])
  
  return (
    <div className="relative flex-1">
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
      <Input
        ref={inputRef}
        placeholder="Search products by name or SKU..."
        value={localSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-10"
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

interface Product {
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
  stockBalances: Array<{
    quantity: number
    location: {
      name: string
    }
  }>
  createdAt: string
  updatedAt: string
}

interface ProductFormData {
  name: string
  sku: string
  categoryId?: string
  uomId: string
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
  images?: string[]
}

interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UOM {
  id: string
  name: string
  symbol: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  productCount?: number
}

interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [newCategory, setNewCategory] = useState('')
  const [autoGenerateSku, setAutoGenerateSku] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Fetch UOMs for the form
  const { data: uoms } = useQuery<UOM[]>({
    queryKey: ['uoms'],
    queryFn: async () => {
      const response = await apiClient.get('/uoms')
      return response.data
    },
  })
  
  // Handle search change from SearchInput component
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])
  
  // Handle refresh products - clear search and refresh data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    console.log('🔄 Refreshing products and clearing search...')
    try {
      // Clear search to show all products
      setSearch('')
      setCategoryFilter('all')
      
      // Invalidate and refetch products
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('✅ Products refreshed successfully - showing all products')
    } catch (error: any) {
      console.error('❌ Error refreshing products:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [queryClient])

  // Generate unique SKU
  const generateSKU = (productName: string) => {
    const timestamp = Date.now().toString().slice(-6)
    const namePrefix = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3)
    return `${namePrefix}-${timestamp}`
  }

  // Fetch products
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products', search, categoryFilter, statusFilter],
    queryFn: async () => {
      console.log('🔍 Fetching products with search:', search, 'category:', categoryFilter, 'status:', statusFilter)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (categoryFilter && categoryFilter !== 'all') {
        if (categoryFilter === 'no-category') {
          params.append('category', '') // Empty string for no category
        } else {
          params.append('category', categoryFilter)
        }
      }
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      try {
        const response = await apiClient.get(`/products?${params.toString()}`)
        console.log('✅ Products fetched successfully:', response.data)
        return response.data
      } catch (error: any) {
        console.error('❌ Error fetching products:', error)
        throw error
      }
    },
  })

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('🏷️ Fetching categories...')
      try {
        const response = await apiClient.get('/categories')
        console.log('✅ Categories fetched successfully:', response.data)
        return response.data
      } catch (error: any) {
        console.error('❌ Error fetching categories:', error)
        throw error
      }
    },
  })

  // Fetch suppliers
  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('🏢 Fetching suppliers...')
      try {
        const response = await apiClient.get('/suppliers')
        console.log('✅ Suppliers fetched successfully:', response.data)
        return response.data
      } catch (error: any) {
        console.error('❌ Error fetching suppliers:', error)
        throw error
      }
    },
  })

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      console.log('➕ Creating product:', data)
      console.log('🔍 UOM ID being sent:', data.uomId)
      try {
        // Remove any old 'category' field if it exists
        const { category, ...cleanData } = data as any
        console.log('🧹 Cleaned data:', cleanData)
        const response = await apiClient.post('/products', cleanData)
        console.log('✅ Product created successfully:', response.data)
        return response.data
      } catch (error: any) {
        console.error('❌ Error creating product:', error)
        console.error('❌ Error details:', error.response?.data)
        throw error
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after product creation')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
      setIsCreateOpen(false)
      reset()
    },
  })

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      console.log('✏️ Updating product:', id, data)
      try {
        // Remove any old 'category' field if it exists
        const { category, ...cleanData } = data as any
        console.log('🧹 Cleaned data:', cleanData)
        const response = await apiClient.patch(`/products/${id}`, cleanData)
        console.log('✅ Product updated successfully:', response.data)
        console.log('📊 Response stock balances:', response.data.stockBalances)
        return response.data
      } catch (error: any) {
        console.error('❌ Error updating product:', error)
        throw error
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after product update')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
      setIsEditOpen(false)
      setEditingProduct(null)
      reset()
      // Show success toast
      setToast({
        message: '✅ Product updated successfully!',
        type: 'success',
        isVisible: true
      })
    },
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting product:', id)
      try {
        const response = await apiClient.delete(`/products/${id}`)
        console.log('✅ Product deleted successfully')
        return response.data
      } catch (error: any) {
        console.error('❌ Error deleting product:', error)
        throw error
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after product deletion')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeleteProductId(null)
    },
  })

  // Bulk delete products mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      console.log('🗑️ Bulk deleting products:', ids)
      try {
        const response = await apiClient.delete('/products/bulk', {
          data: { ids }
        })
        console.log('✅ Products bulk deleted successfully')
        return response.data
      } catch (error: any) {
        console.error('❌ Error bulk deleting products:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after bulk product deletion')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setSelectedProducts([])
      setIsBulkDeleteOpen(false)
      setToast({
        message: `✅ ${data.count} product(s) deleted successfully!`,
        type: 'success',
        isVisible: true
      })
    },
    onError: (error: any) => {
      setToast({
        message: `❌ Error deleting products: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
        isVisible: true
      })
    },
  })

  // Form handling
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      sku: '',
      categoryId: '',
      uomId: 'uom-pcs',
      reorderLevel: 0,
      description: '',
      barcode: '',
      supplierId: '',
      supplierName: '',
      costPrice: 0,
      sellingPrice: 0,
      minStock: 0,
      maxStock: 0,
      isActive: true,
      images: [],
    }
  })

  // Add new category mutation
  const addCategoryMutation = useMutation({
    mutationFn: (categoryName: string) => {
      return apiClient.post('/categories', {
        name: categoryName
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setNewCategory('')
      setIsCategoryOpen(false)
      setToast({
        message: '✅ Category created successfully!',
        type: 'success',
        isVisible: true
      })
    },
    onError: (error: any) => {
      setToast({
        message: `❌ Error creating category: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
        isVisible: true
      })
    }
  })

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setValue('name', product.name)
    setValue('sku', product.sku)
    setValue('categoryId', product.category?.id || '')
    setValue('uomId', product.uom.id)
    setValue('reorderLevel', product.reorderLevel)
    setValue('description', product.description || '')
    setValue('barcode', product.barcode || '')
    setValue('supplierId', product.supplierId || '')
    setValue('supplierName', product.supplierName || '')
    setValue('costPrice', product.costPrice || 0)
    setValue('sellingPrice', product.sellingPrice || 0)
    setValue('minStock', product.minStock)
    setValue('maxStock', product.maxStock || 0)
    setValue('isActive', product.isActive)
    setValue('images', product.images || [])
    setAutoGenerateSku(false) // Disable auto-SKU for editing
    setIsEditOpen(true)
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id)
      setIsDeleteOpen(false)
      setProductToDelete(null)
    }
  }

  // Bulk delete handlers
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products?.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products?.map((p: Product) => p.id) || [])
    }
  }

  const handleBulkDelete = () => {
    if (selectedProducts.length > 0) {
      setIsBulkDeleteOpen(true)
    }
  }

  const confirmBulkDelete = () => {
    if (selectedProducts.length > 0) {
      bulkDeleteMutation.mutate(selectedProducts)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  // Helper function to calculate total quantity
  const getTotalQuantity = (product: Product) => {
    const total = product.stockBalances.reduce((total, balance) => total + balance.quantity, 0)
    console.log(`📊 Product ${product.name} quantity calculation:`, {
      stockBalances: product.stockBalances,
      total
    })
    return total
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategoryMutation.mutate(newCategory.trim())
    }
  }

  // Auto-generate SKU when product name changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'name' && autoGenerateSku && value.name) {
        const generatedSku = generateSKU(value.name)
        setValue('sku', generatedSku)
        console.log('🔄 Auto-generated SKU:', generatedSku)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue, autoGenerateSku])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateOpen) {
      reset({
        name: '',
        sku: '',
        categoryId: '',
        uomId: 'uom-pcs',
        reorderLevel: 0,
        description: '',
        barcode: '',
        supplierId: '',
        supplierName: '',
        costPrice: 0,
        sellingPrice: 0,
        minStock: 0,
        maxStock: 0,
        isActive: true,
        images: [],
      })
      setAutoGenerateSku(true)
    }
  }, [isCreateOpen, reset])

  useEffect(() => {
    if (!isEditOpen) {
      setEditingProduct(null)
      reset({
        name: '',
        sku: '',
        categoryId: '',
        uomId: 'uom-pcs',
        reorderLevel: 0,
        description: '',
        barcode: '',
        supplierId: '',
        supplierName: '',
        costPrice: 0,
        sellingPrice: 0,
        minStock: 0,
        maxStock: 0,
        isActive: true,
        images: [],
      })
      setAutoGenerateSku(true) // Re-enable auto-SKU for new products
    }
  }, [isEditOpen, reset])

  // Memoize filtered products to prevent unnecessary re-renders
  const filteredProducts = useMemo(() => {
    if (!products) return []
    // Filter out category products (products that start with "Category:")
    return products.filter(product => !product.name.startsWith('Category:'))
  }, [products])

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
          Error loading products. Please check your connection and try again.
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
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your inventory products ({products?.length || 0} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            >
              {viewMode === 'grid' ? 'Table View' : 'Grid View'}
            </Button>
            <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new product category.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter category name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCategoryOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCategory} 
                    disabled={addCategoryMutation.isPending || !newCategory.trim()}
                  >
                    {addCategoryMutation.isPending ? 'Adding...' : 'Add Category'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            <Button onClick={() => router.push('/dashboard/products/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/products/bulk-import')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex gap-2 flex-1">
            <SearchInput onSearchChange={handleSearchChange} />
            {search && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearch('')}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="no-category">No Category</SelectItem>
              {categories?.map((category: Category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {(search || (categoryFilter && categoryFilter !== 'all') || (statusFilter && statusFilter !== 'all')) && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {createMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error creating product: {createMutation.error.message.includes('400') 
              ? 'Invalid data provided. Please check all required fields and try again.' 
              : createMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {updateMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error updating product: {updateMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {deleteMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error deleting product: {deleteMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {addCategoryMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error adding category: {addCategoryMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts?.map((product: Product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>SKU: {product.sku}</CardDescription>
              </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="text-sm font-medium">{product.category?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Unit:</span>
                        <span className="text-sm font-medium">{product.uom.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Quantity:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getTotalQuantity(product) > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getTotalQuantity(product)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Reorder Level:</span>
                        <span className="text-sm font-medium">{product.reorderLevel}</span>
                      </div>
                      {product.supplierName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Supplier:</span>
                          <span className="text-sm font-medium">{product.supplierName}</span>
                        </div>
                      )}
                      {product.costPrice && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Cost:</span>
                          <span className="text-sm font-medium">${product.costPrice}</span>
                        </div>
                      )}
                      {product.sellingPrice && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Price:</span>
                          <span className="text-sm font-medium">${product.sellingPrice}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`text-sm font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDelete(product)}
                    disabled={deleteMutation.isPending}
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
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products?.length && products?.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
            <TableBody>
              {filteredProducts?.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category?.name || 'N/A'}</TableCell>
                  <TableCell>{product.uom.symbol}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getTotalQuantity(product) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getTotalQuantity(product)}
                    </span>
                  </TableCell>
                  <TableCell>{product.supplierName || 'N/A'}</TableCell>
                  <TableCell>{product.costPrice ? `$${product.costPrice}` : 'N/A'}</TableCell>
                  <TableCell>{product.sellingPrice ? `$${product.sellingPrice}` : 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product)}
                        disabled={deleteMutation.isPending}
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

      {filteredProducts?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {search || categoryFilter !== 'all' || statusFilter !== 'all' ? 'No products found matching your search' : 'No products found'}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update the product information.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                {...register('name', { required: 'Product name is required' })}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="edit-sku">SKU *</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-auto-sku"
                    checked={autoGenerateSku}
                    onChange={(e) => setAutoGenerateSku(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="edit-auto-sku" className="text-sm">Auto-generate</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  id="edit-sku"
                  {...register('sku', { required: 'SKU is required' })}
                  placeholder={autoGenerateSku ? "Will be auto-generated" : "Enter SKU"}
                  disabled={autoGenerateSku}
                  className="flex-1"
                />
                {autoGenerateSku && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const productName = watch('name') || 'PROD'
                      const generatedSku = generateSKU(productName)
                      setValue('sku', generatedSku)
                      console.log('🔄 Generated SKU for edit:', generatedSku)
                    }}
                  >
                    Generate
                  </Button>
                )}
              </div>
              {errors.sku && (
                <p className="text-sm text-red-500 mt-1">{errors.sku.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select onValueChange={(value) => setValue('categoryId', value === 'no-category' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or enter category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-category">No Category</SelectItem>
                  {categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2 flex gap-2">
                <Input
                  id="edit-new-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Or enter new category"
                  className="text-sm flex-1"
                />
                {newCategory.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCategory}
                    disabled={addCategoryMutation.isPending}
                  >
                    {addCategoryMutation.isPending ? 'Adding...' : 'Add'}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-uomId">Unit of Measure *</Label>
              <Select 
                value={watch('uomId')} 
                onValueChange={(value) => setValue('uomId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  {uoms?.map((uom: UOM) => (
                    <SelectItem key={uom.id} value={uom.id}>
                      {uom.name} ({uom.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('uomId')} />
            </div>
                <div>
                  <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                  <Input
                    id="edit-reorderLevel"
                    type="number"
                    min="0"
                    {...register('reorderLevel', { valueAsNumber: true })}
                    placeholder="Enter reorder level"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    {...register('description')}
                    placeholder="Enter product description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-barcode">Barcode</Label>
                  <Input
                    id="edit-barcode"
                    {...register('barcode')}
                    placeholder="Enter barcode"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-supplier">Supplier</Label>
                  <Select onValueChange={(value) => {
                    const supplier = suppliers?.find((s: Supplier) => s.id === value)
                    setValue('supplierId', value)
                    setValue('supplierName', supplier?.name || '')
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier: Supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-costPrice">Cost Price</Label>
                    <Input
                      id="edit-costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('costPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-sellingPrice">Selling Price</Label>
                    <Input
                      id="edit-sellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('sellingPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-minStock">Min Stock</Label>
                    <Input
                      id="edit-minStock"
                      type="number"
                      min="0"
                      {...register('minStock', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-maxStock">Max Stock</Label>
                    <Input
                      id="edit-maxStock"
                      type="number"
                      min="0"
                      {...register('maxStock', { valueAsNumber: true })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    {...register('isActive')}
                    className="rounded"
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This will move it to the deleted products section.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              disabled={deleteMutation.isPending}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Products</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProducts.length} selected product(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmBulkDelete} 
              disabled={bulkDeleteMutation.isPending}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedProducts.length} Products`}
            </Button>
          </DialogFooter>
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
