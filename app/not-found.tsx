'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-8xl">404</span>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2">Page Not Found</h1>
        <p className="text-secondary mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/blogs" className="btn-secondary">
            View Blogs
          </Link>
        </div>
      </div>
    </div>
  )
}
