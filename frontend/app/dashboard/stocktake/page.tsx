'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'
import { Plus, ClipboardList, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface StocktakeFormData {
  productId: string
  locationId: string
  countedQuantity: number
  remarks?: string
}

export default function StocktakePage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [isStocktakeOpen, setIsStocktakeOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<StocktakeFormData>({
    mode: 'onChange',
    defaultValues: {
      productId: '',
      locationId: '',
      countedQuantity: 0,
      remarks: ''
    }
  })

  const watchedProductId = watch('productId')
  const watchedLocationId = watch('locationId')

  const { data: stocktakes, isLoading } = useQuery({
    queryKey: ['stocktakes', search, locationFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (locationFilter !== 'all') params.append('locationId', locationFilter)
      return apiClient.get(`/stocktake?${params.toString()}`).then(res => res.data)
    },
  })

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['stocktake-summary'],
    queryFn: () => apiClient.get('/stocktake/summary').then(res => res.data),
  })

  // Fetch products and locations for dropdowns
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then(res => res.data),
  })

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations').then(res => res.data),
  })

  // Stocktake mutation
  const stocktakeMutation = useMutation({
    mutationFn: (data: StocktakeFormData) => {
      console.log('Submitting stocktake data:', data)
      return apiClient.post('/stocktake', data)
    },
    onSuccess: (response) => {
      console.log('Stocktake created successfully:', response.data)
      queryClient.invalidateQueries({ queryKey: ['stocktakes'] })
      queryClient.invalidateQueries({ queryKey: ['stocktake-summary'] })
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] })
      reset()
      setIsStocktakeOpen(false)
      
      // Show success message
      console.log('Stock count recorded successfully!')
    },
    onError: (error) => {
      console.error('Error creating stocktake:', error)
    },
  })

  const onSubmit = (data: StocktakeFormData) => {
    console.log('Form submitted with data:', data)
    
    // Additional validation
    if (!data.productId || !data.locationId || data.countedQuantity === undefined) {
      console.error('Form validation failed:', data)
      return
    }
    
    // Ensure countedQuantity is a number
    const submitData = {
      ...data,
      countedQuantity: Number(data.countedQuantity)
    }
    
    console.log('Submitting with converted data:', submitData)
    stocktakeMutation.mutate(submitData)
  }

  if (isLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stocktake</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manual stock counting and adjustments
            </p>
          </div>
          <Dialog open={isStocktakeOpen} onOpenChange={setIsStocktakeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Stocktake
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Perform Stock Count</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="productId">Product *</Label>
                  <Select 
                    onValueChange={(value) => {
                      setValue('productId', value, { shouldValidate: true })
                    }}
                  >
                    <SelectTrigger className={!watchedProductId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product: any) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!watchedProductId && (
                    <p className="text-sm text-red-600 mt-1">Product is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="locationId">Location *</Label>
                  <Select 
                    onValueChange={(value) => {
                      setValue('locationId', value, { shouldValidate: true })
                    }}
                  >
                    <SelectTrigger className={!watchedLocationId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((location: any) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!watchedLocationId && (
                    <p className="text-sm text-red-600 mt-1">Location is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="countedQuantity">Counted Quantity *</Label>
                  <Input
                    id="countedQuantity"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('countedQuantity', { 
                      required: 'Counted quantity is required',
                      min: { value: 0, message: 'Quantity must be 0 or greater' },
                      valueAsNumber: true
                    })}
                    placeholder="Enter counted quantity"
                    className={errors.countedQuantity ? 'border-red-500' : ''}
                  />
                  {errors.countedQuantity && (
                    <p className="text-sm text-red-600 mt-1">{errors.countedQuantity.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    {...register('remarks')}
                    placeholder="Add any notes about this count"
                    rows={3}
                  />
                </div>

                {stocktakeMutation.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">
                      Error: {(stocktakeMutation.error as any)?.response?.data?.message || 'Failed to record stock count'}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={stocktakeMutation.isPending || !watchedProductId || !watchedLocationId} 
                    className="flex-1"
                  >
                    {stocktakeMutation.isPending ? 'Processing...' : 'Record Count'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsStocktakeOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stocktakes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations?.map((location: any) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Counts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.totalCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Adjustments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.adjustments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Adjustment</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.totalAdjustment || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Counts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.recentStocktakes?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stocktakes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stocktakes</CardTitle>
          <CardDescription>
            Latest manual stock counts and adjustments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stocktakes?.slice(0, 10).map((stocktake: any) => (
              <div key={stocktake.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{stocktake.product.name}</div>
                      <div className="text-sm text-gray-500">
                        {stocktake.location.name} • {stocktake.performer.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {stocktake.countedQuantity} {stocktake.product.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      System: {stocktake.systemQuantity}
                    </div>
                  </div>
                </div>
                
                {stocktake.adjustment !== 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Adjustment:</span>
                    <span className={`text-sm font-medium ${
                      stocktake.adjustment > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stocktake.adjustment > 0 ? '+' : ''}{stocktake.adjustment} {stocktake.product.unit}
                    </span>
                    {stocktake.adjustment > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(stocktake.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {stocktakes?.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No stocktakes found</p>
              <p className="text-sm text-gray-400 mt-1">Start by performing a manual count</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
