'use client'

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api-client'
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Eye, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ImportProduct {
  name: string
  sku: string
  category?: string
  uomId: string
  reorderLevel: number
  description?: string
  barcode?: string
  supplierId?: string
  supplierName?: string
  costPrice?: number
  sellingPrice?: number
  minStock: number
  maxStock?: number
  isActive: boolean
}

interface ImportResult {
  success: boolean
  message: string
  data?: {
    imported: number
    failed: number
    errors: Array<{
      row: number
      field: string
      message: string
    }>
  }
}

export default function BulkImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ImportProduct[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Download sample template
  const downloadTemplate = async () => {
    try {
      const response = await apiClient.get('/products/bulk-import/template', {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'product-import-template.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading template:', error)
    }
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      setSelectedFile(file)
      setImportResult(null)
    } else {
      alert('Please select a valid CSV or Excel file')
    }
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  // Preview file data
  const previewFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post('/products/bulk-import/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      setPreviewData(data)
      setIsPreviewOpen(true)
    },
    onError: (error) => {
      console.error('Preview error:', error)
      alert('Error previewing file. Please check the format and try again.')
    }
  })

  // Import products
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post('/products/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setImportProgress(progress)
          }
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      setImportResult(data)
      setIsImporting(false)
      setImportProgress(0)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['bulk-import-history'] })
    },
    onError: (error) => {
      console.error('Import error:', error)
      setImportResult({
        success: false,
        message: 'Import failed. Please check your file and try again.',
        data: {
          imported: 0,
          failed: 0,
          errors: []
        }
      })
      setIsImporting(false)
      setImportProgress(0)
    }
  })

  const handlePreview = () => {
    if (selectedFile) {
      previewFile.mutate(selectedFile)
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      setIsImporting(true)
      setImportProgress(0)
      importMutation.mutate(selectedFile)
    }
  }

  const resetImport = () => {
    setSelectedFile(null)
    setPreviewData([])
    setImportResult(null)
    setImportProgress(0)
    setIsImporting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/products')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold text-white">Bulk Import Products</h1>
          <p className="mt-1 text-lg text-gray-300">
            Import multiple products at once using CSV or Excel files
          </p>
        </div>
      </div>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Template
          </CardTitle>
          <CardDescription>
            Download our sample template to see the required format for bulk import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={downloadTemplate} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Sample Template
            </Button>
            <div className="text-sm text-gray-300">
              <p>• Excel format with multiple reference sheets</p>
              <p>• Follow the template structure for best results</p>
              <p>• Required fields: Product Name, UOM (see UOM Reference sheet)</p>
              <p>• SKU will be auto-generated automatically</p>
              <p>• Check UOM Reference and Category Reference sheets for valid options</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </CardTitle>
          <CardDescription>
            Select your CSV or Excel file to import products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <div className="text-sm text-gray-300">
                  File size: {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handlePreview} disabled={previewFile.isPending}>
                    <Eye className="h-4 w-4 mr-2" />
                    {previewFile.isPending ? 'Previewing...' : 'Preview Data'}
                  </Button>
                  <Button variant="outline" onClick={resetImport}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-white">
                    {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                  </p>
                  <p className="text-sm text-gray-300">or</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="mt-2"
                  >
                    Browse Files
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Supports CSV and Excel files (.csv, .xlsx, .xls)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-gray-300">
                Processing your file... {importProgress}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              importResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {importResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              Import {importResult.success ? 'Successful' : 'Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                {importResult.message}
              </AlertDescription>
            </Alert>
            
            {importResult.data && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.data.imported}
                    </div>
                    <div className="text-sm text-green-800">Products Imported</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {importResult.data.failed}
                    </div>
                    <div className="text-sm text-red-800">Failed</div>
                  </div>
                </div>
                
                {importResult.data.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Errors:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {importResult.data.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded mb-1">
                          Row {error.row}: {error.field} - {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 flex gap-2">
              <Button onClick={() => router.push('/dashboard/products')}>
                View Products
              </Button>
              <Button variant="outline" onClick={resetImport}>
                Import Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Import Data</DialogTitle>
            <DialogDescription>
              Review the data that will be imported. You can proceed with the import or make changes to your file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-300">
              Found {previewData.length} products to import
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 10).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-blue-600 font-mono text-sm">
                        Auto-generated
                      </TableCell>
                      <TableCell>{product.category || 'N/A'}</TableCell>
                      <TableCell>{product.uomId}</TableCell>
                      <TableCell>{product.costPrice ? `$${product.costPrice}` : 'N/A'}</TableCell>
                      <TableCell>{product.sellingPrice ? `$${product.sellingPrice}` : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {previewData.length > 10 && (
                <div className="text-center text-sm text-gray-400 mt-2">
                  ... and {previewData.length - 10} more products
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import Products'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
