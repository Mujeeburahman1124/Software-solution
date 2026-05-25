import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'She Blog Platform | Professional Blog Software',
  description: 'A modern, professional blog platform for sharing knowledge and insights.',
  keywords: 'blog, content, articles, SEO, publishing',
  authors: [{ name: 'She Software Solutions' }],
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'She Blog Platform',
    description: 'A modern, professional blog platform for sharing knowledge and insights.',
    siteName: 'She Blog Platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
