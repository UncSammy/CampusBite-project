const db = require('./config/db');

async function createUsersTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Users table created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Could not create users table:', error);
    process.exit(1);
  }
}

createUsersTable();