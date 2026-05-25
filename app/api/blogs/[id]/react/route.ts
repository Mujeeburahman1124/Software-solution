import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST to increment a reaction count
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type } = await request.json()
    
    const validTypes = ['likes', 'loves', 'claps', 'fires']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_TYPE', message: 'Invalid reaction type' },
        { status: 400 }
      )
    }

    // Safely interpolate type because it's validated against a strict whitelist
    const result = await query(
      `UPDATE blogs 
       SET "${type}" = COALESCE("${type}", 0) + 1 
       WHERE id = $1 
       RETURNING id, "${type}" as count`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, count: result.rows[0].count },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Reaction update error:', error)
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Failed to update reaction' },
      { status: 500 }
    )
  }
}
