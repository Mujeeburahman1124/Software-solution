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
        "coverImage" VARCHAR(500),
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

    // Seed an admin account for local testing
    const adminEmail = 'admin@sheblog.com'
    const adminName = 'Site Admin'
    const adminPassword = 'Admin1234'
    const adminUser = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [adminEmail])
    let adminUserId
    if (adminUser.rows.length === 0) {
      const hashedAdminPassword = bcrypt.hashSync(adminPassword, 10)
      const insertedAdmin = await client.query(
        'INSERT INTO users (email, password, name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
        [adminEmail, hashedAdminPassword, adminName, 'ADMIN']
      )
      adminUserId = insertedAdmin.rows[0].id
      console.log(`✓ Admin account created: ${adminEmail} / ${adminPassword}`)
    } else {
      adminUserId = adminUser.rows[0].id
      console.log(`✓ Admin account already exists: ${adminEmail}`)
    }

    const blogCount = await client.query('SELECT COUNT(*) AS count FROM blogs')
    if (Number(blogCount.rows[0].count) === 0) {
      await client.query(
        `INSERT INTO blogs (title, content, excerpt, "coverImage", category, "authorId", author, tags, views, published, likes, loves, claps, fires, "createdAt", "updatedAt") VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()),
          ($15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW()),
          ($29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, NOW(), NOW())`,
        [
          'Launching She Blog: Your Professional Publishing Platform',
          'Build content, grow your audience, and share industry insights with She Blog.',
          'Build content, grow your audience, and share industry insights.',
          '/blog-1.jpg',
          'Technology',
          adminUserId,
          adminName,
          ['Next.js', 'Blog', 'Productivity'],
          1820,
          true,
          42,
          14,
          10,
          5,
          'Publishing your first post is the first step to building an audience.',
          'Launching She Blog: Your Professional Publishing Platform',
          'A growing development team shares modern workflows, hosting tips, and production-ready tools.',
          '/blog-2.jpg',
          'Development',
          adminUserId,
          adminName,
          ['Development', 'Next.js', 'Workflows'],
          1390,
          true,
          27,
          9,
          4,
          3,
          'See how a practical blog platform can accelerate publishing and collaboration.',
          'Designing Growth-Focused Editorial Workflows',
          'Design systems, user flows, and brand identity tips for technical blogs.',
          '/blog-3.jpg',
          'Design',
          adminUserId,
          adminName,
          ['Design', 'Branding', 'Productivity'],
          1645,
          true,
          33,
          12,
          7,
          2,
        ]
      )
      console.log('✓ Sample blog entries added')
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
