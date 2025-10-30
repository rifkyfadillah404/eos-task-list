import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }
  },
  options: {
    database: process.env.DB_NAME,
    trustServerCertificate: true,
    encrypt: true,
    connectTimeout: 15000,
  }
};

let pool = null;

export const connectDB = async () => {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connected to SQL Server');
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
};

export const closeDB = async () => {
  if (pool) {
    await pool.close();
    console.log('Database connection closed');
  }
};

export default sql;
