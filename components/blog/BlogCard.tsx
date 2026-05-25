'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface BlogCardProps {
  id: string
  title: string
  excerpt?: string
  coverImage?: string
  category: string
  author: string
  createdAt: string
  views: number
  featured?: boolean
}

export default function BlogCard({
  id,
  title,
  excerpt,
  category,
  author,
  createdAt,
  views,
  featured = false,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${id}`}>
      <article className={`card cursor-pointer group transition-all ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
        <div className={`overflow-hidden rounded-lg mb-4 bg-gray-200 group-hover:scale-105 transition-transform duration-300 ${featured ? 'h-64' : 'h-48'}`}>
          <div className="w-full h-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
            <span className={`text-white ${featured ? 'text-7xl' : 'text-4xl'}`}>📰</span>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <span className="badge text-xs bg-accent text-white">{category}</span>
          {featured && <span className="badge text-xs bg-yellow-500 text-white">Featured</span>}
        </div>

        <h3 className={`font-bold mb-2 group-hover:text-accent transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
          {title}
        </h3>

        {excerpt && (
          <p className="text-secondary text-sm mb-4 line-clamp-2">
            {excerpt}
          </p>
        )}

        <div className={`flex justify-between items-center text-sm text-secondary ${featured ? 'text-base' : ''}`}>
          <span className="font-medium">{author}</span>
          <span className="flex items-center gap-1">
            <span>👁️</span>
            {views}
          </span>
        </div>

        <div className="text-xs text-secondary mt-3 flex justify-between">
          <span>{formatDate(createdAt)}</span>
          <span className="text-accent font-semibold group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </article>
    </Link>
  )
}
