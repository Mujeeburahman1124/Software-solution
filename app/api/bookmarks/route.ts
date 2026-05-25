export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch the bookmarked blogs for this user
    const result = await query(`
      SELECT b.*, bm."createdAt" as "bookmarkedAt"
      FROM blogs b
      JOIN bookmarks bm ON b.id = bm."blogId"
      WHERE bm."userId" = $1
      ORDER BY bm."createdAt" DESC
    `, [decoded.id])

    return NextResponse.json({
      blogs: result.rows
    })
  } catch (error) {
    console.error('Error fetching bookmarked blogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarked blogs' },
      { status: 500 }
    )
  }
}
