const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         image_url:
 *           type: string
 *         duration:
 *           type: integer
 *         created_at:
 *           type: string
 *     Showtime:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         movie_id:
 *           type: integer
 *         day_of_week:
 *           type: integer
 *           description: 0=Sunday, 1=Monday, ..., 6=Saturday
 *         start_time:
 *           type: string
 *         end_time:
 *           type: string
 *         total_seats:
 *           type: integer
 *         reserved_seats:
 *           type: integer
 *         available_seats:
 *           type: integer
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of all movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get('/', movieController.getAllMovies);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movie details
 *       404:
 *         description: Movie not found
 */
router.get('/:id', movieController.getMovieById);

/**
 * @swagger
 * /api/movies/{id}/showtimes:
 *   get:
 *     summary: Get showtimes for a movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: day_of_week
 *         schema:
 *           type: integer
 *         description: Filter by day of week (0-6)
 *     responses:
 *       200:
 *         description: List of showtimes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Showtime'
 */
router.get('/:id/showtimes', movieController.getMovieShowtimes);

module.exports = router;

