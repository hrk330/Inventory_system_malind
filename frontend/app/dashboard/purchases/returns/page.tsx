'use client'

import { useState } from 'react'
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
  ArrowLeft,
  RotateCcw
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

const returnItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  costPrice: z.number().min(0, 'Cost price must be greater than or equal to 0'),
  totalPrice: z.number().min(0, 'Total price must be greater than or equal to 0'),
  reason: z.string().optional(),
})

const purchaseReturnSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  reason: z.string().min(1, 'Reason is required'),
  remarks: z.string().optional(),
  items: z.array(returnItemSchema).min(1, 'At least one item is required'),
})

type PurchaseReturnForm = z.infer<typeof purchaseReturnSchema>
type ReturnItemForm = z.infer<typeof returnItemSchema>

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: {
    id: string
    name: string
  }
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
}

export default function PurchaseReturnsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)

  const form = useForm<PurchaseReturnForm>({
    resolver: zodResolver(purchaseReturnSchema),
    defaultValues: {
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Watch the form values to ensure proper re-rendering
  const watchedFields = form.watch('items')

  // Fetch purchase orders
  const { data: purchaseOrders } = useQuery({
    queryKey: ['purchases'],
    queryFn: async (): Promise<{ data: PurchaseOrder[] }> => {
      const response = await apiClient.get('/purchases?status=RECEIVED&limit=100')
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Create return mutation
  const createReturnMutation = useMutation({
    mutationFn: async (data: PurchaseReturnForm) => {
      const response = await apiClient.post('/purchases/returns', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      toast.success('Purchase return created successfully')
      router.push('/dashboard/purchases')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create purchase return')
    },
  })

  const handleOrderSelect = (orderId: string) => {
    console.log('Order selected:', orderId)
    const order = purchaseOrders?.data?.find(o => o.id === orderId)
    if (order) {
      console.log('Found order:', order)
      setSelectedOrder(order)
      form.setValue('purchaseOrderId', order.id)
      form.setValue('supplierId', order.supplier.id)
      
      // Clear existing items
      form.setValue('items', [])
      
      // Trigger validation to update form state
      form.trigger(['purchaseOrderId', 'supplierId'])
      
      console.log('Form values after order select:', form.getValues())
    }
  }

  const handleAddItem = (item: any) => {
    const newItem: ReturnItemForm = {
      productId: item.product.id,
      quantity: 0,
      costPrice: Number(item.costPrice),
      totalPrice: 0,
      reason: '',
    }
    append(newItem)
  }

  const getMaxQuantityForItem = (productId: string) => {
    if (!selectedOrder) return 0
    const orderItem = selectedOrder.items.find(item => item.product.id === productId)
    return orderItem?.quantity || 0
  }

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = value === '' ? 0 : parseFloat(value) || 0
    const currentItem = fields[index]
    const maxQuantity = getMaxQuantityForItem(currentItem.productId)
    
    // Check if user is trying to exceed maximum quantity
    if (quantity > maxQuantity) {
      toast.error(`Cannot return more than ${maxQuantity} items (available in purchase order)`)
    }
    
    // Limit quantity to the maximum available in the purchase order
    const limitedQuantity = Math.min(quantity, maxQuantity)
    
    const totalPrice = limitedQuantity * Number(currentItem.costPrice)
    form.setValue(`items.${index}.quantity`, limitedQuantity)
    form.setValue(`items.${index}.totalPrice`, totalPrice)
    
    // Trigger validation for this item
    form.trigger(`items.${index}`)
  }

  const calculateTotal = () => {
    return (watchedFields || []).reduce((sum, item) => sum + (item?.totalPrice || 0), 0)
  }

  const calculateTotalQuantity = () => {
    return (watchedFields || []).reduce((sum, item) => sum + (item?.quantity || 0), 0)
  }

  const onSubmit = (data: PurchaseReturnForm) => {
    console.log('Form submitted with data:', data)
    console.log('Form errors:', form.formState.errors)
    createReturnMutation.mutate(data)
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
          <p className="text-gray-400">Create returns for received purchase orders</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Return Information */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Return Information</CardTitle>
            <CardDescription className="text-gray-400">
              Select the purchase order and provide return details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseOrderId" className="text-gray-300">Purchase Order *</Label>
                <Select
                  value={form.watch('purchaseOrderId')}
                  onValueChange={handleOrderSelect}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select purchase order" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders?.data?.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.orderNumber} - {order.supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.purchaseOrderId && (
                  <p className="text-red-400 text-sm">{form.formState.errors.purchaseOrderId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-300">Return Reason *</Label>
                <Input
                  id="reason"
                  {...form.register('reason')}
                  placeholder="e.g., Defective products, Wrong items, etc."
                  className="bg-gray-700 border-gray-600 text-white"
                />
                {form.formState.errors.reason && (
                  <p className="text-red-400 text-sm">{form.formState.errors.reason.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-gray-300">Remarks</Label>
              <Textarea
                id="remarks"
                {...form.register('remarks')}
                placeholder="Additional notes about this return..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
              {form.formState.errors.remarks && (
                <p className="text-red-400 text-sm">{form.formState.errors.remarks.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Items */}
        {selectedOrder && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Available Items</CardTitle>
              <CardDescription className="text-gray-400">
                Select items to return from order #{selectedOrder.orderNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Product</TableHead>
                      <TableHead className="text-gray-300">SKU</TableHead>
                      <TableHead className="text-gray-300">Quantity</TableHead>
                      <TableHead className="text-gray-300">Cost Price</TableHead>
                      <TableHead className="text-gray-300">Total</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id} className="border-gray-700">
                        <TableCell className="text-white">
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{item.product.sku}</TableCell>
                        <TableCell className="text-gray-300">
                          {item.quantity} {item.product.uom.symbol}
                        </TableCell>
                        <TableCell className="text-gray-300">${Number(item.costPrice || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-white font-medium">${Number(item.totalPrice || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAddItem(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Return Items */}
        {fields.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Return Items</CardTitle>
              <CardDescription className="text-gray-400">
                Items to be returned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Product</TableHead>
                      <TableHead className="text-gray-300">Return Qty</TableHead>
                      <TableHead className="text-gray-300">Cost Price</TableHead>
                      <TableHead className="text-gray-300">Reason</TableHead>
                      <TableHead className="text-gray-300">Total</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const product = selectedOrder?.items.find(
                        item => item.product.id === field.productId
                      )?.product
                      return (
                        <TableRow key={field.id} className="border-gray-700">
                          <TableCell className="text-white">
                            <div>
                              <div className="font-medium">{product?.name || 'Unknown Product'}</div>
                              <div className="text-sm text-gray-400">SKU: {product?.sku || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={getMaxQuantityForItem(field.productId)}
                              {...form.register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                                onChange: (e) => handleQuantityChange(index, e.target.value)
                              })}
                              value={watchedFields?.[index]?.quantity || field.quantity || ''}
                                className="w-20 bg-gray-700 border-gray-600 text-white"
                              />
                              <div className="text-xs text-gray-400 mt-1">
                                Max: {getMaxQuantityForItem(field.productId)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">${Number(field.costPrice || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Input
                              {...form.register(`items.${index}.reason`)}
                              value={watchedFields?.[index]?.reason || field.reason || ''}
                              placeholder="Return reason"
                              className="w-32 bg-gray-700 border-gray-600 text-white"
                            />
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            ${Number((watchedFields?.[index]?.totalPrice || field.totalPrice) || 0).toFixed(2)}
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
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Return Summary */}
        {fields.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Return Summary</CardTitle>
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
                    {calculateTotalQuantity()}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-white">Total Refund:</span>
                    <span className="text-white">${Number(calculateTotal() || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Information */}
        <Card className="bg-blue-900/20 border-blue-500">
          <CardContent className="p-4">
            <h3 className="text-blue-400 font-medium mb-2">Debug Information:</h3>
            <div className="text-sm text-blue-300 space-y-1">
              <div>Form Values: {JSON.stringify(form.getValues(), null, 2)}</div>
              <div>Form Errors: {JSON.stringify(form.formState.errors, null, 2)}</div>
              <div>Is Form Valid: {form.formState.isValid ? 'Yes' : 'No'}</div>
              <div>Is Form Dirty: {form.formState.isDirty ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Form Errors */}
        {Object.keys(form.formState.errors).length > 0 && (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="p-4">
              <h3 className="text-red-400 font-medium mb-2">Please fix the following errors:</h3>
              <ul className="space-y-1 text-sm text-red-300">
                {form.formState.errors.purchaseOrderId && (
                  <li>• {form.formState.errors.purchaseOrderId.message}</li>
                )}
                {form.formState.errors.supplierId && (
                  <li>• {form.formState.errors.supplierId.message}</li>
                )}
                {form.formState.errors.reason && (
                  <li>• {form.formState.errors.reason.message}</li>
                )}
                {form.formState.errors.remarks && (
                  <li>• {form.formState.errors.remarks.message}</li>
                )}
                {form.formState.errors.items && (
                  <li>• {form.formState.errors.items.message}</li>
                )}
                {form.formState.errors.items?.root && (
                  <li>• {form.formState.errors.items.root.message}</li>
                )}
              </ul>
            </CardContent>
          </Card>
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
            disabled={createReturnMutation.isPending || fields.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              console.log('Create Return button clicked')
              console.log('Form values:', form.getValues())
              console.log('Form errors:', form.formState.errors)
              console.log('Is form valid:', form.formState.isValid)
            }}
          >
            {createReturnMutation.isPending ? 'Creating Return...' : 'Create Return'}
          </Button>
        </div>
      </form>
    </div>
  )
}
