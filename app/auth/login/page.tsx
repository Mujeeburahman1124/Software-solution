'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiClient } from '@/lib/api-client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password')
        setLoading(false)
        return
      }

      const response = await apiClient.login(email, password)

      if (response.token) {
        // Redirect to admin dashboard
        router.push('/admin')
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-secondary text-sm sm:text-base">Sign in to your She Blog account</p>
          </div>

          <form onSubmit={handleSubmit} className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-3">
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mb-4 disabled:opacity-50 transition"
            >
              {loading ? '🔄 Signing in...' : '🔓 Sign In'}
            </button>

            <p className="text-center text-sm text-secondary space-y-2">
              <span>Don&apos;t have an account? </span>
              <Link href="/auth/signup" className="text-accent font-semibold hover:text-blue-600 transition">
                Create one now
              </Link>
            </p>
            <p className="text-center text-xs text-secondary mt-4">
              Admin access is role-based and requires an existing admin account. Signup creates a standard creator account.
            </p>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            <p className="font-semibold mb-2">📝 Demo Credentials:</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo12345</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
