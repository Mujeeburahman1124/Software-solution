'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'

interface BlogItem {
  id: string
  title: string
  category: string
  views: number
  published: boolean
  createdAt: string
  author: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication and load user data
    const token = localStorage.getItem('token')
    const userData = apiClient.getUser()
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }
    setUser(userData)
    fetchBlogs(userData)
  }, [router])

  const fetchBlogs = async (currentUser = user) => {
    if (!currentUser) return
    try {
      setLoading(true)
      setError('')
      const isRegularUser = currentUser.role === 'USER'
      // mine = true for USER role; all = true for ADMIN/SUPER_ADMIN role
      const response = await apiClient.getBlogs(
        undefined,
        undefined,
        isRegularUser,
        !isRegularUser
      )
      const blogsList = response.blogs || response.data || []
      setBlogs(Array.isArray(blogsList) ? blogsList : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load blogs'
      setError(message)
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteBlog(id)
      setBlogs(blogs.filter(blog => blog.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete blog'
      alert(message)
      console.error('Error deleting blog:', error)
    }
  }

  const handleTogglePublish = async (blog: BlogItem) => {
    try {
      setTogglingId(blog.id)
      await apiClient.updateBlog(blog.id, {
        published: !blog.published
      })
      setBlogs(blogs.map(b => b.id === blog.id ? { ...b, published: !b.published } : b))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update publication status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleLogout = () => {
    apiClient.logout()
    router.push('/')
  }

  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0)
  const publishedCount = blogs.filter(b => b.published).length
  const draftCount = blogs.length - publishedCount

  if (!user) {
    return (
      <>
        <Header />
        <div className="container-app py-12 text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
          </div>
          <p className="text-secondary mt-4">Verifying session...</p>
        </div>
        <Footer />
      </>
    )
  }

  const isSystemAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

  return (
    <>
      <Header />
      <div className="container-app py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
              {isSystemAdmin ? 'Admin Dashboard' : 'Creator Dashboard'}
            </h1>
            <p className="text-secondary">
              {isSystemAdmin 
                ? 'System Moderator View - manage all blog content' 
                : `Manage your articles, drafts, and analytics as a Content Creator`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link href="/create" className="btn-primary flex-1 sm:flex-initial text-center font-semibold">
              + New Blog
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary flex-1 sm:flex-initial font-semibold"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="card">
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-2">{blogs.length}</div>
            <div className="text-secondary text-sm">Total Articles</div>
          </div>
          <div className="card">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{publishedCount}</div>
            <div className="text-secondary text-sm">Published</div>
          </div>
          <div className="card">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">{draftCount}</div>
            <div className="text-secondary text-sm">Drafts</div>
          </div>
          <div className="card">
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-2">{totalViews.toLocaleString()}</div>
            <div className="text-secondary text-sm">{isSystemAdmin ? 'Platform Views' : 'Total Views'}</div>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-primary">
            {isSystemAdmin ? 'All Platform Blogs' : 'Your Managed Blogs'}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
              </div>
              <p className="text-secondary mt-4">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary text-lg mb-4">📭 No blogs found.</p>
              <Link href="/create" className="btn-primary">
                Create your first blog post
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 text-sm md:text-base">
                    <th className="text-left py-3 font-semibold text-primary px-3 sm:px-0">Title</th>
                    {isSystemAdmin && (
                      <th className="text-left py-3 font-semibold text-primary">Author</th>
                    )}
                    <th className="hidden md:table-cell text-left py-3 font-semibold text-primary">Category</th>
                    <th className="hidden sm:table-cell text-left py-3 font-semibold text-primary">Views</th>
                    <th className="text-left py-3 font-semibold text-primary">Status</th>
                    <th className="text-left py-3 font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-gray-200 hover:bg-light transition text-sm md:text-base">
                      <td className="py-4 px-3 sm:px-0">
                        <div className="truncate max-w-xs md:max-w-md">
                          <p className="font-medium text-primary">{blog.title}</p>
                          <p className="md:hidden text-xs text-secondary">{blog.category}</p>
                        </div>
                      </td>
                      {isSystemAdmin && (
                        <td className="py-4 text-sm text-secondary font-medium">
                          👤 {blog.author || 'Anonymous'}
                        </td>
                      )}
                      <td className="hidden md:table-cell py-4">
                        <span className="badge text-xs bg-accent text-white">{blog.category}</span>
                      </td>
                      <td className="hidden sm:table-cell py-4 text-secondary">{blog.views}</td>
                      <td className="py-4">
                        <button
                          disabled={togglingId === blog.id}
                          onClick={() => handleTogglePublish(blog)}
                          className={`text-xs px-2.5 py-1 rounded-full font-bold transition hover:opacity-80 ${
                            blog.published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                          title="Click to toggle publication status"
                        >
                          {blog.published ? '✓ Published' : '◯ Draft'}
                        </button>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/blog/${blog.id}`}
                            className="text-xs text-accent hover:underline px-2 py-1 rounded hover:bg-blue-50"
                          >
                            👁️ View
                          </Link>
                          <Link
                            href={`/blog/${blog.id}/edit`}
                            className="text-xs text-yellow-600 hover:underline px-2 py-1 rounded hover:bg-yellow-50"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(blog.id)}
                            className="text-xs text-red-500 hover:underline px-2 py-1 rounded hover:bg-red-50"
                          >
                            🗑️ Delete
                          </button>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {deleteConfirm === blog.id && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
                              <h3 className="text-lg font-bold text-primary mb-2">Delete Blog?</h3>
                              <p className="text-secondary mb-6 text-sm">This action is permanent and cannot be undone.</p>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleDelete(blog.id)}
                                  className="btn-danger flex-1"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="btn-secondary flex-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
