'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Calendar,
  User,
  Package,
  RefreshCw,
  FileDown
} from 'lucide-react'
import { generateSimplePDF } from '@/components/reports/SimplePDFReport'

interface BulkImportRecord {
  id: string
  fileName: string
  originalFileName: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  errors: string[]
  createdAt: string
  completedAt?: string
  userId: string
  user: {
    name: string
    email: string
  }
  summary?: {
    productsCreated: number
    productsUpdated: number
    categoriesCreated: number
    uomsCreated: number
  }
}

export default function BulkImportHistoryPage() {
  const [selectedRecord, setSelectedRecord] = useState<BulkImportRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Fetch bulk import history
  const { data: importHistory, isLoading, refetch } = useQuery({
    queryKey: ['bulk-import-history'],
    queryFn: async () => {
      const response = await apiClient.get('/csv/bulk-import-history')
      return response.data
    },
  })

  // Retry failed import
  const retryMutation = useMutation({
    mutationFn: async (importId: string) => {
      const response = await apiClient.post(`/csv/retry-import/${importId}`)
      return response.data
    },
    onSuccess: () => {
      refetch()
    },
  })

  // Download import report as PDF
  const downloadReport = (record: BulkImportRecord) => {
    console.log('Downloading report for record:', record.id)
    
    // Use simple PDF (reliable and professional)
    generateSimplePDF(record)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getSuccessRate = (record: BulkImportRecord) => {
    if (record.totalRecords === 0) return 0
    return Math.round((record.successfulRecords / record.totalRecords) * 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading import history...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Import History</h1>
          <p className="text-gray-300">View and manage all bulk import operations</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {!importHistory || importHistory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Import History</h3>
            <p className="text-gray-400 text-center">
              No bulk import operations have been performed yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Imports</span>
                </div>
                <p className="text-2xl font-bold">{importHistory.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Successful</span>
                </div>
                <p className="text-2xl font-bold">
                  {importHistory.filter((r: BulkImportRecord) => r.status === 'completed').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Failed</span>
                </div>
                <p className="text-2xl font-bold">
                  {importHistory.filter((r: BulkImportRecord) => r.status === 'failed').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Total Records</span>
                </div>
                <p className="text-2xl font-bold">
                  {importHistory.reduce((sum: number, r: BulkImportRecord) => sum + r.totalRecords, 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Import History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Import Operations</CardTitle>
              <CardDescription>
                Detailed history of all bulk import operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importHistory.map((record: BulkImportRecord) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-[200px]" title={record.originalFileName}>
                            {record.originalFileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Total: {record.totalRecords}</div>
                          <div className="text-green-600">✓ {record.successfulRecords}</div>
                          <div className="text-red-600">✗ {record.failedRecords}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={getSuccessRate(record)} 
                            className="w-16 h-2" 
                          />
                          <span className="text-sm font-medium">
                            {getSuccessRate(record)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">{record.user.name}</div>
                            <div className="text-xs text-gray-400">{record.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div className="text-sm">
                            <div>{new Date(record.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(record.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record)
                              setIsDetailsOpen(true)
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(record)}
                            title="Download PDF Report"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          {record.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => retryMutation.mutate(record.id)}
                              disabled={retryMutation.isPending}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details Dialog */}
      {isDetailsOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Import Details</span>
              </CardTitle>
              <CardDescription>
                Detailed information about this import operation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">File Name</label>
                  <p className="text-sm">{selectedRecord.originalFileName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedRecord.status)}
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Total Records</label>
                  <p className="text-sm">{selectedRecord.totalRecords}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Success Rate</label>
                  <p className="text-sm">{getSuccessRate(selectedRecord)}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Created At</label>
                  <p className="text-sm">{new Date(selectedRecord.createdAt).toLocaleString()}</p>
                </div>
                {selectedRecord.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Completed At</label>
                    <p className="text-sm">{new Date(selectedRecord.completedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedRecord.summary && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Summary</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm font-medium text-green-800">Products Created</p>
                      <p className="text-lg font-bold text-green-600">
                        {selectedRecord.summary.productsCreated || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-800">Products Updated</p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedRecord.summary.productsUpdated || 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm font-medium text-purple-800">Categories Created</p>
                      <p className="text-lg font-bold text-purple-600">
                        {selectedRecord.summary.categoriesCreated || 0}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <p className="text-sm font-medium text-orange-800">UOMs Created</p>
                      <p className="text-lg font-bold text-orange-600">
                        {selectedRecord.summary.uomsCreated || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRecord.errors && selectedRecord.errors.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Errors</label>
                  <div className="mt-2 space-y-2">
                    {selectedRecord.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => downloadReport(selectedRecord)}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PDF Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
