'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiClient } from '@/lib/api-client'
import type { User } from '@/models'

interface BlogDetail {
  id: string
  title: string
  content: string
  coverImage: string
  category: string
  author: string
  authorImage?: string
  createdAt: string
  updatedAt: string
  views: number
  likes: number
  loves: number
  claps: number
  fires: number
}

interface CommentItem {
  id: string
  blogId: string
  authorName: string
  content: string
  createdAt: string
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<BlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Comments State
  const [comments, setComments] = useState<CommentItem[]>([])
  const [newComment, setNewComment] = useState('')
  const [guestName, setGuestName] = useState('')
  const [commentSaving, setCommentSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Reactions State
  const [reactions, setReactions] = useState({
    likes: 0,
    loves: 0,
    claps: 0,
    fires: 0
  })

  // Bookmark State
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  // Reading Progress State
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    // Scroll progress handler
    const updateScroll = () => {
      const currentScrollY = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight
      if (scrollHeight) {
        setReadingProgress(Number((currentScrollY / scrollHeight).toFixed(4)) * 100)
      }
    }
    window.addEventListener('scroll', updateScroll)
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  useEffect(() => {
    const loadPage = async () => {
      if (apiClient.isAuthenticated()) {
        setCurrentUser(apiClient.getUser() as User)
        try {
          const bookmarkResponse = await apiClient.getBookmarkStatus(params.id)
          setIsBookmarked(bookmarkResponse.isBookmarked ?? false)
        } catch {
          // bookmark status is optional and not critical for page render
        }
      }

      try {
        setLoading(true)
        setError('')
        const response = await apiClient.getBlog(params.id)
        if (response.blog) {
          const blogData = response.blog as BlogDetail
          setBlog(blogData)
          setReactions({
            likes: blogData.likes || 0,
            loves: blogData.loves || 0,
            claps: blogData.claps || 0,
            fires: blogData.fires || 0
          })
        } else {
          setError('Blog post not found')
        }
      } catch {
        setError('Failed to load blog article')
      } finally {
        setLoading(false)
      }

      try {
        const response = await apiClient.getComments(params.id)
        if (response.comments) {
          setComments(response.comments as CommentItem[])
        }
      } catch {
        // ignore comments fetch failures for now
      }
    }

    loadPage()
  }, [params.id])

  const handleReact = async (type: 'likes' | 'loves' | 'claps' | 'fires') => {
    try {
      // Optimistic update
      setReactions(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }))
      await apiClient.reactToBlog(params.id, type)
    } catch {
      // Ignore reaction updates if the request fails
    }
  }

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      alert('Please log in to save articles')
      return
    }
    try {
      setBookmarkLoading(true)
      const res = await apiClient.toggleBookmark(params.id, isBookmarked)
      setIsBookmarked(res.isBookmarked ?? false)
    } catch {
      alert('Unable to update bookmark status. Please try again.')
    } finally {
      setBookmarkLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setCommentSaving(true)
      const res = await apiClient.addComment(params.id, newComment, guestName)
      if (res.comment) {
        setComments(prev => [res.comment as CommentItem, ...prev])
        setNewComment('')
        setGuestName('')
      }
    } catch {
      alert('Failed to add comment. Please try again.')
    } finally {
      setCommentSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="container-app py-24 text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
          </div>
          <p className="text-secondary mt-4">Loading article details...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !blog) {
    return (
      <>
        <Header />
        <div className="container-app py-24 text-center max-w-md mx-auto">
          <span className="text-5xl block mb-4">📭</span>
          <h2 className="text-2xl font-bold text-primary mb-3">Article Not Found</h2>
          <p className="text-secondary mb-8 text-sm">
            {error || 'The blog article you are looking for does not exist or has been removed.'}
          </p>
          <a href="/" className="btn-primary w-full block">
            Return to Home
          </a>
        </div>
        <Footer />
      </>
    )
  }

  // Calculate reading time based on 200 words per minute (strip HTML tags for accuracy)
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ')
  const plainText = blog?.content ? stripHtml(blog.content) : ''
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 via-accent to-purple-600 z-[60] transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
      />
      <Header />
      <main className="flex-1 bg-light pb-12">
        <article className="container-app py-8 sm:py-12 md:py-16">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <span className="badge text-xs sm:text-sm bg-accent text-white px-3 py-1 font-bold">{blog.category}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-primary leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 border-b pb-4 sm:pb-6 border-gray-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-white">
                  {blog.author?.charAt(0) || '👤'}
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-primary">{blog.author || 'Anonymous'}</p>
                  <p className="text-xs sm:text-sm text-secondary flex items-center gap-2">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    <span className="text-gray-300">•</span>
                    <span>{readingTime} min read</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-secondary">
                <span>👁️ {blog.views?.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="w-full h-64 sm:h-80 md:h-[450px] rounded-lg overflow-hidden bg-gray-200 relative shadow-md">
            {blog.coverImage ? (
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                <span className="text-5xl sm:text-6xl md:text-7xl">📰</span>
              </div>
            )}
          </div>
        </div>

        {/* Rich Text Content */}
        <div className="max-w-4xl mx-auto px-0 mb-12 sm:mb-16">
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed blog-rich-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Reactions & Bookmark Section */}
        <div className="max-w-4xl mx-auto mb-12 py-6 border-y border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full sm:w-auto text-center sm:text-left">
              <h3 className="text-lg font-bold text-primary mb-4">Did you like this article?</h3>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
                <button
                  onClick={() => handleReact('likes')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-light transition font-semibold"
                >
                  <span>👍</span>
                  <span className="text-sm text-primary hidden sm:inline">Like</span>
                  <span className="badge bg-gray-100 text-primary text-xs font-bold">{reactions.likes}</span>
                </button>
                <button
                  onClick={() => handleReact('loves')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-light transition font-semibold"
                >
                  <span>❤️</span>
                  <span className="text-sm text-primary hidden sm:inline">Love</span>
                  <span className="badge bg-gray-100 text-primary text-xs font-bold">{reactions.loves}</span>
                </button>
                <button
                  onClick={() => handleReact('claps')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-light transition font-semibold"
                >
                  <span>👏</span>
                  <span className="text-sm text-primary hidden sm:inline">Clap</span>
                  <span className="badge bg-gray-100 text-primary text-xs font-bold">{reactions.claps}</span>
                </button>
                <button
                  onClick={() => handleReact('fires')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-light transition font-semibold"
                >
                  <span>🔥</span>
                  <span className="text-sm text-primary hidden sm:inline">Fire</span>
                  <span className="badge bg-gray-100 text-primary text-xs font-bold">{reactions.fires}</span>
                </button>
              </div>
            </div>
            
            {currentUser && (
              <div className="flex items-center w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0 border-t sm:border-t-0 pt-6 sm:pt-0 border-gray-100">
                <button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full border transition font-bold shadow-sm ${
                    isBookmarked
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-lg ${isBookmarked ? 'text-blue-600' : 'text-gray-500'}`}>
                    {isBookmarked ? '🔖' : '📑'}
                  </span>
                  <span>{isBookmarked ? 'Saved to Bookmarks' : 'Save Article'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">Discussion ({comments.length})</h2>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="card p-4 sm:p-6 mb-8">
            <h4 className="text-sm font-semibold text-primary mb-4">Leave a Comment</h4>
            
            {!currentUser && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-primary mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your Name (defaults to Guest Reader)"
                  className="input-field max-w-sm w-full py-1.5 text-sm"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-primary mb-1">
                Comment
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this article..."
                className="textarea-field h-24 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={commentSaving}
              className="btn-primary text-sm px-5 py-2 font-semibold disabled:opacity-50"
            >
              {commentSaving ? '🔄 Posting...' : '🗣️ Post Comment'}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-secondary text-sm italic py-4 text-center">No comments yet. Start the conversation!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="card p-4 bg-light border border-gray-100">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-xs">
                        {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-primary">{comment.authorName}</span>
                      </div>
                    </div>
                    <span className="text-xs text-secondary">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-10">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
      </main>
      <Footer />
    </div>
  )
}
