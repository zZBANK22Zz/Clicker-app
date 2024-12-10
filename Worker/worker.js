const amqp = require('amqplib');
const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './data/clicks.db';

const decrementQueue = 'decrement_task_queue';

(async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(decrementQueue, { durable: true });

    console.log('Worker connected to RabbitMQ and waiting for tasks...');

    const activeTasks = {}; // เก็บสถานะ active ของแต่ละ ID

    channel.consume(decrementQueue, async (message) => {
      if (message) {
        const task = JSON.parse(message.content.toString());
        console.log('Received task:', task);

        const db = new sqlite3.Database(DB_PATH);

        // Handle StopDecrease Event
        if (task.eventType === 'StopDecrease') {
          activeTasks[task.id] = false; // ตั้งสถานะหยุดการทำงาน
          console.log(`Stop decrement task received for ID: ${task.id}`);
          channel.ack(message); // Acknowledge the message
          return;
        }

        // Handle Decrease Event
        if (task.eventType === 'Decrease') {
          const decreaseContinuously = (currentValue, id) => {
            if (currentValue > 0 && activeTasks[id] !== false) {
              const newValue = currentValue - 1;

              db.run(
                `UPDATE clicks SET count = ? WHERE id = ?`,
                [newValue, id],
                (err) => {
                  if (err) {
                    console.error('Error updating count in database:', err);
                  } else {
                    console.log(`Count updated to ${newValue} for ID: ${id}`);
                  }
                }
              );

              // ลดค่าต่อเนื่องถ้า Task ยังไม่ถูกหยุด
              setTimeout(() => decreaseContinuously(newValue, id), 1000);
            } else {
              // หยุดการทำงานเมื่อ activeTasks[id] === false
              console.log(`Decrement stopped for ID: ${id}`);
              channel.ack(message); // Acknowledge task completion
            }
          };

          // เริ่มลดค่าเฉพาะ ID ที่ยัง active อยู่
          db.get('SELECT count FROM clicks WHERE id = ?', [task.id], (err, row) => {
            if (err) {
              console.error('Error fetching current count:', err);
              channel.ack(message); // Acknowledge even if there's an error
            } else if (row) {
              activeTasks[task.id] = true; // ตั้งค่า active สำหรับ ID
              decreaseContinuously(row.count, task.id);
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('Error connecting to RabbitMQ in worker:', error);
  }
})();