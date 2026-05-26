const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

async function main() {
  try {
    const res = await pool.query('SELECT id, title, "coverImage", excerpt, category FROM blogs ORDER BY "createdAt" DESC LIMIT 10')
    console.log(JSON.stringify(res.rows, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    await pool.end()
  }
}

main()
