'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Toast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api-client'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'

interface ProductFormData {
  name: string
  sku: string
  categoryId?: string
  companyId?: string
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

interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Company {
  id: string
  name: string
  code?: string
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

export default function AddProductPage() {
  const [autoGenerateSku, setAutoGenerateSku] = useState(true)
  const [newCategory, setNewCategory] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [toast, setToast] = useState({
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
    isVisible: false
  })
  
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Fetch categories
  const { data: categoriesResponse } = useQuery<Category[] | {data: Category[], meta: any}>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/categories')
        return response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
      }
    },
  })
  const categories: Category[] = Array.isArray(categoriesResponse) 
    ? categoriesResponse 
    : categoriesResponse?.data || []

  // Fetch UOMs
  const { data: uomsResponse } = useQuery<UOM[] | {data: UOM[], meta: any}>({
    queryKey: ['uoms'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/uoms')
        return response.data
      } catch (error) {
        console.error('Error fetching UOMs:', error)
        return []
      }
    },
  })
  const uoms: UOM[] = Array.isArray(uomsResponse) 
    ? uomsResponse 
    : uomsResponse?.data || []

  // Fetch suppliers
  const { data: suppliersResponse } = useQuery<Supplier[] | {data: Supplier[], meta: any}>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/suppliers')
        return response.data
      } catch (error) {
        console.error('Error fetching suppliers:', error)
        throw error
      }
    },
  })
  const suppliers: Supplier[] = Array.isArray(suppliersResponse) 
    ? suppliersResponse 
    : suppliersResponse?.data || []

  // Fetch companies
  const { data: companiesResponse } = useQuery<{data: Company[]}>({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await apiClient.get('/companies?limit=100')
      return res.data
    }
  })
  const companies: Company[] = companiesResponse?.data || []

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      console.log('➕ Creating product:', data)
      console.log('🔍 UOM ID being sent:', data.uomId)
      try {
        const response = await apiClient.post('/products', data)
        console.log('✅ Product created successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error creating product:', error)
        
        // Type guard to safely access error properties
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any
          console.error('❌ Error details:', axiosError.response?.data)
        } else {
          console.error('❌ Error details:', error)
        }
        
        throw error
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after product creation')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
      setToast({
        message: '✅ Product created successfully!',
        type: 'success',
        isVisible: true
      })
      setTimeout(() => {
        router.push('/dashboard/products')
      }, 1500) // Wait for toast to show before redirecting
    },
    onError: (error: any) => {
      console.error('❌ Error creating product:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred'
      setToast({
        message: `❌ Error creating product: ${errorMessage}`,
        type: 'error',
        isVisible: true
      })
    }
  })

  // Add new category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryName: string) => {
      console.log('➕ Adding new category:', categoryName)
      try {
        const response = await apiClient.post('/categories', {
          name: categoryName
        })
        console.log('✅ Category created successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error adding category:', error)
        throw error
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after category addition')
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

  // Form handling
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      sku: '',
      categoryId: undefined,
      companyId: undefined,
      uomId: 'uom-pcs',
      reorderLevel: 0,
      description: undefined,
      barcode: undefined,
      supplierId: undefined,
      supplierName: undefined,
      costPrice: undefined,
      sellingPrice: undefined,
      minStock: 0,
      maxStock: undefined,
      isActive: true,
      images: undefined,
    }
  })

  // Generate unique SKU
  const generateSKU = (productName: string) => {
    const timestamp = Date.now().toString().slice(-6)
    const namePrefix = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3)
    return `${namePrefix}-${timestamp}`
  }

  const onSubmit = (data: ProductFormData) => {
    // Clean up the data before sending - convert empty strings to null/undefined for optional fields
    const cleanedData = {
      ...data,
      supplierId: data.supplierId || undefined,
      supplierName: data.supplierName || undefined,
      categoryId: data.categoryId || undefined,
      description: data.description || undefined,
      barcode: data.barcode || undefined,
      costPrice: data.costPrice || undefined,
      sellingPrice: data.sellingPrice || undefined,
      maxStock: data.maxStock || undefined,
      images: data.images || undefined,
    }
    
    console.log('🧹 Cleaned form data:', cleanedData)
    
    // Show loading toast
    setToast({
      message: '⏳ Creating product...',
      type: 'info',
      isVisible: true
    })
    
    createMutation.mutate(cleanedData)
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

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Product</h1>
            <p className="mt-1 text-lg text-gray-300">
              Create a new product in your inventory
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Product name is required' })}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-sku"
                        checked={autoGenerateSku}
                        onChange={(e) => setAutoGenerateSku(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="auto-sku" className="text-sm">Auto-generate</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
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
                          console.log('🔄 Generated SKU:', generatedSku)
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
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => setValue('categoryId', value === 'no-category' ? '' : value)}>
                    <SelectTrigger className="flex-1">
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCategoryOpen(true)}
                  >
                    Add New
                  </Button>
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="new-category"
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

              {/* Company */}
              <div>
                <Label htmlFor="company">Company</Label>
                <Select onValueChange={(value) => setValue('companyId', value === 'no-company' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-company">No Company</SelectItem>
                    {companies?.map((company: Company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter product description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Barcode and Supplier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    {...register('barcode')}
                    placeholder="Enter barcode (optional)"
                  />
                  <p className="text-sm text-gray-300 mt-1">
                    Leave empty if no barcode available. Each barcode must be unique.
                  </p>
                </div>

                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select onValueChange={(value) => {
                    if (value === 'no-supplier') {
                      setValue('supplierId', undefined)
                      setValue('supplierName', undefined)
                    } else {
                      const supplier = suppliers?.find((s: Supplier) => s.id === value)
                      setValue('supplierId', value)
                      setValue('supplierName', supplier?.name || '')
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-supplier">No Supplier</SelectItem>
                      {suppliers?.map((supplier: Supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('costPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('sellingPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Stock Levels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="uomId">Unit of Measure *</Label>
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
                  <Label htmlFor="reorderLevel">Reorder Level</Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    min="0"
                    {...register('reorderLevel', { valueAsNumber: true })}
                    placeholder="Enter reorder level"
                  />
                </div>

                <div>
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    {...register('minStock', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxStock">Max Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="0"
                  {...register('maxStock', { valueAsNumber: true })}
                  placeholder="Optional"
                />
              </div>


              {/* Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              {/* Error Messages */}
              {addCategoryMutation.error && (
                <Alert>
                  <AlertDescription>
                    Error adding category: {addCategoryMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
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
