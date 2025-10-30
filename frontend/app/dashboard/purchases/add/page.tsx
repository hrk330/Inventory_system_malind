'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Trash2, 
  Search, 
  Package,
  Calendar,
  DollarSign,
  ArrowLeft
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'

const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().optional(),
  productSku: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  costPrice: z.number().min(0, 'Cost price must be greater than or equal to 0'),
  retailPrice: z.number().min(0, 'Retail price must be greater than or equal to 0'),
  expiryDate: z.string().optional(),
  totalPrice: z.number().min(0, 'Total price must be greater than or equal to 0'),
})

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  referenceNo: z.string().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDate: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
})

type PurchaseOrderForm = z.infer<typeof purchaseOrderSchema>
type PurchaseItemForm = z.infer<typeof purchaseItemSchema>

interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
}

interface Product {
  id: string
  name: string
  sku: string
  uom: {
    symbol: string
  }
  costPrice?: number
  sellingPrice?: number
}

export default function AddPurchasePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const form = useForm<PurchaseOrderForm>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<{ data: Supplier[] }> => {
      const response = await apiClient.get('/suppliers')
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch products for search
  const { data: products } = useQuery({
    queryKey: ['products', { search: searchTerm }],
    queryFn: async (): Promise<{ data: Product[] }> => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      params.append('status', 'active')
      params.append('limit', '20')

      const response = await apiClient.get(`/products?${params.toString()}`)
      return response.data
    },
    enabled: showProductSearch && searchTerm.length > 2,
    retry: 1,
    staleTime: 1 * 60 * 1000,
  })

  // Create purchase order mutation
  const createMutation = useMutation({
    mutationFn: async (data: PurchaseOrderForm) => {
      const response = await apiClient.post('/purchases', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      toast.success('Purchase order created successfully')
      router.push('/dashboard/purchases')
    },
    onError: (error: any) => {
      console.error('Purchase order creation error:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to create purchase order')
    },
  })

  const handleAddProduct = (product: Product) => {
    const quantity = 1
    const costPrice = product.costPrice || 0
    const totalPrice = quantity * costPrice
    
    const newItem: PurchaseItemForm = {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: quantity,
      costPrice: costPrice,
      retailPrice: product.sellingPrice || 0,
      expiryDate: '',
      totalPrice: totalPrice,
    }
    append(newItem)
    setSelectedProduct(null)
    setShowProductSearch(false)
    setSearchTerm('')
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const currentCostPrice = form.watch(`items.${index}.costPrice`) || 0
    const totalPrice = quantity * currentCostPrice
    form.setValue(`items.${index}.quantity`, quantity)
    form.setValue(`items.${index}.totalPrice`, totalPrice)
  }

  const handleCostPriceChange = (index: number, costPrice: number) => {
    const currentQuantity = form.watch(`items.${index}.quantity`) || 0
    const totalPrice = currentQuantity * costPrice
    form.setValue(`items.${index}.costPrice`, costPrice)
    form.setValue(`items.${index}.totalPrice`, totalPrice)
  }

  const handleRetailPriceChange = (index: number, retailPrice: number) => {
    form.setValue(`items.${index}.retailPrice`, retailPrice)
  }

  const calculateTotal = () => {
    const watchedItems = form.watch('items') || []
    return watchedItems.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0)
  }

  const onSubmit = (data: PurchaseOrderForm) => {
    // Transform the data to match API expectations
    const apiData = {
      supplierId: data.supplierId,
      referenceNo: data.referenceNo || '',
      orderDate: data.orderDate,
      expectedDate: data.expectedDate || undefined,
      remarks: data.remarks || '',
      items: data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        costPrice: item.costPrice,
        retailPrice: item.retailPrice,
        expiryDate: item.expiryDate || undefined,
        totalPrice: item.totalPrice,
      }))
    }
    
    console.log('Sending data to API:', apiData)
    createMutation.mutate(apiData)
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
          <h1 className="text-3xl font-bold text-white">New Purchase Order</h1>
          <p className="text-gray-400">Create a new purchase order from your suppliers</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Information */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Order Information</CardTitle>
            <CardDescription className="text-gray-400">
              Basic information about the purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierId" className="text-gray-300">Supplier *</Label>
                <Select
                  value={form.watch('supplierId')}
                  onValueChange={(value) => form.setValue('supplierId', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.data?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.supplierId && (
                  <p className="text-red-400 text-sm">{form.formState.errors.supplierId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNo" className="text-gray-300">Reference Number</Label>
                <Input
                  id="referenceNo"
                  {...form.register('referenceNo')}
                  placeholder="PO-REF-001"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate" className="text-gray-300">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  {...form.register('orderDate')}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                {form.formState.errors.orderDate && (
                  <p className="text-red-400 text-sm">{form.formState.errors.orderDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDate" className="text-gray-300">Expected Date</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  {...form.register('expectedDate')}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-gray-300">Remarks</Label>
              <Textarea
                id="remarks"
                {...form.register('remarks')}
                placeholder="Additional notes about this order..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Products */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Order Items</CardTitle>
            <CardDescription className="text-gray-400">
              Add products to this purchase order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Product Search */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowProductSearch(true)
                    }}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Product Search Results */}
              {showProductSearch && products?.data && (
                <div className="border border-gray-600 rounded-lg bg-gray-700 max-h-60 overflow-y-auto">
                  {products.data.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                      onClick={() => handleAddProduct(product)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-sm text-gray-400">SKU: {product.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-300">
                            Cost: ${Number(product.costPrice || 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-300">
                            Retail: ${Number(product.sellingPrice || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Items Table */}
              {fields.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Product</TableHead>
                        <TableHead className="text-gray-300">Quantity</TableHead>
                        <TableHead className="text-gray-300">Cost Price</TableHead>
                        <TableHead className="text-gray-300">Retail Price</TableHead>
                        <TableHead className="text-gray-300">Total</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id} className="border-gray-700">
                          <TableCell className="text-white">
                            <div>
                              <div className="font-medium">
                                {field.productName || 'Unknown Product'}
                              </div>
                              <div className="text-sm text-gray-400">
                                SKU: {field.productSku || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              {...form.register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                                onChange: (e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)
                              })}
                              className="w-20 bg-gray-700 border-gray-600 text-white"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...form.register(`items.${index}.costPrice`, {
                                valueAsNumber: true,
                                onChange: (e) => handleCostPriceChange(index, parseFloat(e.target.value) || 0)
                              })}
                              className="w-24 bg-gray-700 border-gray-600 text-white"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...form.register(`items.${index}.retailPrice`, {
                                valueAsNumber: true,
                                onChange: (e) => handleRetailPriceChange(index, parseFloat(e.target.value) || 0)
                              })}
                              className="w-24 bg-gray-700 border-gray-600 text-white"
                            />
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            ${Number(form.watch(`items.${index}.totalPrice`) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet. Search and add products to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        {fields.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-300">Total Items:</span>
                  <span className="text-white font-medium">{fields.length}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-300">Total Quantity:</span>
                  <span className="text-white font-medium">
                    {(form.watch('items') || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-white">Total Amount:</span>
                    <span className="text-white">${Number(calculateTotal() || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Errors */}
        {form.formState.errors.items && (
          <div className="text-red-400 text-sm">
            {form.formState.errors.items.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || fields.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
