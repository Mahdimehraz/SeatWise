const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         movie_id:
 *           type: integer
 *         showtime_id:
 *           type: integer
 *         number_of_tickets:
 *           type: integer
 *         total_amount:
 *           type: number
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - movie_id
 *         - showtime_id
 *         - number_of_tickets
 *       properties:
 *         movie_id:
 *           type: integer
 *         showtime_id:
 *           type: integer
 *         number_of_tickets:
 *           type: integer
 *           minimum: 1
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order (book tickets)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request (validation error, insufficient seats)
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, orderController.createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', authMiddleware, orderController.getOrderById);

/**
 * @swagger
 * /api/orders/user/my-orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/user/my-orders', authMiddleware, orderController.getUserOrders);

/**
 * @swagger
 * /api/orders/{id}/pay:
 *   post:
 *     summary: Process payment for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               payment_method:
 *                 type: string
 *                 example: "credit_card"
 *               payment_details:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Payment failed or order already paid
 *       404:
 *         description: Order not found
 */
router.post('/:id/pay', authMiddleware, orderController.processPayment);

module.exports = router;

