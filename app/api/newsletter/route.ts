import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_EMAIL', message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const emailLower = email.toLowerCase()

    // Create table if it doesn't exist (since it wasn't in db-setup.js)
    await query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    const existing = await query(
      'SELECT id FROM newsletter_subscriptions WHERE email = $1',
      [emailLower]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: true, message: 'You are already subscribed to the newsletter' },
        { status: 200 }
      )
    }

    await query(
      'INSERT INTO newsletter_subscriptions (email) VALUES ($1)',
      [emailLower]
    )

    return NextResponse.json(
      { success: true, message: 'Subscription successful' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
