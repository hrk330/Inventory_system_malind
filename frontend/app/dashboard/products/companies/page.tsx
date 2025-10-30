'use client'

import { useState } from 'react'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function CompaniesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useCompanies({ search })
  const create = useCreateCompany()
  const update = useUpdateCompany()
  const remove = useDeleteCompany()
  const router = useRouter()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const canSubmit = name.trim().length > 1 && !create.isPending
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Companies</h1>
        <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
      </div>

      {/* Add Company Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault()
              if (!canSubmit) return
              create.mutate(
                { name: name.trim(), code: code.trim() || undefined },
                {
                  onSuccess: () => {
                    setName('')
                    setCode('')
                  }
                }
              )
            }}
          >
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Name *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Apple Inc." required />
            </div>
            <div>
              <label className="block text-sm mb-1">Code</label>
              <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. APL" />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <Button type="submit" disabled={!canSubmit}>{create.isPending ? 'Creating...' : 'Create Company'}</Button>
              {name && name.trim().length <= 1 && (
                <span className="text-sm text-red-400">Name must be at least 2 characters.</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading && (
              <div className="col-span-3 text-sm text-gray-400">Loading...</div>
            )}
            {data?.data?.map(c => (
              <div key={c.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-lg font-semibold text-white">
                    <span className="w-2 h-2 rounded-sm bg-green-400" />
                    {c.name}
                  </div>
                  <Badge variant="secondary" className={c.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-300 mb-4">
                  {c.productCount || 0} product{(c.productCount || 0) === 1 ? '' : 's'}{c.code ? ` • Code: ${c.code}` : ''}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="default"
                    onClick={() => router.push(`/dashboard/products?companyId=${c.id}`)}
                    className="flex-1"
                  >View Products</Button>
                  <Button 
                    variant="outline"
                    onClick={() => { setEditing(c); setEditOpen(true) }}
                  >Edit</Button>
                  <Button 
                    variant="outline"
                    onClick={() => remove.mutate(c.id)}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >Delete</Button>
                </div>
              </div>
            ))}
            {!isLoading && (data?.data?.length ?? 0) === 0 && (
              <div className="col-span-3 text-sm text-gray-400">No companies found</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name *</label>
              <Input value={editing?.name || ''} onChange={(e) => setEditing((p: any) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Code</label>
              <Input value={editing?.code || ''} onChange={(e) => setEditing((p: any) => ({ ...p, code: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!editing?.isActive} onChange={(e) => setEditing((p: any) => ({ ...p, isActive: e.target.checked }))} />
              <span className="text-sm">Active</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!editing?.id || !editing?.name?.trim()) return
                update.mutate({ id: editing.id, data: { name: editing.name.trim(), code: editing.code || undefined, isActive: !!editing.isActive } }, {
                  onSuccess: () => setEditOpen(false)
                })
              }}
            >Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


