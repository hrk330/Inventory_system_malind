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
import { Plus, Search, Edit, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

interface SupplierFormData {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
}

export default function SuppliersPage() {
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Fetch suppliers
  const { data: suppliersResponse, isLoading, error } = useQuery<{data: Supplier[], meta: any}>({
    queryKey: ['suppliers', search],
    queryFn: async () => {
      console.log('🏢 Fetching suppliers with search:', search)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      try {
        const response = await apiClient.get(`/suppliers?${params.toString()}`)
        console.log('✅ Suppliers fetched successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error fetching suppliers:', error)
        throw error
      }
    },
  })

  // Extract suppliers array from paginated response
  const suppliers: Supplier[] = Array.isArray(suppliersResponse) 
    ? suppliersResponse 
    : suppliersResponse?.data || []

  // Create supplier mutation
  const createMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      console.log('➕ Creating supplier:', data)
      try {
        const response = await apiClient.post('/suppliers', data)
        console.log('✅ Supplier created successfully:', response.data)
        return response.data
      } catch (error: any) {
        console.error('❌ Error creating supplier:', error)
        
        // Extract user-friendly error message
        let errorMessage = 'An unexpected error occurred. Please try again.'
        
        if (error.response?.status === 409) {
          errorMessage = 'A supplier with this name already exists. Please choose a different name.'
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'Please check your input and try again.'
        } else if (error.response?.status === 401) {
          errorMessage = 'You are not authorized to perform this action. Please log in again.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        // Create a new error with the user-friendly message
        const friendlyError = new Error(errorMessage)
        friendlyError.name = error.name
        throw friendlyError
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after supplier creation')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setIsCreateOpen(false)
      reset()
    },
  })

  // Update supplier mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SupplierFormData }) => {
      console.log('✏️ Updating supplier:', id, data)
      try {
        const response = await apiClient.patch(`/suppliers/${id}`, data)
        console.log('✅ Supplier updated successfully:', response.data)
        return response.data
      } catch (error: any) {
        console.error('❌ Error updating supplier:', error)
        
        // Extract user-friendly error message
        let errorMessage = 'An unexpected error occurred. Please try again.'
        
        if (error.response?.status === 409) {
          errorMessage = 'A supplier with this name already exists. Please choose a different name.'
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'Please check your input and try again.'
        } else if (error.response?.status === 401) {
          errorMessage = 'You are not authorized to perform this action. Please log in again.'
        } else if (error.response?.status === 404) {
          errorMessage = 'Supplier not found. It may have been deleted.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        // Create a new error with the user-friendly message
        const friendlyError = new Error(errorMessage)
        friendlyError.name = error.name
        throw friendlyError
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after supplier update')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setIsEditOpen(false)
      setEditingSupplier(null)
      reset()
    },
  })

  // Delete supplier mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting supplier:', id)
      try {
        const response = await apiClient.delete(`/suppliers/${id}`)
        console.log('✅ Supplier deleted successfully')
        return response.data
      } catch (error: any) {
        console.error('❌ Error deleting supplier:', error)
        
        // Extract user-friendly error message
        let errorMessage = 'An unexpected error occurred. Please try again.'
        
        if (error.response?.status === 404) {
          errorMessage = 'Supplier not found. It may have already been deleted.'
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'Cannot delete this supplier. It may be in use.'
        } else if (error.response?.status === 401) {
          errorMessage = 'You are not authorized to perform this action. Please log in again.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        // Create a new error with the user-friendly message
        const friendlyError = new Error(errorMessage)
        friendlyError.name = error.name
        throw friendlyError
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after supplier deletion')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setDeleteSupplierId(null)
    },
  })

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🔄 Toggling active status for supplier:', id)
      try {
        const response = await apiClient.patch(`/suppliers/${id}/toggle-active`)
        console.log('✅ Supplier status toggled successfully:', response.data)
        return response.data
      } catch (error: any) {
        console.error('❌ Error toggling supplier status:', error)
        
        // Extract user-friendly error message
        let errorMessage = 'An unexpected error occurred. Please try again.'
        
        if (error.response?.status === 404) {
          errorMessage = 'Supplier not found. It may have been deleted.'
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'Cannot update supplier status.'
        } else if (error.response?.status === 401) {
          errorMessage = 'You are not authorized to perform this action. Please log in again.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        // Create a new error with the user-friendly message
        const friendlyError = new Error(errorMessage)
        friendlyError.name = error.name
        throw friendlyError
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after supplier status toggle')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  // Form handling
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SupplierFormData>({
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      isActive: true,
    }
  })

  const onSubmit = (data: SupplierFormData) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setValue('name', supplier.name)
    setValue('contactPerson', supplier.contactPerson || '')
    setValue('email', supplier.email || '')
    setValue('phone', supplier.phone || '')
    setValue('address', supplier.address || '')
    setValue('isActive', supplier.isActive)
    setIsEditOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggleActive = (id: string) => {
    toggleActiveMutation.mutate(id)
  }

  const clearSearch = () => {
    setSearch('')
  }

  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateOpen) {
      reset({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        isActive: true,
      })
    }
  }, [isCreateOpen, reset])

  useEffect(() => {
    if (!isEditOpen) {
      setEditingSupplier(null)
      reset({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        isActive: true,
      })
    }
  }, [isEditOpen, reset])

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
          Error loading suppliers. Please check your connection and try again.
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
            <h1 className="text-3xl font-bold text-white">Suppliers</h1>
            <p className="mt-1 text-lg text-gray-300">
              Manage your suppliers ({suppliers?.length || 0} total)
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/suppliers/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search suppliers by name, contact person, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {createMutation.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {createMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {updateMutation.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {updateMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {deleteMutation.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {deleteMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {toggleActiveMutation.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {toggleActiveMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Suppliers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers?.map((supplier: Supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson || 'N/A'}</TableCell>
                <TableCell>{supplier.email || 'N/A'}</TableCell>
                <TableCell>{supplier.phone || 'N/A'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(supplier.id)}
                      disabled={toggleActiveMutation.isPending}
                    >
                      {supplier.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(supplier.id)}
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

      {suppliers?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-300">No suppliers found</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the supplier information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Supplier Name *</Label>
              <Input
                id="edit-name"
                {...register('name', { required: 'Supplier name is required' })}
                placeholder="Enter supplier name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-contactPerson">Contact Person</Label>
              <Input
                id="edit-contactPerson"
                {...register('contactPerson')}
                placeholder="Enter contact person name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <textarea
                id="edit-address"
                {...register('address')}
                placeholder="Enter address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
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
                {updateMutation.isPending ? 'Updating...' : 'Update Supplier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
