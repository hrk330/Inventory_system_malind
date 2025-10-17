'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Package, BarChart3, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // Store tokens in localStorage
        const session = await getSession()
        if (session?.accessToken) {
          localStorage.setItem('accessToken', session.accessToken)
        }
        router.push('/dashboard')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Marketing Content */}
      <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/background.mp4" type="video/mp4" />
            {/* Fallback image if video doesn't load */}
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
          </video>
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center mb-12">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mr-8 p-1 shadow-2xl border-2 border-white">
                <Image
                  src="/images/logo.png"
                  alt="Malind Tech Logo"
                  width={110}
                  height={110}
                  className="object-contain drop-shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white drop-shadow-lg">Malind Tech</h1>
                <p className="text-blue-100 text-2xl font-semibold">Inventory Management</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold leading-tight">
                The Most Advanced
                <span className="block text-blue-200">Inventory System</span>
              </h2>
              
              <p className="text-lg text-blue-100 leading-relaxed">
                Manage your products, suppliers, stock levels, and reporting seamlessly. 
                Built for modern businesses that demand efficiency and control.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">Real-time stock tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">Advanced reporting & analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">Multi-location support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">Automated reorder alerts</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-blue-200 text-sm">
                Specially Designed for Every Business
              </p>
              <p className="text-blue-300 text-xs mt-2">
                Developed by Malind Tech Solutions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-[35%] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 relative overflow-hidden">
        {/* Tech Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full blur-xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center justify-center mb-12">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 p-2 shadow-2xl border-2 border-white/30">
              <Image
                src="/images/logo.png"
                alt="Malind Tech Logo"
                width={120}
                height={120}
                className="object-contain drop-shadow-lg"
              />
            </div>
            <div className="text-center">
              <h1 className="text-6xl font-bold text-white mb-2">Malind Tech</h1>
              <p className="text-gray-300 text-3xl font-semibold">Inventory Management</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white/15 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 rounded-3xl"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-400"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-300">Sign in to your account to continue</p>
              </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-400/50 bg-red-500/10 backdrop-blur-sm">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-100">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="h-12 px-4 bg-white/15 border-white/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-100">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="h-12 px-4 pr-12 bg-white/15 border-white/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-green-400/50 shadow-lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-sm font-semibold text-gray-100 mb-3 text-center">Demo Credentials</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <span className="font-medium text-gray-200">Admin:</span>
                  <span className="text-green-400 font-medium">admin@gmail.com / 123456789</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <span className="font-medium text-gray-200">Staff:</span>
                  <span className="text-green-400 font-medium">staff@inventory.com / staff123</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
