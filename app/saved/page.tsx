'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

interface Blog {
  id: string
  title: string
  excerpt?: string
  coverImage: string
  category: string
  author: string
  createdAt: string
  views: number
  bookmarkedAt?: string
}

export default function SavedBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }
    fetchSavedBlogs()
  }, [router])

  const fetchSavedBlogs = async () => {
    try {
      setLoading(true)
      const res = await apiClient.getBookmarkedBlogs()
      if (res.blogs) {
        setBlogs(res.blogs as Blog[])
      } else {
        setBlogs([])
      }
    } catch (err) {
      console.error('Error fetching saved blogs:', err)
      setError('Failed to load your saved blogs.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (e: React.MouseEvent, blogId: string) => {
    e.preventDefault()
    try {
      await apiClient.toggleBookmark(blogId, true) // Pass true because it's currently bookmarked
      setBlogs(prev => prev.filter(b => b.id !== blogId))
    } catch (err) {
      console.error('Error removing bookmark', err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-light py-12">
        <div className="container-app">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 flex items-center gap-3">
              <span className="text-4xl">🔖</span> Saved Articles
            </h1>
            <p className="text-secondary text-lg">Your personal collection of favorite reads.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              ❌ {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-6">📑</div>
              <h2 className="text-2xl font-bold text-primary mb-4">No saved articles yet</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                When you find an article you want to read later or keep for reference, tap the Save button on the article page.
              </p>
              <Link href="/#blogs" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg">
                Explore Articles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.id}`} className="group">
                  <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 relative">
                    {/* Remove Bookmark Button Overlay */}
                    <button 
                      onClick={(e) => handleRemoveBookmark(e, blog.id)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur text-red-500 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      title="Remove from saved"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <div className="relative overflow-hidden h-56 bg-gray-100">
                      {blog.coverImage ? (
                        <img 
                          src={blog.coverImage} 
                          alt={blog.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-5xl">📰</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          {blog.category}
                        </span>
                        {blog.bookmarkedAt && (
                          <span className="text-xs text-gray-400">
                            Saved {new Date(blog.bookmarkedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition line-clamp-2 text-primary">
                        {blog.title}
                      </h3>

                      {blog.excerpt && (
                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                          {blog.excerpt}
                        </p>
                      )}

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm mt-auto">
                        <span className="font-medium text-gray-800 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent to-purple-500 flex items-center justify-center text-white text-[10px]">
                            {blog.author.charAt(0)}
                          </div>
                          {blog.author}
                        </span>
                        <span className="text-gray-400 font-medium">Read Article →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
