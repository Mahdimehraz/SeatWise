const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'product_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'bahareh1381',
});

const init = async () => {
  try {
    // Create movies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create showtimes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS showtimes (
        id SERIAL PRIMARY KEY,
        movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        total_seats INTEGER NOT NULL DEFAULT 50,
        reserved_seats INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(movie_id, day_of_week, start_time)
      )
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_showtimes_movie_id ON showtimes(movie_id);
      CREATE INDEX IF NOT EXISTS idx_showtimes_day ON showtimes(day_of_week);
    `);

    // Seed static data
    await seedData();

    console.log('Product database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const seedData = async () => {
  try {
    // Check if data already exists
    const movieCount = await pool.query('SELECT COUNT(*) FROM movies');
    if (parseInt(movieCount.rows[0].count) > 0) {
      console.log('Data already seeded, skipping...');
      return;
    }

    // Insert 3 movies
    const movies = [
      {
        title: 'تلقین',
        description: 'فیلم علمی تخیلی اکشن درباره سارق ماهری که با ورود به رویاهای دیگران برای سرقت و دستکاری اطلاعات، مأموریتی پیچیده و خطرناک را بر عهده می‌گیرد.',
        image_url: 'https://assets.myket.ir/movies/ports/original/af8bd453-cf61-4b94-bd48-52b0889111b2.jpg',
        duration: 148,
      },
      {
        title: 'میان‌ستاره‌ای',
        description: 'فیلم ماجراجویانه علمی تخیلی درباره گروهی از فضانوردان که از طریق کرم‌چاله‌ای سفر می‌کنند تا برای بقای بشریت سیاره‌ای قابل سکونت بیابند.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
        duration: 169,
      },
      {
        title: 'دزدان دریای کارائیب',
        description: 'فیلم ماجراجویانه فانتزی درباره ناخدا جک اسپارو و آهنگری جوان که با هم برای مقابله با خدمه نفرین‌شده کشتی دست به ماجراجویی می‌زنند.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BMTYyMTcxNzc5M15BMl5BanBnXkFtZTgwOTg2ODE2MTI@._V1_FMjpg_UX1000_.jpg',
        duration: 143,
      },
    ];

    for (const movie of movies) {
      const result = await pool.query(
        `INSERT INTO movies (title, description, image_url, duration)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [movie.title, movie.description, movie.image_url, movie.duration]
      );

      const movieId = result.rows[0].id;

      // Insert showtimes for each day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
      // 3 showtimes: 2-4, 4-6, 6-8
      const showtimes = [
        { start: '14:00', end: '16:00' }, // 2-4 PM
        { start: '16:00', end: '18:00' }, // 4-6 PM
        { start: '18:00', end: '20:00' }, // 6-8 PM
      ];

      // Add showtimes for all 7 days
      for (let day = 0; day < 7; day++) {
        for (const showtime of showtimes) {
          await pool.query(
            `INSERT INTO showtimes (movie_id, day_of_week, start_time, end_time, total_seats, reserved_seats)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [movieId, day, showtime.start, showtime.end, 50, 0]
          );
        }
      }
    }

    console.log('Static data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = {
  pool,
  init,
};

