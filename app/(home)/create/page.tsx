'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiClient } from '@/lib/api-client'

export default function CreateBlogPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    coverImage: '',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
    setSuccess(false)

    try {
      // Validate form
      if (!formData.title.trim()) {
        setError('Blog title is required')
        setLoading(false)
        return
      }
      if (!formData.content.trim()) {
        setError('Blog content is required')
        setLoading(false)
        return
      }
      if (formData.content.length < 100) {
        setError('Blog content must be at least 100 characters')
        setLoading(false)
        return
      }
      if (!formData.coverImage.trim()) {
        setError('Cover image URL is required')
        setLoading(false)
        return
      }

      const response = await apiClient.createBlog({
        title: formData.title,
        content: formData.content,
        coverImage: formData.coverImage,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        excerpt: formData.content.substring(0, 150) + '...',
      })

      setSuccess(true)
      setFormData({
        title: '',
        content: '',
        category: 'Technology',
        coverImage: '',
        tags: '',
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        if (response.id) {
          router.push(`/blog/${response.id}`)
        } else {
          router.push('/')
        }
      }, 1500)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create blog'
      setError(message)
      console.error('Error creating blog:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check authentication
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('token')

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="container-app py-12 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Login Required</h2>
          <p className="text-secondary mb-6">Please login to create a blog post.</p>
          <a href="/auth/login" className="btn-primary">
            Go to Login
          </a>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container-app py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Create New Blog</h1>
            <p className="text-secondary">Share your knowledge with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                ❌ {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                ✅ Blog created successfully! Redirecting...
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Blog Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your blog title"
                  required
                />
                <p className="text-xs text-secondary mt-1">{formData.title.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="Technology">Technology</option>
                  <option value="Development">Development</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                Cover Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/image.jpg"
                required
              />
              <p className="text-xs text-secondary mt-1">Provide a direct image URL</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                Blog Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="textarea-field h-64 lg:h-80"
                placeholder="Write your blog content here... (Markdown supported)"
                required
              />
              <p className="text-xs text-secondary mt-1">
                {formData.content.length} characters (minimum 100)
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-primary mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input-field"
                placeholder="next.js, react, web-development"
              />
              <p className="text-xs text-secondary mt-1">Help readers find your content</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 flex-1 sm:flex-initial"
              >
                {loading ? '🔄 Publishing...' : '📝 Publish Blog'}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1 sm:flex-initial"
              >
                ← Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
