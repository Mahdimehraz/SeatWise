const { pool } = require('../config/database');

const getAllMovies = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, image_url, duration, created_at FROM movies ORDER BY id'
    );

    res.json({ movies: result.rows });
  } catch (error) {
    console.error('Get all movies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, title, description, image_url, duration, created_at FROM movies WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ movie: result.rows[0] });
  } catch (error) {
    console.error('Get movie by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMovieShowtimes = async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week } = req.query;

    // Verify movie exists
    const movieCheck = await pool.query('SELECT id FROM movies WHERE id = $1', [id]);
    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    let query = `
      SELECT 
        id,
        movie_id,
        day_of_week,
        start_time,
        end_time,
        total_seats,
        reserved_seats,
        (total_seats - reserved_seats) as available_seats
      FROM showtimes
      WHERE movie_id = $1
    `;
    const params = [id];

    if (day_of_week !== undefined) {
      query += ' AND day_of_week = $2';
      params.push(day_of_week);
    }

    query += ' ORDER BY day_of_week, start_time';

    const result = await pool.query(query, params);

    res.json({ showtimes: result.rows });
  } catch (error) {
    console.error('Get movie showtimes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateReservedSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const { reserved_seats } = req.body;

    if (reserved_seats === undefined || reserved_seats < 0) {
      return res.status(400).json({ error: 'reserved_seats must be a non-negative number' });
    }

    // Get current showtime
    const currentResult = await pool.query(
      'SELECT total_seats FROM showtimes WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    const totalSeats = currentResult.rows[0].total_seats;

    if (reserved_seats > totalSeats) {
      return res.status(400).json({ error: 'reserved_seats cannot exceed total_seats' });
    }

    // Update reserved seats
    const result = await pool.query(
      `UPDATE showtimes 
       SET reserved_seats = $1 
       WHERE id = $2 
       RETURNING id, movie_id, day_of_week, start_time, end_time, total_seats, reserved_seats, (total_seats - reserved_seats) as available_seats`,
      [reserved_seats, id]
    );

    res.json({
      message: 'Reserved seats updated successfully',
      showtime: result.rows[0],
    });
  } catch (error) {
    console.error('Update reserved seats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  getMovieShowtimes,
  updateReservedSeats,
};

