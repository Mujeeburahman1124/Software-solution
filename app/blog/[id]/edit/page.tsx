'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    coverImage: '',
    published: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userData = apiClient.getUser()
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const fetchBlogDetails = async (currentUser: any) => {
      try {
        setLoading(true)
        const response = await apiClient.getBlog(params.id)
        if (response.blog) {
          const blog = response.blog as any
          // Check ownership or admin status
          const isOwner = blog.authorId === currentUser.id
          const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'

          if (!isOwner && !isAdmin) {
            setError('ACCESS_DENIED')
            return
          }

          setFormData({
            title: blog.title || '',
            content: blog.content || '',
            category: blog.category || 'Technology',
            coverImage: blog.coverImage || '',
            published: blog.published ?? false,
          })
        } else {
          setError('Blog post not found')
        }
      } catch (err) {
        console.error('Error fetching blog:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch blog details')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogDetails(userData)
  }, [params.id, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      // Validations
      if (!formData.title.trim()) {
        setError('Blog title is required')
        setSaving(false)
        return
      }
      if (!formData.content.trim()) {
        setError('Blog content is required')
        setSaving(false)
        return
      }
      if (formData.content.length < 100) {
        setError('Blog content must be at least 100 characters')
        setSaving(false)
        return
      }
      if (!formData.coverImage.trim()) {
        setError('Cover image URL is required')
        setSaving(false)
        return
      }

      await apiClient.updateBlog(params.id, {
        title: formData.title,
        content: formData.content,
        coverImage: formData.coverImage,
        category: formData.category,
        published: formData.published,
      })

      setSuccess(true)

      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update blog'
      setError(message)
      console.error('Error updating blog:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="container-app py-12 text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
          </div>
          <p className="text-secondary mt-4">Loading blog details...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <>
        <Header />
        <div className="container-app py-16 text-center max-w-md mx-auto">
          <span className="text-5xl block mb-4">⛔</span>
          <h2 className="text-2xl font-bold text-primary mb-3">Access Denied</h2>
          <p className="text-secondary mb-8 text-sm">
            You do not have permission to edit this blog post. You can only edit your own posts.
          </p>
          <Link href="/admin" className="btn-primary w-full">
            Back to Dashboard
          </Link>
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
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Edit Blog Post</h1>
            <p className="text-secondary">Update your blog details and content</p>
          </div>

          <form onSubmit={handleSubmit} className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                ❌ {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                ✅ Blog updated successfully! Redirecting to dashboard...
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

            <div className="mb-8 flex items-center gap-3 bg-light p-4 rounded-lg">
              <input
                type="checkbox"
                name="published"
                id="published"
                checked={formData.published}
                onChange={handleCheckboxChange}
                className="w-5 h-5 accent-accent"
              />
              <label htmlFor="published" className="text-sm font-semibold text-primary cursor-pointer select-none">
                Publish immediately (if unchecked, it will be saved as a Draft)
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 flex-1 sm:flex-initial font-semibold"
              >
                {saving ? '🔄 Saving Changes...' : '💾 Save Changes'}
              </button>

              <Link
                href="/admin"
                className="btn-secondary flex-1 sm:flex-initial text-center font-semibold"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
