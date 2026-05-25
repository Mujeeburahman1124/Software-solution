const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sheblog.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'

  // Create categories
  const categories = [
    { name: 'Technology', slug: 'technology', description: 'Latest tech trends and innovations' },
    { name: 'Development', slug: 'development', description: 'Software development practices and tutorials' },
    { name: 'Design', slug: 'design', description: 'UI/UX design and creative workflows' },
    { name: 'Business', slug: 'business', description: 'Business strategy and growth insights' },
    { name: 'Marketing', slug: 'marketing', description: 'Digital marketing and content strategy' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {},
    create: {
      name: 'Platform Admin',
      email: adminEmail.toLowerCase(),
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create sample blogs
  const blogs = [
    {
      title: 'Getting Started with Next.js 14: A Comprehensive Guide',
      slug: 'getting-started-nextjs-14',
      excerpt: 'Learn the fundamentals of Next.js 14 and build fast, modern web applications with React server components.',
      content: 'Next.js 14 brings powerful new features including the App Router, Server Components, and improved performance. Learn how to build modern web applications using Next.js 14. The App Router provides a more intuitive way to organize your application structure. Server Components reduce the amount of JavaScript shipped to the browser, improving performance and user experience. Built-in optimizations like image optimization and dynamic imports make your application faster out of the box.',
      published: true,
      featured: true,
      authorId: adminUser.id,
      categoryId: 2, // Development
      coverImageUrl: '/blog-1.svg',
    },
    {
      title: 'TypeScript Best Practices for Production Applications',
      slug: 'typescript-best-practices',
      excerpt: 'Master TypeScript with essential best practices for building robust, production-grade applications.',
      content: 'TypeScript provides compile-time type safety that helps catch errors before runtime. Learn best practices for using TypeScript in production environments. Strict mode enables all type checking rules, catching potential issues early. Proper use of generics makes your code more flexible and reusable. Understanding union types, discriminated unions, and advanced types leads to more robust applications.',
      published: true,
      featured: true,
      authorId: adminUser.id,
      categoryId: 2, // Development
      coverImageUrl: '/blog-2.svg',
    },
    {
      title: 'The Future of Web Design: Trends to Watch in 2026',
      slug: 'future-web-design-2026',
      excerpt: 'Explore emerging design trends that will shape digital experiences in the coming years.',
      content: 'Web design continues to evolve rapidly. AI-powered design tools, motion design, and immersive web experiences are becoming mainstream. Dark mode support is essential for modern applications. Accessibility considerations must be built in from the start. Responsive design is no longer optional but fundamental to any web project.',
      published: true,
      featured: false,
      authorId: adminUser.id,
      categoryId: 3, // Design
      coverImageUrl: '/blog-3.svg',
    },
    {
      title: 'React Hooks Deep Dive: useState, useEffect, and Custom Hooks',
      slug: 'react-hooks-deep-dive',
      excerpt: 'Understanding React Hooks: master useState, useEffect, useContext, and create your own custom hooks.',
      content: 'React Hooks revolutionized how we write React components. Functional components with hooks are now the preferred approach. useState manages component state in functional components. useEffect handles side effects like data fetching and subscriptions. Custom hooks allow you to extract and share stateful logic between components.',
      published: true,
      featured: true,
      authorId: adminUser.id,
      categoryId: 2, // Development
      coverImageUrl: '/blog-1.svg',
    },
    {
      title: 'Cloud Architecture Patterns for Scalable Applications',
      slug: 'cloud-architecture-patterns',
      excerpt: 'Design scalable and resilient cloud systems using proven architectural patterns and best practices.',
      content: 'Building scalable cloud applications requires understanding architectural patterns. Microservices architecture enables independent scaling of application components. Event-driven architecture decouples services and improves responsiveness. Load balancing distributes traffic across multiple servers. Caching strategies reduce database load and improve response times.',
      published: true,
      featured: false,
      authorId: adminUser.id,
      categoryId: 1, // Technology
      coverImageUrl: '/blog-2.svg',
    },
    {
      title: 'Digital Transformation Strategy: A Roadmap for Success',
      slug: 'digital-transformation-strategy',
      excerpt: 'Guide your organization through digital transformation with strategic planning and implementation.',
      content: 'Digital transformation is not just about technology. It requires organizational change and cultural shift. Start with a clear vision and measurable goals. Engage stakeholders at all levels. Invest in employee training and development. Choose the right technology partners and platforms.',
      published: true,
      featured: false,
      authorId: adminUser.id,
      categoryId: 4, // Business
      coverImageUrl: '/blog-3.svg',
    },
    {
      title: 'Tailwind CSS: Building Beautiful UIs with Utility-First CSS',
      slug: 'tailwind-css-utility-first',
      excerpt: 'Master Tailwind CSS and build stunning, responsive user interfaces with utility-first CSS classes.',
      content: 'Tailwind CSS is a utility-first CSS framework that enables rapid UI development. Instead of writing custom CSS, you use pre-defined utility classes. Responsive design is built-in with mobile-first breakpoints. Dark mode support is simple and intuitive. JIT compilation ensures your CSS bundle is minimal and optimized.',
      published: true,
      featured: true,
      authorId: adminUser.id,
      categoryId: 3, // Design
      coverImageUrl: '/blog-1.svg',
    },
    {
      title: 'PostgreSQL Query Optimization: From Slow to Fast',
      slug: 'postgresql-query-optimization',
      excerpt: 'Learn techniques to optimize PostgreSQL queries and dramatically improve database performance.',
      content: 'Database performance is critical for application success. Proper indexing dramatically improves query speed. Understanding query execution plans helps identify bottlenecks. Connection pooling reduces overhead of creating new connections. Regular maintenance like vacuuming and analyzing keeps your database healthy.',
      published: true,
      featured: false,
      authorId: adminUser.id,
      categoryId: 1, // Technology
      coverImageUrl: '/blog-2.svg',
    },
    {
      title: 'API Security Best Practices: Protecting Your Backend',
      slug: 'api-security-best-practices',
      excerpt: 'Secure your APIs with industry-standard practices and protect your backend from common vulnerabilities.',
      content: 'API security is essential in the modern web. Authentication ensures users are who they claim to be. Authorization controls what authenticated users can do. HTTPS encrypts data in transit. Rate limiting prevents abuse. Input validation prevents injection attacks.',
      published: true,
      featured: false,
      authorId: adminUser.id,
      categoryId: 2, // Development
      coverImageUrl: '/blog-3.svg',
    },
    {
      title: 'Responsive Web Design: Mobile-First Approach',
      slug: 'responsive-web-design-mobile-first',
      excerpt: 'Master responsive web design with mobile-first approach and ensure great user experience on all devices.',
      content: 'Mobile-first design ensures your application works great on all devices. Start with mobile layout and enhance for larger screens. Use CSS media queries for responsive breakpoints. Flexible layouts use percentages instead of fixed pixels. Flexible images scale with their containers.',
      published: true,
      featured: false,
      authorId: adminUser.id,
      categoryId: 3, // Design
      coverImageUrl: '/blog-1.svg',
    },
    {
      title: 'Testing Your JavaScript Applications: Unit to E2E',
      slug: 'testing-javascript-applications',
      excerpt: 'Comprehensive guide to testing JavaScript applications from unit tests to end-to-end testing.',
      content: 'Testing is crucial for application reliability. Unit tests verify individual functions work correctly. Integration tests check how components work together. E2E tests simulate real user interactions. Test coverage metrics help identify untested code. Continuous integration runs tests automatically.',
      published: true,
      featured: false,
      authorId: adminUser.id,
      categoryId: 2, // Development
      coverImageUrl: '/blog-2.svg',
    },
    {
      title: 'Content Management Strategy for Modern Blogs',
      slug: 'content-management-strategy-blogs',
      excerpt: 'Develop an effective content management strategy to grow your blog and engage your audience.',
      content: 'A successful blog requires consistent, quality content. Create a content calendar to plan ahead. Understand your audience and create relevant content. Use SEO best practices to improve discoverability. Promote your content across multiple channels. Engage with comments and feedback.',
      published: true,
      featured: false,
      authorId: adminUser.id,
      categoryId: 5, // Marketing
      coverImageUrl: '/blog-3.svg',
    },
  ]

  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {},
      create: blog,
    })
  }

  console.log('✅ Prisma seed completed successfully with 12 comprehensive blogs.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
