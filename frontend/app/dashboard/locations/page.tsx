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
import { Plus, Search, MapPin, Warehouse, Edit, Trash2, Eye, Filter, X, RefreshCw, Settings, Package } from 'lucide-react'
import { useForm } from 'react-hook-form'

// Types
interface Location {
  id: string
  name: string
  type: 'WAREHOUSE' | 'STORE'
  address?: string
  createdAt: string
  updatedAt: string
}

interface LocationFormData {
  name: string
  type: 'WAREHOUSE' | 'STORE'
  address?: string
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

export default function LocationsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isStockOpen, setIsStockOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })

  const debouncedSearch = useDebounce(search, 300)

  // Form setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LocationFormData>()

  // Fetch locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations', debouncedSearch, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      return apiClient.get(`/locations?${params.toString()}`).then(res => res.data)
    },
  })

  // Fetch stock balances for selected location
  const { data: stockBalances, isLoading: isStockLoading } = useQuery({
    queryKey: ['location-stock', selectedLocation?.id],
    queryFn: () => {
      if (!selectedLocation) return []
      console.log(`🔍 Fetching stock for location: ${selectedLocation.name} (${selectedLocation.id})`)
      return apiClient.get(`/stock/balances/location/${selectedLocation.id}`).then(res => {
        console.log(`📊 Stock data received for ${selectedLocation.name}:`, res.data)
        return res.data
      })
    },
    enabled: !!selectedLocation,
  })

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const response = await apiClient.post('/locations', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      setIsCreateOpen(false)
      reset()
      setToast({
        message: '✅ Location created successfully!',
        type: 'success',
        isVisible: true
      })
    },
    onError: (error: any) => {
      setToast({
        message: `❌ Error creating location: ${error.response?.data?.message || 'Unknown error'}`,
        type: 'error',
        isVisible: true
      })
    }
  })

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LocationFormData }) => {
      const response = await apiClient.patch(`/locations/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      setIsEditOpen(false)
      setEditingLocation(null)
      reset()
      setToast({
        message: '✅ Location updated successfully!',
        type: 'success',
        isVisible: true
      })
    },
    onError: (error: any) => {
      setToast({
        message: `❌ Error updating location: ${error.response?.data?.message || 'Unknown error'}`,
        type: 'error',
        isVisible: true
      })
    }
  })

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/locations/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      setIsDeleteOpen(false)
      setLocationToDelete(null)
      setToast({
        message: '✅ Location deleted successfully!',
        type: 'success',
        isVisible: true
      })
    },
    onError: (error: any) => {
      setToast({
        message: `❌ Error deleting location: ${error.response?.data?.message || 'Unknown error'}`,
        type: 'error',
        isVisible: true
      })
    }
  })

  // Handlers
  const handleCreate = (data: LocationFormData) => {
    createMutation.mutate(data)
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setValue('name', location.name)
    setValue('type', location.type)
    setValue('address', location.address || '')
    setIsEditOpen(true)
  }

  const handleUpdate = (data: LocationFormData) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data })
    }
  }

  const handleDelete = (location: Location) => {
    setLocationToDelete(location)
    setIsDeleteOpen(true)
  }

  const handleViewStock = (location: Location) => {
    console.log(`🔍 Opening stock view for: ${location.name} (${location.id})`)
    setSelectedLocation(location)
    setIsStockOpen(true)
    
    // Clear any cached data for this location
    queryClient.invalidateQueries({ queryKey: ['location-stock', location.id] })
  }

  const confirmDelete = () => {
    if (locationToDelete) {
      deleteMutation.mutate(locationToDelete.id)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['locations'] })
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pr-1 overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-gray-600">Manage your warehouse and store locations</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                <SelectItem value="STORE">Store</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {viewMode === 'grid' ? 'Table View' : 'Grid View'}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {(search || typeFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pr-4 mr-2">
          {locations?.map((location: Location) => (
            <Card key={location.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {location.type === 'WAREHOUSE' ? (
                    <Warehouse className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MapPin className="h-5 w-5 text-green-600" />
                  )}
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                </div>
                <CardDescription className="capitalize">
                  {location.type.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Type:</span>
                    <span className="text-sm font-medium capitalize">
                      {location.type.toLowerCase()}
                    </span>
                  </div>
                  {location.address && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Address:</span>
                      <span className="text-sm font-medium">{location.address}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 min-w-0"
                    onClick={() => handleViewStock(location)}
                  >
                    <Eye className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">View Stock</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 min-w-0"
                    onClick={() => handleEdit(location)}
                  >
                    <Edit className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 min-w-0"
                    onClick={() => handleDelete(location)}
                  >
                    <Trash2 className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="pr-4 mr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations?.map((location: Location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {location.type === 'WAREHOUSE' ? (
                        <Warehouse className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MapPin className="h-4 w-4 text-green-600" />
                      )}
                      {location.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{location.type.toLowerCase()}</span>
                  </TableCell>
                  <TableCell>{location.address || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(location.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewStock(location)}
                        title="View Stock"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(location)}
                        title="Edit Location"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(location)}
                        title="Delete Location"
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

      {locations?.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No locations found</p>
          <p className="text-sm text-gray-400 mt-2">
            {search || typeFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first location'
            }
          </p>
        </div>
      )}

      {/* Create Location Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new warehouse or store location
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Location name is required' })}
                placeholder="Enter location name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select onValueChange={(value: 'WAREHOUSE' | 'STORE') => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                  <SelectItem value="STORE">Store</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Enter location address (optional)"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update location information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                {...register('name', { required: 'Location name is required' })}
                placeholder="Enter location name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-type">Type *</Label>
              <Select onValueChange={(value: 'WAREHOUSE' | 'STORE') => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                  <SelectItem value="STORE">Store</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                {...register('address')}
                placeholder="Enter location address (optional)"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{locationToDelete?.name}"? This action cannot be undone.
              {locationToDelete && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Note: This location cannot be deleted if it has existing stock balances.
                  </AlertDescription>
                </Alert>
              )}
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
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Stock Dialog */}
      <Dialog open={isStockOpen} onOpenChange={setIsStockOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Stock at {selectedLocation?.name}
            </DialogTitle>
            <DialogDescription>
              View all products and their quantities at this location
            </DialogDescription>
          </DialogHeader>
          
          {isStockLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : stockBalances && stockBalances.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {stockBalances.length} product{stockBalances.length !== 1 ? 's' : ''} in stock
                </p>
                <div className="flex items-center gap-2">
                  {selectedLocation?.type === 'WAREHOUSE' ? (
                    <Warehouse className="h-4 w-4 text-blue-600" />
                  ) : (
                    <MapPin className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm font-medium capitalize">
                    {selectedLocation?.type.toLowerCase()}
                  </span>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockBalances.map((balance: any, index: number) => {
                    console.log(`📊 Rendering stock item ${index}:`, {
                      productName: balance.product?.name,
                      productSku: balance.product?.sku,
                      quantity: balance.quantity,
                      locationId: balance.locationId,
                      balanceId: balance.id
                    })
                    return (
                      <TableRow key={balance.id}>
                        <TableCell className="font-medium">
                          {balance.product?.name || 'Unknown Product'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {balance.product?.sku || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {balance.product?.category || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            balance.quantity > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {balance.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          {balance.product?.uom?.symbol || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(balance.lastUpdated).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No stock found at this location</p>
              <p className="text-sm text-gray-400 mt-2">
                Products will appear here once they are added to this location
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockOpen(false)}>
              Close
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