import { query } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET all comments for a blog post
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      `SELECT id, "blogId", "authorName", content, "createdAt" 
       FROM comments 
       WHERE "blogId" = $1 
       ORDER BY "createdAt" DESC`,
      [params.id]
    )

    return NextResponse.json(
      { success: true, comments: result.rows },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Get comments error:', error)
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Failed to retrieve comments' },
      { status: 500 }
    )
  }
}

// POST a new comment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { content, guestName } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', message: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Check if user is logged in
    const authHeader = request.headers.get('authorization')
    const token = authHeader ? extractTokenFromHeader(authHeader) : null
    const decoded = token ? verifyToken(token) : null

    let authorName = 'Guest Reader'

    if (decoded) {
      const userResult = await query('SELECT name FROM users WHERE id = $1', [decoded.id])
      if (userResult.rows.length > 0) {
        authorName = userResult.rows[0].name
      }
    } else if (guestName?.trim()) {
      authorName = guestName.trim()
    }

    const result = await query(
      `INSERT INTO comments ("blogId", "authorName", content, "createdAt")
       VALUES ($1, $2, $3, NOW())
       RETURNING id, "blogId", "authorName", content, "createdAt"`,
      [params.id, authorName, content.trim()]
    )

    return NextResponse.json(
      { success: true, message: 'Comment added successfully', comment: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Add comment error:', error)
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Failed to add comment. Please try again later.' },
      { status: 500 }
    )
  }
}
