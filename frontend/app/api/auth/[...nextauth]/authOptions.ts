import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log('Attempting login with:', credentials.email)
          
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
          })

          console.log('Login response status:', response.status)
          console.log('Login response data:', response.data)

          if (response.data && response.data.user) {
            return {
              id: response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email,
              role: response.data.user.role,
              accessToken: response.data.access_token,
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
          
          // Type guard to check if error is an AxiosError
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any
            console.error('Error response status:', axiosError.response?.status)
            console.error('Error response data:', axiosError.response?.data)
          } else if (error && typeof error === 'object' && 'request' in error) {
            const axiosError = error as any
            console.error('No response received:', axiosError.request)
          } else if (error && typeof error === 'object' && 'message' in error) {
            const errorWithMessage = error as any
            console.error('Error setting up request:', errorWithMessage.message)
          } else {
            console.error('Unknown error occurred:', error)
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.accessToken = token.accessToken
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: true, // Enable debug mode
}
