import { query } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Email and password are required',
        },
        { status: 400 }
      )
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_EMAIL',
          message: 'Please provide a valid email address',
        },
        { status: 400 }
      )
    }

    // Find user
    const result = await query(
      'SELECT id, email, password, name, role, "createdAt" FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    // Verify password
    let passwordMatch = false
    try {
      passwordMatch = await verifyPassword(password, user.password)
    } catch (error) {
      console.error('Password verification error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'AUTH_ERROR',
          message: 'Authentication failed. Please try again.',
        },
        { status: 500 }
      )
    }

    if (!passwordMatch) {
      // Don't reveal whether email exists or password is wrong
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    // Generate token
    let token: string
    try {
      token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      })
    } catch (error) {
      console.error('Token generation error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'TOKEN_ERROR',
          message: 'Failed to generate authentication token',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Login error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Login failed. Please try again later.',
      },
      { status: 500 }
    )
  }
}
