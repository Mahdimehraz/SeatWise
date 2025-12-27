require('dotenv').config();
const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'payment-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      if (event.eventType === 'PAYMENT_COMPLETED') {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: event.email,
          subject: 'Payment Successful',
          text: `Your payment for order ${event.orderId} was successful. Amount: ${event.amount}`
        });
        console.log('Email sent to', event.email);
      }
    }
  });

  console.log('Notification service listening for events...');
})();
