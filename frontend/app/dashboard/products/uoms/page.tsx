'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/api-client'
import { Plus, Search, Edit, Trash2, Ruler, RefreshCw, X, CheckCircle, Grid3X3, List } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'

interface UOM {
  id: string
  name: string
  symbol: string
  description?: string
  productCount: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

interface UOMFormData {
  name: string
  symbol: string
  description?: string
}


export default function UOMsPage() {
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUOM, setEditingUOM] = useState<UOM | null>(null)
  const [deleteUOMName, setDeleteUOMName] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  // Fetch UOMs with product counts
  const { data: uoms, isLoading, error } = useQuery<UOM[]>({
    queryKey: ['uoms', search],
    queryFn: async () => {
      console.log('📏 Fetching UOMs with search:', search)
      try {
        const response = await apiClient.get('/uoms')
        let uomsData = response.data
        
        // Filter based on search
        if (search) {
          uomsData = uomsData.filter((uom: any) =>
            uom.name.toLowerCase().includes(search.toLowerCase()) ||
            uom.symbol.toLowerCase().includes(search.toLowerCase())
          )
        }
        
        console.log('✅ UOMs fetched successfully:', uomsData)
        return uomsData
      } catch (error) {
        console.error('❌ Error fetching UOMs:', error)
        throw error
      }
    },
  })

  // Create UOM mutation
  const createMutation = useMutation({
    mutationFn: async (data: UOMFormData) => {
      console.log('➕ Creating UOM:', data)
      try {
        const response = await apiClient.post('/uoms', {
          name: data.name,
          symbol: data.symbol,
          description: data.description
        })
        console.log('✅ UOM created successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error creating UOM:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after UOM creation')
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
      setIsCreateOpen(false)
      setSuccessMessage(`UOM "${data.name}" created successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      reset()
    },
  })

  // Update UOM mutation
  const updateMutation = useMutation({
    mutationFn: async ({ uomId, newData }: { uomId: string; newData: UOMFormData }) => {
      console.log('✏️ Updating UOM:', uomId, 'to', newData)
      try {
        const response = await apiClient.patch(`/uoms/${uomId}`, {
          name: newData.name,
          symbol: newData.symbol,
          description: newData.description
        })
        console.log('✅ UOM updated successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error updating UOM:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after UOM update')
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setIsEditOpen(false)
      setEditingUOM(null)
      setSuccessMessage(`UOM "${data.name}" updated successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      reset()
    },
  })

  // Delete UOM mutation
  const deleteMutation = useMutation({
    mutationFn: async (uomId: string) => {
      console.log('🗑️ Deleting UOM:', uomId)
      try {
        const response = await apiClient.delete(`/uoms/${uomId}`)
        console.log('✅ UOM deleted successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error deleting UOM:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after UOM deletion')
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeleteUOMName(null)
      setSuccessMessage(`UOM deleted successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
  })

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UOMFormData>({
    defaultValues: {
      name: '',
      symbol: '',
      description: '',
    }
  })

  const onSubmit = (data: UOMFormData) => {
    if (editingUOM) {
      updateMutation.mutate({ 
        uomId: editingUOM.id, 
        newData: data 
      })
    } else {
      // Check if symbol already exists
      const existingUOM = uoms?.find((uom: UOM) => uom.symbol.toLowerCase() === data.symbol.toLowerCase())
      if (existingUOM) {
        alert(`A UOM with symbol "${data.symbol}" already exists. Please choose a different symbol.`)
        return
      }
      createMutation.mutate(data)
    }
  }

  const handleEdit = (uom: UOM) => {
    setEditingUOM(uom)
    reset({ 
      name: uom.name, 
      symbol: uom.symbol, 
      description: uom.description || '' 
    })
    setIsEditOpen(true)
  }

  const handleDelete = (uom: UOM) => {
    if (confirm(`Are you sure you want to delete the UOM "${uom.name}" (${uom.symbol})? This action cannot be undone.`)) {
      deleteMutation.mutate(uom.id)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    console.log('🔄 Refreshing UOMs...')
    try {
      await queryClient.invalidateQueries({ queryKey: ['uoms'] })
      console.log('✅ UOMs refreshed successfully')
    } catch (error) {
      console.error('❌ Error refreshing UOMs:', error)
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
          Error loading UOMs. Please check your connection and try again.
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
            <h1 className="text-2xl font-bold text-gray-900">Units of Measure (UOMs)</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage units of measure for products ({uoms?.length || 0} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="flex items-center gap-2"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
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
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add UOM
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search UOMs..."
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


      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {createMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error creating UOM: {createMutation.error.message.includes('409') 
              ? 'A UOM with this symbol already exists. Please choose a different symbol.' 
              : createMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {updateMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error updating UOM: {updateMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {deleteMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error deleting UOM: {deleteMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* UOMs Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uoms?.map((uom: UOM) => (
            <Card key={uom.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  {uom.name}
                </CardTitle>
                <CardDescription>
                  Symbol: {uom.symbol} • {uom.productCount} product{uom.productCount !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{uom.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(uom)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(uom)}
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
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Product Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uoms?.map((uom: UOM) => (
                <TableRow key={uom.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-primary" />
                    {uom.name}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {uom.symbol}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {uom.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {uom.productCount} product{uom.productCount !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${uom.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {uom.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(uom)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(uom)}
                        disabled={deleteMutation.isPending}
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

      {uoms?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {search ? 'No UOMs found matching your search' : 'No UOMs found'}
          </p>
        </div>
      )}

      {/* Create UOM Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New UOM</DialogTitle>
            <DialogDescription>
              Create a new unit of measure for products.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">UOM Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'UOM name is required' })}
                placeholder="e.g., Kilograms"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                {...register('symbol', { required: 'Symbol is required' })}
                placeholder="e.g., kg"
              />
              {errors.symbol && (
                <p className="text-sm text-red-500 mt-1">{errors.symbol.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="e.g., Weight measurement"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create UOM'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit UOM Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit UOM</DialogTitle>
            <DialogDescription>
              Update the unit of measure information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">UOM Name *</Label>
              <Input
                id="edit-name"
                {...register('name', { required: 'UOM name is required' })}
                placeholder="e.g., Kilograms"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-symbol">Symbol *</Label>
              <Input
                id="edit-symbol"
                {...register('symbol', { required: 'Symbol is required' })}
                placeholder="e.g., kg"
              />
              {errors.symbol && (
                <p className="text-sm text-red-500 mt-1">{errors.symbol.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                {...register('description')}
                placeholder="e.g., Weight measurement"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update UOM'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
