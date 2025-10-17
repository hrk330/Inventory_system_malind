'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'

interface SupplierFormData {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
}

export default function AddSupplierPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: session, status } = useSession()

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
      router.push('/dashboard/suppliers')
    },
  })

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>({
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
    // Clean up empty optional fields - convert empty strings to undefined
    const cleanedData = {
      ...data,
      contactPerson: data.contactPerson?.trim() || undefined,
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
    }
    
    createMutation.mutate(cleanedData)
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
            <h1 className="text-2xl font-bold text-gray-900">Add New Supplier</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new supplier in your system
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Supplier name is required' })}
                  placeholder="Enter supplier name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  {...register('contactPerson')}
                  placeholder="Enter contact person name"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  {...register('address')}
                  placeholder="Enter address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
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

              {/* Success Message */}
              {createMutation.isSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Supplier created successfully! Redirecting...
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Messages */}
              {createMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {createMutation.error.message}
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
                  {createMutation.isPending ? 'Creating...' : 'Create Supplier'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
