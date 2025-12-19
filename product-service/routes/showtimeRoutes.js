const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

/**
 * @swagger
 * /api/showtimes/{id}/reserve:
 *   patch:
 *     summary: Update reserved seats for a showtime
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reserved_seats
 *             properties:
 *               reserved_seats:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Showtime updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Showtime not found
 */
router.patch('/showtimes/:id/reserve', movieController.updateReservedSeats);

module.exports = router;

