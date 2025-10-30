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
    trustServerCertificate: true,
    encrypt: true,
    connectTimeout: 15000,
  }
};

async function initializeDatabase() {
  let connection;

  try {
    // Connect to master database first
    connection = new sql.ConnectionPool(config);
    await connection.connect();

    const request = connection.request();

    console.log('🔄 Checking if database exists...');

    // Create database if doesn't exist
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${process.env.DB_NAME}')
      BEGIN
        CREATE DATABASE ${process.env.DB_NAME}
      END
    `);

    console.log('✅ Database ready');

    // Close connection to master and connect to target database
    await connection.close();

    // Now connect to the target database
    const dbConfig = {
      ...config,
      options: {
        ...config.options,
        database: process.env.DB_NAME
      }
    };

    connection = new sql.ConnectionPool(dbConfig);
    await connection.connect();

    console.log('🔄 Creating tables...');

    // Drop existing tables if they exist (to ensure fresh schema)
    await connection.request().query(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tasks')
      DROP TABLE tasks;
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
      DROP TABLE users;
    `);

    console.log('🔄 Dropped existing tables');

    // Create Users table
    await connection.request().query(`
      CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(255) NOT NULL,
        userId NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(MAX) NOT NULL,
        role NVARCHAR(50) NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
      )
    `);

    console.log('✅ Users table created');

    // Create Tasks table
    await connection.request().query(`
      CREATE TABLE tasks (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        priority NVARCHAR(50) DEFAULT 'medium',
        category NVARCHAR(100),
        due_date DATE,
        status NVARCHAR(50) DEFAULT 'todo',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tasks table created');

    // Insert demo users
    await connection.request().query(`
      INSERT INTO users (name, userId, password, role) VALUES
      ('John Admin', 'admin', '$2a$10$YourHashedPasswordHere', 'admin'),
      ('Sarah User', 'sarah', '$2a$10$YourHashedPasswordHere', 'user'),
      ('Mike User', 'mike', '$2a$10$YourHashedPasswordHere', 'user')
    `);

    console.log('✅ Demo users inserted');

    // Insert demo tasks
    await connection.request().query(`
      INSERT INTO tasks (user_id, title, description, priority, category, due_date, status) VALUES
      (2, 'Design homepage mockup', 'Create a responsive homepage design', 'high', 'Design', '2025-11-05', 'in_progress'),
      (3, 'Set up database schema', 'Design and implement PostgreSQL schema', 'high', 'Backend', '2025-11-01', 'plan'),
      (2, 'Integrate payment gateway', 'Add Stripe integration', 'medium', 'Backend', '2025-11-10', 'plan'),
      (3, 'Fix login bug', 'Users cannot login with email', 'high', 'Bug', '2025-10-30', 'in_progress'),
      (2, 'Write API documentation', 'Document all API endpoints', 'low', 'Documentation', '2025-11-15', 'completed'),
      (3, 'Optimize image loading', 'Implement lazy loading for images', 'medium', 'Frontend', '2025-11-08', 'completed')
    `);

    console.log('✅ Demo tasks inserted');

    console.log('✅ Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

initializeDatabase()
  .then(() => {
    console.log('Database setup finished!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
