/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

async function setupDatabase() {
  const client = await pool.connect()

  try {
    console.log('Setting up database...')

    // Enable UUID generation if possible
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)

    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✓ Users table created')

    // Create Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✓ Categories table created')

    // Create Blogs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        "coverImage" TEXT,
        category VARCHAR(255),
        "authorId" UUID REFERENCES users(id),
        author VARCHAR(255),
        tags TEXT[],
        views INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT false,
        likes INTEGER DEFAULT 0,
        loves INTEGER DEFAULT 0,
        claps INTEGER DEFAULT 0,
        fires INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✓ Blogs table created')

    // Add columns to existing blogs table if it exists
    await client.query(`
      ALTER TABLE blogs ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
      ALTER TABLE blogs ADD COLUMN IF NOT EXISTS loves INTEGER DEFAULT 0;
      ALTER TABLE blogs ADD COLUMN IF NOT EXISTS claps INTEGER DEFAULT 0;
      ALTER TABLE blogs ADD COLUMN IF NOT EXISTS fires INTEGER DEFAULT 0;
    `)
    await client.query(`
      ALTER TABLE blogs ALTER COLUMN IF EXISTS "coverImage" TYPE TEXT;
    `)
    console.log('✓ Blogs table columns updated')

    // Create Comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "blogId" UUID REFERENCES blogs(id) ON DELETE CASCADE,
        "authorName" VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    // Create Bookmarks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
        "blogId" UUID REFERENCES blogs(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("userId", "blogId")
      );
    `)
    console.log('✓ Bookmarks table created')

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs("authorId")')
    await client.query('CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON comments("blogId")')
    console.log('✓ Indexes created')

    // Seed sample accounts for local testing
    const sampleAccounts = [
      {
        email: 'admin@sheblog.com',
        name: 'Site Admin',
        password: 'Admin1234',
        role: 'ADMIN',
      },
      {
        email: 'demo@example.com',
        name: 'Demo Creator',
        password: 'demo12345',
        role: 'USER',
      },
    ]

    let adminUserId
    let adminName = 'Site Admin'
    
    for (const account of sampleAccounts) {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [account.email]
      )

      if (existingUser.rows.length === 0) {
        const hashedPassword = bcrypt.hashSync(account.password, 10)
        const insertedUser = await client.query(
          'INSERT INTO users (email, password, name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
          [account.email, hashedPassword, account.name, account.role]
        )

        if (account.role === 'ADMIN') {
          adminUserId = insertedUser.rows[0].id
          adminName = account.name
        }

        console.log(`✓ ${account.role} account created: ${account.email} / ${account.password}`)
      } else {
        if (account.role === 'ADMIN') {
          adminUserId = existingUser.rows[0].id
          adminName = account.name
        }
        console.log(`✓ ${account.role} account already exists: ${account.email}`)
      }
    }

    const blogCount = await client.query('SELECT COUNT(*) AS count FROM blogs')
    if (Number(blogCount.rows[0].count) === 0) {
      const sampleBlogs = [
        {
          title: 'Getting Started with Next.js 14: A Comprehensive Guide',
          content: 'Next.js 14 brings powerful new features including the App Router, Server Components, and improved performance. Learn how to build modern web applications using Next.js 14. The App Router provides a more intuitive way to organize your application structure. Server Components reduce the amount of JavaScript shipped to the browser, improving performance and user experience. Built-in optimizations like image optimization and dynamic imports make your application faster out of the box.',
          excerpt: 'Learn the fundamentals of Next.js 14 and build fast, modern web applications with React server components.',
          coverImage: '/blog-1.svg',
          category: 'Development',
          tags: ['Next.js', 'React', 'JavaScript'],
          views: 2450,
          published: true,
          likes: 85,
          loves: 42,
          claps: 28,
          fires: 15,
        },
        {
          title: 'TypeScript Best Practices for Production Applications',
          content: 'TypeScript provides compile-time type safety that helps catch errors before runtime. Learn best practices for using TypeScript in production environments. Strict mode enables all type checking rules, catching potential issues early. Proper use of generics makes your code more flexible and reusable. Understanding union types, discriminated unions, and advanced types leads to more robust applications.',
          excerpt: 'Master TypeScript with essential best practices for building robust, production-grade applications.',
          coverImage: '/blog-2.svg',
          category: 'Development',
          tags: ['TypeScript', 'JavaScript', 'Best Practices'],
          views: 3120,
          published: true,
          likes: 98,
          loves: 67,
          claps: 45,
          fires: 22,
        },
        {
          title: 'The Future of Web Design: Trends to Watch in 2026',
          content: 'Web design continues to evolve rapidly. AI-powered design tools, motion design, and immersive web experiences are becoming mainstream. Dark mode support is essential for modern applications. Accessibility considerations must be built in from the start. Responsive design is no longer optional but fundamental to any web project.',
          excerpt: 'Explore emerging design trends that will shape digital experiences in the coming years.',
          coverImage: '/blog-3.svg',
          category: 'Design',
          tags: ['Design', 'UX', 'Trends'],
          views: 1890,
          published: true,
          likes: 76,
          loves: 54,
          claps: 32,
          fires: 18,
        },
        {
          title: 'React Hooks Deep Dive: useState, useEffect, and Custom Hooks',
          content: 'React Hooks revolutionized how we write React components. Functional components with hooks are now the preferred approach. useState manages component state in functional components. useEffect handles side effects like data fetching and subscriptions. Custom hooks allow you to extract and share stateful logic between components.',
          excerpt: 'Understanding React Hooks: master useState, useEffect, useContext, and create your own custom hooks.',
          coverImage: '/blog-1.svg',
          category: 'Development',
          tags: ['React', 'Hooks', 'JavaScript'],
          views: 2780,
          published: true,
          likes: 112,
          loves: 78,
          claps: 56,
          fires: 29,
        },
        {
          title: 'Cloud Architecture Patterns for Scalable Applications',
          content: 'Building scalable cloud applications requires understanding architectural patterns. Microservices architecture enables independent scaling of application components. Event-driven architecture decouples services and improves responsiveness. Load balancing distributes traffic across multiple servers. Caching strategies reduce database load and improve response times.',
          excerpt: 'Design scalable and resilient cloud systems using proven architectural patterns and best practices.',
          coverImage: '/blog-2.svg',
          category: 'Technology',
          tags: ['Cloud', 'Architecture', 'Scalability'],
          views: 2145,
          published: true,
          likes: 89,
          loves: 61,
          claps: 38,
          fires: 21,
        },
        {
          title: 'Digital Transformation Strategy: A Roadmap for Success',
          content: 'Digital transformation is not just about technology. It requires organizational change and cultural shift. Start with a clear vision and measurable goals. Engage stakeholders at all levels. Invest in employee training and development. Choose the right technology partners and platforms.',
          excerpt: 'Guide your organization through digital transformation with strategic planning and implementation.',
          coverImage: '/blog-3.svg',
          category: 'Business',
          tags: ['Digital', 'Transformation', 'Strategy'],
          views: 1650,
          published: true,
          likes: 72,
          loves: 48,
          claps: 28,
          fires: 14,
        },
        {
          title: 'Tailwind CSS: Building Beautiful UIs with Utility-First CSS',
          content: 'Tailwind CSS is a utility-first CSS framework that enables rapid UI development. Instead of writing custom CSS, you use pre-defined utility classes. Responsive design is built-in with mobile-first breakpoints. Dark mode support is simple and intuitive. JIT compilation ensures your CSS bundle is minimal and optimized.',
          excerpt: 'Master Tailwind CSS and build stunning, responsive user interfaces with utility-first CSS classes.',
          coverImage: '/blog-1.svg',
          category: 'Design',
          tags: ['CSS', 'Tailwind', 'UI'],
          views: 3450,
          published: true,
          likes: 156,
          loves: 98,
          claps: 72,
          fires: 35,
        },
        {
          title: 'PostgreSQL Query Optimization: From Slow to Fast',
          content: 'Database performance is critical for application success. Proper indexing dramatically improves query speed. Understanding query execution plans helps identify bottlenecks. Connection pooling reduces overhead of creating new connections. Regular maintenance like vacuuming and analyzing keeps your database healthy.',
          excerpt: 'Learn techniques to optimize PostgreSQL queries and dramatically improve database performance.',
          coverImage: '/blog-2.svg',
          category: 'Technology',
          tags: ['PostgreSQL', 'Database', 'Performance'],
          views: 2340,
          published: true,
          likes: 94,
          loves: 63,
          claps: 41,
          fires: 19,
        },
        {
          title: 'API Security Best Practices: Protecting Your Backend',
          content: 'API security is essential in the modern web. Authentication ensures users are who they claim to be. Authorization controls what authenticated users can do. HTTPS encrypts data in transit. Rate limiting prevents abuse. Input validation prevents injection attacks.',
          excerpt: 'Secure your APIs with industry-standard practices and protect your backend from common vulnerabilities.',
          coverImage: '/blog-3.svg',
          category: 'Development',
          tags: ['Security', 'API', 'Backend'],
          views: 2890,
          published: true,
          likes: 128,
          loves: 87,
          claps: 58,
          fires: 27,
        },
        {
          title: 'Responsive Web Design: Mobile-First Approach',
          content: 'Mobile-first design ensures your application works great on all devices. Start with mobile layout and enhance for larger screens. Use CSS media queries for responsive breakpoints. Flexible layouts use percentages instead of fixed pixels. Flexible images scale with their containers.',
          excerpt: 'Master responsive web design with mobile-first approach and ensure great user experience on all devices.',
          coverImage: '/blog-1.svg',
          category: 'Design',
          tags: ['Responsive', 'Mobile', 'Design'],
          views: 1920,
          published: true,
          likes: 81,
          loves: 52,
          claps: 34,
          fires: 17,
        },
        {
          title: 'Testing Your JavaScript Applications: Unit to E2E',
          content: 'Testing is crucial for application reliability. Unit tests verify individual functions work correctly. Integration tests check how components work together. E2E tests simulate real user interactions. Test coverage metrics help identify untested code. Continuous integration runs tests automatically.',
          excerpt: 'Comprehensive guide to testing JavaScript applications from unit tests to end-to-end testing.',
          coverImage: '/blog-2.svg',
          category: 'Development',
          tags: ['Testing', 'JavaScript', 'Quality'],
          views: 2670,
          published: true,
          likes: 105,
          loves: 72,
          claps: 48,
          fires: 24,
        },
        {
          title: 'Content Management Strategy for Modern Blogs',
          content: 'A successful blog requires consistent, quality content. Create a content calendar to plan ahead. Understand your audience and create relevant content. Use SEO best practices to improve discoverability. Promote your content across multiple channels. Engage with comments and feedback.',
          excerpt: 'Develop an effective content management strategy to grow your blog and engage your audience.',
          coverImage: '/blog-3.svg',
          category: 'Business',
          tags: ['Content', 'Marketing', 'Strategy'],
          views: 1560,
          published: true,
          likes: 68,
          loves: 44,
          claps: 26,
          fires: 12,
        },
      ]

      // Insert all sample blogs
      for (const blog of sampleBlogs) {
        await client.query(
          `INSERT INTO blogs (title, content, excerpt, "coverImage", category, "authorId", author, tags, views, published, likes, loves, claps, fires, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
          [
            blog.title,
            blog.content,
            blog.excerpt,
            blog.coverImage,
            blog.category,
            adminUserId,
            adminName,
            JSON.stringify(blog.tags),
            blog.views,
            blog.published,
            blog.likes,
            blog.loves,
            blog.claps,
            blog.fires,
          ]
        )
      }
      console.log(`✓ ${sampleBlogs.length} comprehensive blog entries added`)
    } else {
      console.log('✓ Existing blog content detected; no sample blogs added')
    }

    console.log('\n✅ Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

setupDatabase()
