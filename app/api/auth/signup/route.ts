import { query } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password validation: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validate required fields
    if (!email?.trim() || !password?.trim() || !name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Name, email, and password are required',
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

    // Validate name length
    if (name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_NAME',
          message: 'Name must be between 2 and 100 characters',
        },
        { status: 400 }
      )
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: 'WEAK_PASSWORD',
          message: 'Password must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number',
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_EXISTS',
          message: 'Email is already registered',
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await query(
      'INSERT INTO users (email, password, name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, email, name, role, "createdAt"',
      [email.toLowerCase(), hashedPassword, name.trim(), 'USER']
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'DATABASE_ERROR',
          message: 'Failed to create user',
        },
        { status: 500 }
      )
    }

    const user = result.rows[0]

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Signup error:', error)

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          {
            success: false,
            error: 'USER_EXISTS',
            message: 'Email is already registered',
          },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to create account. Please try again later.',
      },
      { status: 500 }
    )
  }
}
