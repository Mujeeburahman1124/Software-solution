'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (apiClient.isAuthenticated()) {
      setUser(apiClient.getUser())
    }
  }, [])

  const handleLogout = () => {
    apiClient.logout()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container-app py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-primary hidden sm:inline">She Blog</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-secondary hover:text-primary transition font-medium">
            Home
          </Link>
          <Link href="/#blogs" className="text-secondary hover:text-primary transition font-medium">
            All Blogs
          </Link>
          {mounted && user ? (
            <>
              <Link href="/create" className="text-secondary hover:text-primary transition font-medium">
                Write
              </Link>
              <Link href="/admin" className="text-secondary hover:text-primary transition font-medium">
                Dashboard
              </Link>
              <Link href="/saved" className="text-secondary hover:text-primary transition font-medium flex items-center gap-1">
                <span>🔖</span> Saved
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-primary">{user.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-secondary hover:text-red-600 transition"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-primary text-sm">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 md:hidden w-56 border border-gray-100 z-50">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-secondary hover:text-primary font-medium"
            >
              Home
            </Link>
            <Link 
              href="/#blogs" 
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-secondary hover:text-primary font-medium"
            >
              All Blogs
            </Link>
            {mounted && user ? (
              <>
                <Link 
                  href="/create" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-secondary hover:text-primary font-medium"
                >
                  Write
                </Link>
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-secondary hover:text-primary font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/saved" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-secondary hover:text-primary font-medium"
                >
                  🔖 Saved
                </Link>
                <div className="border-t border-gray-100 my-2 pt-2">
                  <p className="text-sm font-semibold text-primary px-1">{user.name}</p>
                  <p className="text-xs text-accent px-1 mb-2 font-medium">{user.role}</p>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-left py-2 px-1 text-sm text-red-500 hover:bg-red-50 rounded transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 mt-2 text-center btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
