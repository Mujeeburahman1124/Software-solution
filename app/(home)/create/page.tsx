'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiClient } from '@/lib/api-client'
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

export default function CreateBlogPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    coverImage: '',
    tags: '',
  })
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }))
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

  const getTextContent = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!formData.title.trim()) {
      setError('Blog title is required')
      setLoading(false)
      return
    }
    const textContent = getTextContent(formData.content)
    if (!textContent.trim() || textContent.length < 50) {
      setError('Blog content must be at least 50 characters')
      setLoading(false)
      return
    }
    if (!formData.coverImage) {
      setError('Cover image is required. Please upload an image.')
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.createBlog({
        title: formData.title,
        content: formData.content,
        coverImage: formData.coverImage,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        excerpt: textContent.substring(0, 150) + '...',
      })

      setSuccess(true)
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
    } finally {
      setLoading(false)
    }
  }

  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('token')

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="container-app py-12 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Login Required</h2>
          <p className="text-secondary mb-6">Please login to create a blog post.</p>
          <a href="/auth/login" className="btn-primary">Go to Login</a>
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

          <form onSubmit={handleSubmit} className="card space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                ❌ {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                ✅ Blog created successfully! Redirecting...
              </div>
            )}

            {/* Title + Category Row */}
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
                    <p className="text-sm text-accent font-semibold">✓ Image uploaded — click to change</p>
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
                  placeholder="Write your blog content here... Use the toolbar above for Bold, Italic, Headings, Images, and Videos."
                  style={{ minHeight: '320px' }}
                />
              </div>
              <p className="text-xs text-secondary mt-1">
                Use the toolbar to add Bold, Italic, Headings, Images, or embed Video links
              </p>
            </div>

            {/* Tags */}
            <div>
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

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
