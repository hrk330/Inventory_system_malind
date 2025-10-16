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
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import { Plus, Search, Edit, Trash2, Tag, RefreshCw, X, CheckCircle, Grid3X3, List } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'

interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
  productCount?: number
}

interface CategoryFormData {
  name: string
}

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteCategoryName, setDeleteCategoryName] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  // Fetch categories with product counts
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories', search],
    queryFn: async () => {
      console.log('🏷️ Fetching categories with search:', search)
      try {
        const response = await apiClient.get('/products/categories')
        let categoriesData = response.data
        
        // Filter categories based on search
        if (search) {
          categoriesData = categoriesData.filter((category: Category) =>
            category.name.toLowerCase().includes(search.toLowerCase())
          )
        }
        
        console.log('✅ Categories fetched successfully:', categoriesData)
        return categoriesData
      } catch (error) {
        console.error('❌ Error fetching categories:', error)
        throw error
      }
    },
  })

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      console.log('➕ Creating category:', data)
      try {
        const response = await apiClient.post('/products/categories', {
          name: data.name
        })
        console.log('✅ Category created successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error creating category:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after category creation')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setIsCreateOpen(false)
      setSuccessMessage(`Category "${data.name}" created successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      reset()
    },
  })

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      console.log('✏️ Updating category:', id, 'to', newName)
      try {
        const response = await apiClient.patch(`/products/categories/${id}`, {
          name: newName
        })
        console.log('✅ Category updated successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error updating category:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after category update')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setIsEditOpen(false)
      setEditingCategory(null)
      setSuccessMessage(`Category updated to "${data.name}" successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      reset()
    },
  })

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      console.log('🗑️ Deleting category:', categoryId)
      try {
        const response = await apiClient.delete(`/products/categories/${categoryId}`)
        console.log('✅ Category deleted successfully:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error deleting category:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after category deletion')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeleteCategoryName(null)
      setSuccessMessage(`Category deleted successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
  })

  // Bulk delete categories mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      console.log('🗑️ Bulk deleting categories:', ids)
      try {
        const response = await apiClient.delete('/categories/bulk', {
          data: { ids }
        })
        console.log('✅ Categories bulk deleted successfully')
        return response.data
      } catch (error) {
        console.error('❌ Error bulk deleting categories:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after bulk category deletion')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setSelectedCategories([])
      setIsBulkDeleteOpen(false)
      setSuccessMessage(`${data.count} categories deleted successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
    onError: (error: any) => {
      setSuccessMessage(`❌ Error deleting categories: ${error.response?.data?.message || error.message || 'Unknown error'}`)
      setTimeout(() => setSuccessMessage(null), 5000)
    },
  })

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
    }
  })

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ 
        id: editingCategory.id, 
        newName: data.name 
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    reset({ name: category.name })
    setIsEditOpen(true)
  }

  const handleDelete = (categoryId: string, categoryName: string) => {
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? This will remove the category from all products that use it.`)) {
      deleteMutation.mutate(categoryId)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    console.log('🔄 Refreshing categories...')
    try {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      console.log('✅ Categories refreshed successfully')
    } catch (error) {
      console.error('❌ Error refreshing categories:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const clearSearch = () => {
    setSearch('')
  }

  // Bulk delete handlers
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCategories.length === categories?.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories?.map((c: Category) => c.id) || [])
    }
  }

  const handleBulkDelete = () => {
    if (selectedCategories.length > 0) {
      setIsBulkDeleteOpen(true)
    }
  }

  const confirmBulkDelete = () => {
    if (selectedCategories.length > 0) {
      bulkDeleteMutation.mutate(selectedCategories)
    }
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
          Error loading categories. Please check your connection and try again.
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
            <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage product categories ({categories?.length || 0} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            {selectedCategories.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedCategories.length})
              </Button>
            )}
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="mb-6">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
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
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
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
            Error creating category: {createMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {updateMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error updating category: {updateMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {deleteMutation.error && (
        <Alert className="mb-4">
          <AlertDescription>
            Error deleting category: {deleteMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Categories Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category: Category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleSelectCategory(category.id)}
                    className="rounded border-gray-300"
                  />
                  <Tag className="h-5 w-5" />
                  {category.name}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category._count?.products || 0} product{(category._count?.products || 0) !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant={category.isActive ? 'default' : 'outline'} className="text-xs">
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(category.id, category.name)}
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
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === categories?.length && categories?.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category: Category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelectCategory(category.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {category.description || 'No description'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category._count?.products || 0} product{(category._count?.products || 0) !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'default' : 'outline'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id, category.name)}
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
          </CardContent>
        </Card>
      )}

      {categories?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {search ? 'No categories found matching your search' : 'No categories found'}
          </p>
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Category name is required' })}
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                {...register('name', { required: 'Category name is required' })}
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Categories</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCategories.length} selected category(ies)? This action cannot be undone.
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
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedCategories.length} Categories`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
