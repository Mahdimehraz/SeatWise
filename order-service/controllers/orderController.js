const axios = require('axios');
const { pool } = require('../config/database');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const TICKET_PRICE = 50000; // Price per ticket (50,000 تومان)

const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userId = req.user.userId;
    const { movie_id, showtime_id, number_of_tickets } = req.body;

    // Validation
    if (!movie_id || !showtime_id || !number_of_tickets) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'movie_id, showtime_id, and number_of_tickets are required' });
    }

    if (number_of_tickets <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'number_of_tickets must be greater than 0' });
    }

    // Check showtime availability from Product Service
    try {
      const showtimeResponse = await axios.get(
        `${PRODUCT_SERVICE_URL}/api/movies/${movie_id}/showtimes`
      );

      const showtimes = showtimeResponse.data.showtimes;
      const showtime = showtimes.find(s => s.id === parseInt(showtime_id));

      if (!showtime) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Showtime not found' });
      }

      const availableSeats = showtime.total_seats - showtime.reserved_seats;

      if (number_of_tickets > availableSeats) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Insufficient seats. Available: ${availableSeats}, Requested: ${number_of_tickets}`,
        });
      }

      // فقط چک می‌کنیم که صندلی کافی باشد
      // صندلی‌ها فقط بعد از پرداخت موفق کم می‌شوند

      // Create order
      const totalAmount = number_of_tickets * TICKET_PRICE;
      const result = await client.query(
        `INSERT INTO orders (user_id, movie_id, showtime_id, number_of_tickets, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, movie_id, showtime_id, number_of_tickets, totalAmount, 'pending']
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        order: result.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.response) {
        return res.status(error.response.status).json({ error: error.response.data.error || 'Product service error' });
      }
      throw error;
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // Fetch showtime details for each order
    const ordersWithShowtime = await Promise.all(
      result.rows.map(async (order) => {
        try {
          const showtimeResponse = await axios.get(
            `${PRODUCT_SERVICE_URL}/api/movies/${order.movie_id}/showtimes`
          );
          const showtimes = showtimeResponse.data.showtimes;
          const showtime = showtimes.find(s => s.id === parseInt(order.showtime_id));
          
          if (showtime) {
            return {
              ...order,
              showtime: {
                day_of_week: showtime.day_of_week,
                start_time: showtime.start_time,
                end_time: showtime.end_time,
              },
            };
          }
          return order;
        } catch (error) {
          console.error(`Error fetching showtime for order ${order.id}:`, error);
          return order;
        }
      })
    );

    res.json({ orders: ordersWithShowtime });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const processPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const userId = req.user.userId;
    const { payment_method, payment_details } = req.body;

    // Get order
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check if order is already paid
    if (order.status === 'paid') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Order is already paid' });
    }

    // Check if order is cancelled
    if (order.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Order is cancelled' });
    }

    // TODO: Integrate with actual payment service
    // For now, simulate payment processing
    // In production, you would call the payment service API here
    // Example:
    // const paymentResult = await axios.post('PAYMENT_SERVICE_URL', {
    //   order_id: order.id,
    //   amount: order.total_amount,
    //   payment_method,
    //   payment_details
    // });

    // Simulate payment success/failure (80% success rate for demo)
    const paymentSuccess = Math.random() > 0.2;
    
    if (paymentSuccess) {
      // Get showtime info to update reserved seats
      try {
        const showtimeResponse = await axios.get(
          `${PRODUCT_SERVICE_URL}/api/movies/${order.movie_id}/showtimes`
        );
        const showtimes = showtimeResponse.data.showtimes;
        const showtime = showtimes.find(s => s.id === parseInt(order.showtime_id));

        if (showtime) {
          // Update reserved seats in Product Service (only after successful payment)
          const newReservedSeats = showtime.reserved_seats + order.number_of_tickets;
          await axios.patch(
            `${PRODUCT_SERVICE_URL}/api/showtimes/${order.showtime_id}/reserve`,
            { reserved_seats: newReservedSeats }
          );
        }
      } catch (error) {
        console.error('Error updating showtime seats:', error);
        // Continue with payment even if showtime update fails
      }

      // Update order status to paid
      const updateResult = await client.query(
        `UPDATE orders 
         SET status = 'paid', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Payment processed successfully',
        order: updateResult.rows[0],
        payment_status: 'success',
        transaction_id: `TXN-${Date.now()}-${id}`,
      });
    } else {
      // Payment failed
      await client.query('ROLLBACK');

      res.status(400).json({
        error: 'Payment failed',
        payment_status: 'failed',
        message: 'Payment could not be processed. Please try again.',
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  processPayment,
};

