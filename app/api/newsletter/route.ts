import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { success: true, message: 'You are already subscribed to the newsletter' },
        { status: 200 }
      )
    }

    await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase(),
      },
    })

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
