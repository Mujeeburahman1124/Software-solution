/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

async function setupDatabase() {
  const client = await pool.connect()

  try {
    console.log('Setting up database...')

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
