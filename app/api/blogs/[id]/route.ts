import { query } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Mock blogs data for development
const MOCK_BLOGS = [
  {
    id: 1,
    title: 'Getting Started with Next.js 14',
    content: 'Next.js 14 brings powerful new features for building modern web applications. Learn how to leverage the App Router, Server Components, and other cutting-edge capabilities to create high-performance applications.\n\n## Key Features\n\n- **App Router**: A new file-based router that makes organizing your application intuitive\n- **Server Components**: Write components that run on the server, reducing client-side JavaScript\n- **Incremental Static Regeneration**: Update static content without rebuilding your entire site\n- **Image Optimization**: Automatic image optimization with the Next.js Image component\n\nWith these features, you\'ll be able to build faster, more efficient applications.',
    excerpt: 'Learn the fundamentals of Next.js 14 and build modern web applications with React.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=1200&h=630&fit=crop',
    category: 'Development',
    author: 'Sarah Chen',
    authorId: 1,
    createdAt: new Date('2026-05-20'),
    updatedAt: new Date('2026-05-20'),
    views: 234,
    published: true,
  },
  {
    id: 2,
    title: 'TypeScript Best Practices',
    content: 'TypeScript is a powerful tool for building type-safe JavaScript applications. This comprehensive guide covers the best practices that professional developers use in production environments.\n\n## Strict Mode Configuration\n\nAlways enable strict mode in your tsconfig.json:\n\n```json\n{\n  "compilerOptions": {\n    "strict": true\n  }\n}\n```\n\n## Interface vs Type\n\nUse interfaces for object shapes, types for everything else. This keeps your code organized and maintainable.',
    excerpt: 'Master TypeScript with these essential best practices for production-grade applications.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
    category: 'Development',
    author: 'John Smith',
    authorId: 2,
    createdAt: new Date('2026-05-19'),
    updatedAt: new Date('2026-05-19'),
    views: 456,
    published: true,
  },
]

// GET single blog
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      `SELECT id, title, content, "coverImage", category, author, "authorId", "createdAt", "updatedAt", views, published
       FROM blogs WHERE id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      )
    }

    // Increment views
    await query(
      'UPDATE blogs SET views = views + 1 WHERE id = $1',
      [params.id]
    )

    return NextResponse.json(
      { blog: result.rows[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get blog error:', error)
    
    // Development fallback - return mock data
    const blogId = parseInt(params.id, 10)
    const mockBlog = MOCK_BLOGS.find(blog => blog.id === blogId)
    
    if (!mockBlog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { blog: mockBlog },
      { status: 200 }
    )
  }
}


// PUT - Update blog
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication token
    const authHeader = request.headers.get('authorization')
    const token = authHeader ? extractTokenFromHeader(authHeader) : null
    const decoded = token ? verifyToken(token) : null

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get existing blog
    const blogResult = await query(
      'SELECT id, title, content, "coverImage", category, "authorId", published FROM blogs WHERE id = $1',
      [params.id]
    )

    if (blogResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message: 'Blog not found' },
        { status: 404 }
      )
    }

    const blog = blogResult.rows[0]

    // Verify ownership or admin privileges
    const isOwner = blog.authorId === decoded.id
    const isAdmin = decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'You do not have permission to update this blog' },
        { status: 403 }
      )
    }

    const { title, content, coverImage, category, published } = await request.json()

    const updatedTitle = title !== undefined ? title : blog.title
    const updatedContent = content !== undefined ? content : blog.content
    const updatedCoverImage = coverImage !== undefined ? coverImage : blog.coverImage
    const updatedCategory = category !== undefined ? category : blog.category
    const updatedPublished = published !== undefined ? published : blog.published

    const result = await query(
      `UPDATE blogs 
       SET title = $1, content = $2, "coverImage" = $3, category = $4, published = $5, "updatedAt" = NOW()
       WHERE id = $6
       RETURNING id, title, content, "coverImage", category, published`,
      [updatedTitle, updatedContent, updatedCoverImage, updatedCategory, updatedPublished, params.id]
    )

    return NextResponse.json(
      { success: true, message: 'Blog updated successfully', blog: result.rows[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update blog error:', error)
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Failed to update blog. Please try again later.' },
      { status: 500 }
    )
  }
}

// DELETE blog
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication token
    const authHeader = request.headers.get('authorization')
    const token = authHeader ? extractTokenFromHeader(authHeader) : null
    const decoded = token ? verifyToken(token) : null

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get existing blog
    const blogResult = await query(
      'SELECT "authorId" FROM blogs WHERE id = $1',
      [params.id]
    )

    if (blogResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message: 'Blog not found' },
        { status: 404 }
      )
    }

    const blog = blogResult.rows[0]

    // Verify ownership or admin privileges
    const isOwner = blog.authorId === decoded.id
    const isAdmin = decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'You do not have permission to delete this blog' },
        { status: 403 }
      )
    }

    await query('DELETE FROM blogs WHERE id = $1', [params.id])

    return NextResponse.json(
      { success: true, message: 'Blog deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete blog error:', error)
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Failed to delete blog. Please try again later.' },
      { status: 500 }
    )
  }
}
