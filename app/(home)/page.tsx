'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'

interface Blog {
  id: string
  title: string
  excerpt?: string
  coverImage: string
  category: string
  author: string
  createdAt: string
  views: number
}

export default function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await apiClient.getBlogs(searchQuery, selectedCategory)
        const blogsList = response.blogs || response.data || []
        setBlogs(Array.isArray(blogsList) ? blogsList : [])
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load blogs'
        setError(message)
        // Show sample data on error
        setBlogs([
          {
            id: '1',
            title: 'Getting Started with Next.js 14',
            excerpt: 'Learn the basics of Next.js 14 and how to build modern web applications.',
            coverImage: '/blog-1.svg',
            category: 'Technology',
            author: 'John Doe',
            createdAt: new Date().toISOString(),
            views: 1250,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [searchQuery, selectedCategory])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      {/* Hero Section with Background */}
      <section className="relative w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-20 sm:py-24 md:py-28 lg:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        {/* Hero Content */}
        <div className="container-app text-center py-8 sm:py-12 md:py-16 relative z-10">
          <div className="mb-6 inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              ✨ Professional Blog Platform
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Welcome to She Blog
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
            Professional insights on technology, development, and business from industry experts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#blogs" className="btn-primary px-8 py-3 sm:py-4">
              Explore Blogs
            </Link>
            <Link href="/auth/signup" className="px-8 py-3 sm:py-4 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition font-medium text-center">
              Start Writing
            </Link>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="container-app py-12 sm:py-16 md:py-20" id="blogs">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Featured Articles</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Discover insightful articles covering the latest trends in tech, development, and business</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-12 sticky top-20 bg-white/80 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg z-40">
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10 w-full bg-white border-2 border-gray-200 focus:border-blue-500 rounded-lg py-2 sm:py-2.5 text-sm sm:text-base"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-field w-full bg-white border-2 border-gray-200 focus:border-blue-500 rounded-lg py-2 sm:py-2.5 text-sm sm:text-base"
          >
            <option value="all">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Development">Development</option>
            <option value="Business">Business</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Blogs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                  <div className="h-6 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="text-5xl sm:text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg sm:text-xl mt-4 mb-8">No blogs found. Try adjusting your filters or create the first one!</p>
            <Link href="/auth/signup" className="btn-primary inline-block px-8 py-3">
              ✍️ Create Your First Blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredBlogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.id}`} className="group">
                <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-56 sm:h-64 bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 w-full">
                    {blog.coverImage ? (
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        loading="lazy"
                        onError={({ currentTarget }) => { currentTarget.src = '/blog-fallback.svg' }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-5xl sm:text-6xl mb-2">📰</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                        {blog.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-blue-600 transition line-clamp-2 flex-1">
                      {blog.title}
                    </h3>

                    {/* Excerpt */}
                    {blog.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-sm">
                        <span className="font-medium text-gray-800">👤 {blog.author}</span>
                        <span className="text-gray-500 flex items-center gap-1">
                          👁️ {blog.views.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
