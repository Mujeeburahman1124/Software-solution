import { Pool, PoolClient } from 'pg'

// Prevent multiple instances of pg pool in development
declare global {
  var _pgPool: Pool | undefined
}

export function getPool(): Pool {
  if (process.env.NODE_ENV !== 'production') {
    if (!global._pgPool) {
      const connectionString = process.env.DATABASE_URL
      if (!connectionString) {
        throw new Error('DATABASE_URL is not defined')
      }
      global._pgPool = new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      })
    }
    return global._pgPool
  }

  // Production behavior
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  return new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  })
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return pool.connect()
}

export async function query(text: string, params?: any[]) {
  const pool = getPool()
  return pool.query(text, params)
}

export async function closePool(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    if (global._pgPool) {
      await global._pgPool.end()
      global._pgPool = undefined
    }
  }
}
