'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api-client'
import { FileText, User, Plus, Edit, Trash2, RefreshCw, Clock, Package, MapPin, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AuditPage() {
  const queryClient = useQueryClient()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const { data: auditLogs, isLoading, error: auditError, isFetching } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.get('/audit-logs?limit=50').then(res => res.data),
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  })

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['audit-summary'],
    queryFn: () => apiClient.get('/audit-logs/summary').then(res => res.data),
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  })

  // Fetch products and locations for better display
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then(res => res.data),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations').then(res => res.data),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    queryClient.invalidateQueries({ queryKey: ['audit-summary'] })
    setLastUpdated(new Date())
  }

  // Update last updated time when data changes
  useEffect(() => {
    if (auditLogs && !isLoading) {
      setLastUpdated(new Date())
    }
  }, [auditLogs, isLoading])

  // Helper functions to get meaningful names
  const getProductName = (productId: string) => {
    const product = products?.find((p: any) => p.id === productId)
    return product ? `${product.name} (${product.sku})` : `Product ${productId.slice(0, 8)}...`
  }

  const getLocationName = (locationId: string) => {
    const location = locations?.find((l: any) => l.id === locationId)
    return location ? location.name : `Location ${locationId.slice(0, 8)}...`
  }

  const formatTransactionDetails = (log: any) => {
    if (log.entityName === 'StockTransaction' && log.newValue) {
      const { type, quantity, remarks, productId, fromLocationId, toLocationId, referenceNo } = log.newValue
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{getProductName(productId)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Quantity:</span>
            <span className="px-2 py-1 bg-gray-100 rounded">{quantity}</span>
            <span className="font-medium">Type:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              type === 'RECEIPT' ? 'bg-green-100 text-green-800' :
              type === 'ISSUE' ? 'bg-red-100 text-red-800' :
              type === 'TRANSFER' ? 'bg-blue-100 text-blue-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {type}
            </span>
          </div>

          {referenceNo && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Reference:</span> {referenceNo}
            </div>
          )}

          {remarks && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Remarks:</span> {remarks}
            </div>
          )}

          {(fromLocationId || toLocationId) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {fromLocationId && toLocationId ? (
                <span>
                  {getLocationName(fromLocationId)} <ArrowRight className="h-3 w-3 inline mx-1" /> {getLocationName(toLocationId)}
                </span>
              ) : fromLocationId ? (
                <span>From: {getLocationName(fromLocationId)}</span>
              ) : toLocationId ? (
                <span>To: {getLocationName(toLocationId)}</span>
              ) : null}
            </div>
          )}
        </div>
      )
    }
    
    if (log.entityName === 'Product' && log.newValue) {
      const { name, sku, costPrice, sellingPrice, reorderLevel } = log.newValue
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{name} ({sku})</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {costPrice && (
              <div>
                <span className="font-medium">Cost Price:</span> ${costPrice}
              </div>
            )}
            {sellingPrice && (
              <div>
                <span className="font-medium">Selling Price:</span> ${sellingPrice}
              </div>
            )}
            {reorderLevel && (
              <div>
                <span className="font-medium">Reorder Level:</span> {reorderLevel}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return null
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-600 bg-green-100'
      case 'UPDATE':
        return 'text-blue-600 bg-blue-100'
      case 'DELETE':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (auditError || summaryError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Audit Logs</h3>
          <p className="text-gray-500 mb-4">
            {auditError?.message || summaryError?.message || 'Unable to load audit data'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Complete audit trail of all system activities
              {isFetching && <span className="ml-2 text-blue-500">• Auto-refreshing...</span>}
              {lastUpdated && !isFetching && (
                <span className="ml-2 text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Logs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.totalLogs || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Creates</p>
                <p className="text-2xl font-semibold text-green-600">
                  {summary?.actionCounts?.CREATE || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Updates</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {summary?.actionCounts?.UPDATE || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trash2 className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Deletes</p>
                <p className="text-2xl font-semibold text-red-600">
                  {summary?.actionCounts?.DELETE || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system activities and changes
              </CardDescription>
            </div>
            <Button 
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs?.logs?.map((log: any) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.user.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-sm text-gray-500">
                          {log.entityName}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Entity ID: {log.entityId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  {formatTransactionDetails(log) || (
                    (log.oldValue || log.newValue) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.oldValue && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Before:</div>
                            <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                              {JSON.stringify(log.oldValue, null, 2)}
                            </div>
                          </div>
                        )}
                        {log.newValue && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">After:</div>
                            <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                              {JSON.stringify(log.newValue, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {auditLogs?.logs?.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found</p>
              <p className="text-sm text-gray-400 mt-1">System activities will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
