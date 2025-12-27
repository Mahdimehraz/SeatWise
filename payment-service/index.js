require('dotenv').config();
const express = require('express');
const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const kafka = new Kafka({
  clientId: 'payment-service',
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

(async () => await producer.connect())();

app.post('/payments/process', async (req, res) => {
  const { orderId, amount, email } = req.body;
  const paymentId = uuidv4();

  const event = {
    eventType: 'PAYMENT_COMPLETED',
    paymentId,
    orderId,
    amount,
    email,
    timestamp: new Date().toISOString()
  };

  await producer.send({
    topic: 'payment-events',
    messages: [{ value: JSON.stringify(event) }]
  });

  res.json({ message: 'Payment processed', paymentId, status: 'PAID' });
});

app.listen(process.env.PORT, () => {
  console.log(`Payment service running on port ${process.env.PORT}`);
});
