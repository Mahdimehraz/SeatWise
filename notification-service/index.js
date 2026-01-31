require("dotenv").config();
const { Kafka } = require("kafkajs");
const nodemailer = require("nodemailer");

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "notification-group" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "payment-events", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      if (event.eventType === "PAYMENT_COMPLETED") {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: event.email,
          subject: "پرداخت با موفقیت انجام شد ✅",
          text: `
        سلام
        
        پرداخت سفارش شما با موفقیت انجام شد.
        
        🧾 شماره سفارش: ${event.orderId}
        💰 مبلغ پرداختی: ${event.amount}
        
        از خرید شما متشکریم 🙏
        در صورت داشتن هرگونه سوال، پشتیبانی ما همیشه در کنار شماست.
        
        با احترام  
        تیم پشتیبانی
        `,
        });
      }
    },
  });

  console.log("Notification service listening for events...");
})();
