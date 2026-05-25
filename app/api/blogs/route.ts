import { query } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Mock blogs data for development
const MOCK_BLOGS = [
  {
    id: 1,
    title: 'Getting Started with Next.js 14',
    excerpt: 'Learn the fundamentals of Next.js 14 and build modern web applications with React.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=1200&h=630&fit=crop',
    category: 'Development',
    author: 'Sarah Chen',
    createdAt: new Date('2026-05-20'),
    views: 234,
    published: true,
  },
  {
    id: 2,
    title: 'TypeScript Best Practices',
    excerpt: 'Master TypeScript with these essential best practices for production-grade applications.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
    category: 'Development',
    author: 'John Smith',
    createdAt: new Date('2026-05-19'),
    views: 456,
    published: true,
  },
  {
    id: 3,
    title: 'The Future of Web Design',
    excerpt: 'Explore emerging trends in web design that will shape the future of digital experiences.',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop',
    category: 'Design',
    author: 'Emily Rodriguez',
    createdAt: new Date('2026-05-18'),
    views: 678,
    published: true,
  },
  {
    id: 4,
    title: 'React Hooks Deep Dive',
    excerpt: 'Understanding React Hooks: useState, useEffect, useContext, and custom hooks.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
    category: 'Development',
    author: 'Mike Johnson',
    createdAt: new Date('2026-05-17'),
    views: 523,
    published: true,
  },
  {
    id: 5,
    title: 'Cloud Architecture Patterns',
    excerpt: 'Design scalable and resilient cloud systems using proven architectural patterns.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop',
    category: 'Technology',
    author: 'Alex Kumar',
    createdAt: new Date('2026-05-16'),
    views: 789,
    published: true,
  },
  {
    id: 6,
    title: 'Digital Transformation Strategy',
    excerpt: 'Guide your organization through digital transformation with strategic planning.',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop',
    category: 'Business',
    author: 'Lisa Wang',
    createdAt: new Date('2026-05-15'),
    views: 892,
    published: true,
  },
]

// GET all blogs or search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const category = searchParams.get('category')?.trim()
    const mine = searchParams.get('mine') === 'true'
    const all = searchParams.get('all') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit

    // Auth checking if requesting personal or admin blogs
    const authHeader = request.headers.get('authorization')
    const token = authHeader ? extractTokenFromHeader(authHeader) : null
    const decoded = token ? verifyToken(token) : null

    let queryStr = 'SELECT id, title, excerpt, "coverImage", category, author, "authorId", published, "createdAt", views, likes, loves, claps, fires FROM blogs WHERE 1=1'
    const params: any[] = []

    if (mine) {
      if (!decoded) {
        return NextResponse.json(
          {
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Authentication token is missing or invalid',
          },
          { status: 401 }
        )
      }
      queryStr += ' AND "authorId" = $' + (params.length + 1)
      params.push(decoded.id)
    } else if (all) {
      if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN')) {
        return NextResponse.json(
          {
            success: false,
            error: 'FORBIDDEN',
            message: 'Access denied: Admin permissions required',
          },
          { status: 403 }
        )
      }
      // Admins can see all blogs (published and drafts)
    } else {
      // Public view: only published blogs
      queryStr += ' AND published = true'
    }

    if (search) {
      queryStr += ' AND (title ILIKE $' + (params.length + 1) + ' OR excerpt ILIKE $' + (params.length + 1) + ')'
      params.push(`%${search}%`)
    }

    if (category && category !== 'all') {
      queryStr += ' AND category = $' + (params.length + 1)
      params.push(category)
    }

    // Count total
    const countQuery = queryStr.replace(
      'SELECT id, title, excerpt, "coverImage", category, author, "authorId", published, "createdAt", views, likes, loves, claps, fires FROM blogs',
      'SELECT COUNT(*) as total FROM blogs'
    )
    const countResult = await query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || '0')

    queryStr += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(queryStr, params)
    
    return NextResponse.json(
      {
        success: true,
        blogs: result.rows,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Get blogs error:', error)
    
    // Development fallback
    let filteredBlogs = [...MOCK_BLOGS]
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredBlogs = filteredBlogs.filter(
        blog => blog.title.toLowerCase().includes(searchLower) || blog.excerpt.toLowerCase().includes(searchLower)
      )
    }
    
    if (category && category !== 'all') {
      filteredBlogs = filteredBlogs.filter(blog => blog.category === category)
    }
    
    return NextResponse.json(
      {
        success: true,
        blogs: filteredBlogs,
        total: filteredBlogs.length,
        message: 'Using demo data - database not available'
      },
      { status: 200 }
    )
  }
}

// POST - Create new blog
export async function POST(request: Request) {
  try {
    // Validate authentication token
    const authHeader = request.headers.get('authorization')
    const token = authHeader ? extractTokenFromHeader(authHeader) : null
    const decoded = token ? verifyToken(token) : null

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'No authentication token provided or token expired'
        },
        { status: 401 }
      )
    }

    const { title, content, coverImage, category, excerpt, tags, published } = await request.json()

    // Validate required fields
    if (!title?.trim() || !content?.trim() || !coverImage?.trim() || !category?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Title, content, cover image, and category are required'
        },
        { status: 400 }
      )
    }

    // Validate field lengths
    if (title.length < 5 || title.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_TITLE',
          message: 'Title must be between 5 and 500 characters'
        },
        { status: 400 }
      )
    }

    if (content.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CONTENT',
          message: 'Content must be at least 100 characters'
        },
        { status: 400 }
      )
    }

    const validCategories = ['Technology', 'Development', 'Business', 'Design', 'Marketing']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CATEGORY',
          message: `Category must be one of: ${validCategories.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(coverImage)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_URL',
          message: 'Cover image must be a valid URL'
        },
        { status: 400 }
      )
    }

    // Fetch user name from database
    const userResult = await query('SELECT name FROM users WHERE id = $1', [decoded.id])
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Authenticated user not found in database'
        },
        { status: 404 }
      )
    }
    const authorName = userResult.rows[0].name

    const result = await query(
      `INSERT INTO blogs (title, content, excerpt, "coverImage", category, author, "authorId", published, tags, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, title, content, excerpt, "coverImage", category, author, tags, "createdAt", "updatedAt", published`,
      [
        title.trim(),
        content.trim(),
        excerpt || content.substring(0, 300),
        coverImage.trim(),
        category,
        authorName,
        decoded.id,
        published !== undefined ? published : true, // Publish immediately by default
        tags || [], // Insert tags array
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'DATABASE_ERROR',
          message: 'Failed to create blog'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Blog created successfully',
        blog: result.rows[0]
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Create blog error:', error)
    
    // Development fallback
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        {
          success: true,
          message: 'Blog created successfully (demo mode)',
          id: Math.floor(Math.random() * 10000),
          blog: {
            title: 'Demo Title',
            content: 'Demo Content',
            coverImage: 'https://via.placeholder.com/800x400',
            category: 'Technology',
          }
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to create blog. Please try again later.'
      },
      { status: 500 }
    )
  }
}
