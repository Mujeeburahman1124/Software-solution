export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')
    if (!token) {
      return NextResponse.json({ isBookmarked: false }, { status: 200 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ isBookmarked: false }, { status: 200 })
    }

    const result = await query(
      'SELECT * FROM bookmarks WHERE "userId" = $1 AND "blogId" = $2',
      [decoded.id, params.id]
    )

    return NextResponse.json({
      isBookmarked: result.rows.length > 0,
    })
  } catch (error) {
    console.error('Error fetching bookmark status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmark status' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if already bookmarked
    const checkResult = await query(
      'SELECT * FROM bookmarks WHERE "userId" = $1 AND "blogId" = $2',
      [decoded.id, params.id]
    )

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { message: 'Already bookmarked', isBookmarked: true },
        { status: 400 }
      )
    }

    await query(
      'INSERT INTO bookmarks ("userId", "blogId") VALUES ($1, $2)',
      [decoded.id, params.id]
    )

    return NextResponse.json({
      message: 'Bookmarked successfully',
      isBookmarked: true,
    })
  } catch (error) {
    console.error('Error adding bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to add bookmark' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    await query(
      'DELETE FROM bookmarks WHERE "userId" = $1 AND "blogId" = $2',
      [decoded.id, params.id]
    )

    return NextResponse.json({
      message: 'Bookmark removed successfully',
      isBookmarked: false,
    })
  } catch (error) {
    console.error('Error removing bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    )
  }
}
