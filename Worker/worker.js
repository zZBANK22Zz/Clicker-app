const amqp = require('amqplib');
const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './data/clicks.db'; // Database path

const decrementQueue = 'decrement_task_queue';

(async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(decrementQueue, { durable: true });

    console.log('Worker connected to RabbitMQ and waiting for tasks...');

    channel.consume(decrementQueue, async (message) => {
      if (message) {
        const task = JSON.parse(message.content.toString());
        console.log('Received task:', task);

        const db = new sqlite3.Database(DB_PATH);

        const decreaseContinuously = (currentValue) => {
          if (currentValue > 0) {
            const newValue = currentValue - 1;

            db.run(
              `UPDATE clicks SET count = ? WHERE id = (SELECT id FROM clicks ORDER BY id DESC LIMIT 1)`,
              [newValue],
              (err) => {
                if (err) {
                  console.error('Error updating count in database:', err);
                } else {
                  console.log(`Count updated to ${newValue}`);
                  setTimeout(() => decreaseContinuously(newValue), 1000); // ลดค่าทุก 1 วินาที
                }
              }
            );
          } else {
            console.log('Value has reached zero.');
            channel.ack(message); // Acknowledge task completion
          }
        };

        // เริ่มลดค่าต่อเนื่อง
        db.get('SELECT count FROM clicks ORDER BY id DESC LIMIT 1', (err, row) => {
          if (err) {
            console.error('Error fetching current count:', err);
            channel.ack(message); // Acknowledge even if there's an error
          } else if (row) {
            decreaseContinuously(row.count);
          }
        });
      }
    });
  } catch (error) {
    console.error('Error connecting to RabbitMQ in worker:', error);
  }
})();