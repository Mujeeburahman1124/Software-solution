'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiClient } from '@/lib/api-client'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name.trim()) {
        setError('Full name is required')
        setLoading(false)
        return
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email')
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      const response = await apiClient.signup(
        formData.name,
        formData.email,
        formData.password
      )

      if (response) {
        // Redirect to login
        router.push('/auth/login?registered=true')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      console.error('Signup error:', err)
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
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-secondary text-sm sm:text-base">Join She Blog and start sharing</p>
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
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-secondary mt-1">Minimum 6 characters</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {loading ? '🔄 Creating Account...' : '✨ Sign Up'}
            </button>

            <p className="text-center text-sm text-secondary space-y-2">
              <span>Already have an account? </span>
              <Link href="/auth/login" className="text-accent font-semibold hover:text-blue-600 transition">
                Sign in
              </Link>
            </p>
          </form>

          {/* Terms info */}
          <p className="text-center text-xs text-secondary mt-6 px-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
