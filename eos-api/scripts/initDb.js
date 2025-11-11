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
    // Handle all foreign key constraints that reference users or tasks before dropping tables
    await connection.request().query(`
      -- Drop all foreign key constraints that reference users or tasks tables
      DECLARE @sql NVARCHAR(MAX) = '';
      SELECT @sql = @sql + 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(parent_obj.schema_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_obj.object_id)) + 
                   ' DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';'
      FROM sys.foreign_keys fk
      INNER JOIN sys.objects parent_obj ON fk.parent_object_id = parent_obj.object_id
      INNER JOIN sys.objects referenced_obj ON fk.referenced_object_id = referenced_obj.object_id
      WHERE referenced_obj.name IN ('users', 'tasks');
      
      EXEC sp_executesql @sql;
      
      -- Now drop tables in the correct order (dependent table first)
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'comments')
      DROP TABLE comments;
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tasks')
      DROP TABLE tasks;
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'jobs')
      DROP TABLE jobs;
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
      DROP TABLE users;
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'departments')
      DROP TABLE departments;
    `);

    console.log('🔄 Dropped existing tables');

    // Create Departments table (master data)
    await connection.request().query(`
      CREATE TABLE departments (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(150) NOT NULL,
        code NVARCHAR(50) NULL,
        created_at DATETIME DEFAULT GETUTCDATE(),
        updated_at DATETIME DEFAULT GETUTCDATE()
      )
    `);

    console.log('✅ Departments table created');

    // Create Users table
    await connection.request().query(`
      CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(255) NOT NULL,
        userId NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(MAX) NOT NULL,
        role NVARCHAR(50) NOT NULL DEFAULT 'user',
        department_id INT NULL,
        created_at DATETIME DEFAULT GETUTCDATE(),
        updated_at DATETIME DEFAULT GETUTCDATE()
        ,FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Users table created');

    // Create Jobs table (master job data)
    await connection.request().query(`
      CREATE TABLE jobs (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        category NVARCHAR(100) NOT NULL,
        parent NVARCHAR(100) NULL,
        sub_parent NVARCHAR(100),
        department_id INT NOT NULL,
        created_at DATETIME DEFAULT GETUTCDATE(),
        updated_at DATETIME DEFAULT GETUTCDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Jobs table created');

    // Create Tasks table
    await connection.request().query(`
      CREATE TABLE tasks (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        priority NVARCHAR(50) DEFAULT 'medium',
        category NVARCHAR(100),
        due_date DATETIME,
        status NVARCHAR(50) DEFAULT 'todo',
        job_id INT NULL,
        plan_by INT NULL,
        completed_by INT NULL,
        completed_date DATETIME NULL,
        created_at DATETIME DEFAULT GETUTCDATE(),
        updated_at DATETIME DEFAULT GETUTCDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_by) REFERENCES users(id) ON DELETE NO ACTION,
        FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE NO ACTION
      )
    `);

    console.log('✅ Tasks table created');

    // Create Comments table
    await connection.request().query(`
      CREATE TABLE comments (
        id INT PRIMARY KEY IDENTITY(1,1),
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        comment_text NVARCHAR(MAX) NOT NULL,
        created_at DATETIME DEFAULT GETUTCDATE(),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
      )
    `);

    console.log('✅ Comments table created');

    // Insert only admin user (no demo data)
    await connection.request().query(`
      INSERT INTO users (name, userId, password, role, department_id) VALUES
      ('Admin', 'admin', '$2a$10$YourHashedPasswordHere', 'admin', NULL)
    `);

    console.log('✅ Admin user created (username: admin)');

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
