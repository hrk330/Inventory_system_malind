'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'

function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  
  return (
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'lg:pl-64' : 'lg:pl-16'}`}>
      <Header />
      <main className="py-6 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/login')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-green-400 border-r-blue-400"></div>
          <div className="absolute inset-0 rounded-full h-32 w-32 border-4 border-transparent border-b-purple-400 border-l-red-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  )
}
