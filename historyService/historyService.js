const amqp = require("amqplib");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.HISTORY_SERVICE_PORT || 8081;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const RABBITMQ_QUEUE = "click_event";

let history = []; // Array สำหรับจัดเก็บข้อมูล history ที่มาจาก RabbitMQ

// เชื่อมต่อ RabbitMQ และดึงข้อความ
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });

    console.log("Connected to RabbitMQ in history service");

    // Consume messages from RabbitMQ
    channel.consume(
      RABBITMQ_QUEUE,
      (message) => {
        if (message) {
          const content = JSON.parse(message.content.toString());
          console.log("Received message from RabbitMQ:", content);
          history.push(content); // เพิ่มข้อความใหม่ไปยัง history array
          channel.ack(message); // Acknowledge the message
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error initializing RabbitMQ in history service:", error);
  }
}

// API Endpoint สำหรับแสดงผล history
app.get("/api/history", (req, res) => {
  console.log("Fetching history...");
  res.json(history);
});

// เริ่มต้น history service
app.listen(PORT, async () => {
  console.log(`History service running on port ${PORT}`);
  await connectRabbitMQ(); // เชื่อมต่อกับ RabbitMQ เมื่อเริ่มต้น service
});