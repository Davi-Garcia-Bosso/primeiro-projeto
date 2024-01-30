const amqp = require("amqplib");

async function consumeMessages() {
  // Conectar ao servidor RabbitMQ
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  // Nome da fila que o consumidor irá escutar
  const queueName = "Fila-soma";

  // Declarar a fila com as configurações atuais
  await channel.assertQueue(queueName, { durable: true });

  console.log(
    ` [*] Aguardando mensagens em ${queueName}. Para sair, pressione CTRL+C`
  );

  // Configurar o consumidor
  channel.consume(
    queueName,
    (msg) => {
      const message = msg.content.toString();
      console.log(` [x] Recebido: ${message}`);
    },
    { noAck: true }
  );
}

// Iniciar o consumo de mensagens
consumeMessages().catch(console.error);
