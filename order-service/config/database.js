const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'order_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'bahareh1381',
});

const init = async () => {
  try {
    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        showtime_id INTEGER NOT NULL,
        number_of_tickets INTEGER NOT NULL CHECK (number_of_tickets > 0),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_movie_id ON orders(movie_id);
      CREATE INDEX IF NOT EXISTS idx_orders_showtime_id ON orders(showtime_id);
    `);

    console.log('Order database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  init,
};

