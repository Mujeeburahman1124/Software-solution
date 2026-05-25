'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white mt-16">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">She Blog Platform</h3>
            <p className="text-gray-300 text-sm">
              A professional blog platform for sharing knowledge and insights.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/create" className="hover:text-white">Write</Link></li>
              <li><Link href="/saved" className="hover:text-white">Saved</Link></li>
              <li><Link href="/admin" className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><a href="#" className="hover:text-white">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-300 text-sm">
          <p>&copy; {currentYear} She Software Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
