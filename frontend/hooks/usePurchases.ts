import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: {
    id: string
    name: string
    contactPerson?: string
    email?: string
    phone?: string
  }
  orderDate: string
  expectedDate?: string
  status: 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID'
  totalAmount: number
  amountPaid: number
  remarks?: string
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
    retailPrice: number
    totalPrice: number
  }>
  creator: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseOrderDto {
  supplierId: string
  referenceNo?: string
  orderDate: string
  expectedDate?: string
  remarks?: string
  items: Array<{
    productId: string
    quantity: number
    costPrice: number
    retailPrice: number
    expiryDate?: string
    totalPrice: number
  }>
}

export interface UpdatePurchaseOrderDto {
  referenceNo?: string
  expectedDate?: string
  remarks?: string
  status?: 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED'
  amountPaid?: number
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID'
}

export interface CreatePurchaseReturnDto {
  purchaseOrderId: string
  supplierId: string
  reason: string
  remarks?: string
  items: Array<{
    productId: string
    quantity: number
    costPrice: number
    totalPrice: number
    reason?: string
  }>
}

export interface PurchaseQueryParams {
  search?: string
  supplierId?: string
  status?: 'PENDING' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED'
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID'
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// Get all purchase orders
export const usePurchases = (params: PurchaseQueryParams = {}) => {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
      
      const response = await apiClient.get(`/purchases?${searchParams.toString()}`)
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single purchase order
export const usePurchase = (id: string) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: async () => {
      const response = await apiClient.get(`/purchases/${id}`)
      return response.data
    },
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}

// Create purchase order
export const useCreatePurchase = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderDto) => {
      const response = await apiClient.post('/purchases', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
    },
  })
}

// Update purchase order
export const useUpdatePurchase = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePurchaseOrderDto }) => {
      const response = await apiClient.patch(`/purchases/${id}`, data)
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['purchase', id] })
    },
  })
}

// Mark purchase as received
export const useMarkPurchaseReceived = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: any }) => {
      const response = await apiClient.post(`/purchases/${id}/receive`, data || {})
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['purchase', id] })
    },
  })
}

// Delete purchase order
export const useDeletePurchase = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/purchases/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
    },
  })
}

// Create purchase return
export const useCreatePurchaseReturn = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreatePurchaseReturnDto) => {
      const response = await apiClient.post('/purchases/returns', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
    },
  })
}

// Get purchase returns
export const usePurchaseReturns = (params: PurchaseQueryParams = {}) => {
  return useQuery({
    queryKey: ['purchase-returns', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
      
      const response = await apiClient.get(`/purchases/returns?${searchParams.toString()}`)
      return response.data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}
