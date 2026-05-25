'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'
import 'react-quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
  ],
}

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'blockquote', 'code-block',
  'link', 'image', 'video',
]

const CATEGORIES = ['Technology', 'Development', 'Business', 'Design', 'Marketing']

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    coverImage: '',
    published: false,
  })
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
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
          // Set image preview from existing cover image
          if (blog.coverImage) {
            setImagePreview(blog.coverImage)
          }
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
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be smaller than 5MB')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFormData(prev => ({ ...prev, coverImage: base64 }))
      setImagePreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
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
      if (!formData.coverImage) {
        setError('Cover image is required')
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

          <form onSubmit={handleSubmit} className="card space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                ❌ {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                ✅ Blog updated successfully! Redirecting to dashboard...
              </div>
            )}

            {/* Title + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cover Image File Upload */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Cover Image <span className="text-red-500">*</span>
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <p className="text-sm text-accent font-semibold">✓ Image loaded — click to change</p>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-3">🖼️</div>
                    <p className="font-semibold text-primary">Click to upload cover image</p>
                    <p className="text-xs text-secondary mt-1">PNG, JPG, WEBP — max 5MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Blog Content <span className="text-red-500">*</span>
              </label>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Edit your blog content here..."
                  style={{ minHeight: '320px' }}
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-3 bg-light p-4 rounded-lg">
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

            {/* Buttons */}
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

      <style jsx global>{`
        .ql-container {
          font-size: 1rem;
          min-height: 280px;
          font-family: inherit;
        }
        .ql-editor {
          min-height: 280px;
          line-height: 1.8;
        }
        .ql-toolbar {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0 !important;
          border-radius: 0;
        }
        .ql-container.ql-snow {
          border: none !important;
        }
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
      `}</style>
    </>
  )
}
