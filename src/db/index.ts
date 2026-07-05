import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pkg;

export const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    console.log('Connecting to PostgreSQL using DATABASE_URL...');
    return new Pool({
      connectionString,
      connectionTimeoutMillis: 15000,
      ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
    });
  }

  console.log('Connecting to PostgreSQL using discrete SQL_ variables...');
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER || process.env.SQL_ADMIN_USER,
    password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
