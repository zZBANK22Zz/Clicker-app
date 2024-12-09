const amqp = require('amqplib');

// Connect to RabbitMQ
async function connectRabbitMQ(rabbitMQUrl, queueName) {
  try {
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });

    console.log(`Connected to RabbitMQ, queue: ${queueName}`);
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

// Send message to RabbitMQ queue
function sendMessageToQueue(channel, queueName, message) {
  try {
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log('Message sent to queue:', message);
  } catch (error) {
    console.error('Failed to send message to queue:', error);
  }
}

// Consume messages from RabbitMQ queue
function consumeMessages(channel, queueName, callback) {
  channel.consume(
    queueName,
    (message) => {
      if (message) {
        const content = JSON.parse(message.content.toString());
        console.log('Received message:', content);
        callback(content); // Process the message
        channel.ack(message); // Acknowledge the message
      }
    },
    { noAck: false }
  );
}

module.exports = {
  connectRabbitMQ,
  sendMessageToQueue,
  consumeMessages,
};