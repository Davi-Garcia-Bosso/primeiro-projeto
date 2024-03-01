const { connect } = require("amqplib");
const NumberModel = require("../src/models/number.model");

async function startConsumer() {
  try {
    const connection = await connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "Fila-soma";
    channel.assertQueue(queue, { durable: true });

    console.log("Consumer está esperando por mensagens...");

    channel.consume(
      queue,
      async function (msg) {
        try {
          const data = JSON.parse(msg.content.toString());

          // Verificar mensagem
          if (!data || !data.number) {
            console.error("Mensagem malformada:", msg.content.toString());
            channel.reject(msg, false);
            return;
          }

          // Realizar o cálculo
          const resultado = data.number.Number_1 + data.number.Number_2;

          // Atualizar o status para "done" e definir o resultado
          NumberModel.findOneAndUpdate(
            { _id: data.number._id },
            { $set: { Status: "done", Result: resultado } },
            { new: true, maxTimeMS: 10000 }
          )
            .then((updatedNumber) => {
              if (!updatedNumber) {
                console.error("Número não encontrado");
                // Enviar uma resposta de erro ao rejeitar a mensagem
                channel.reject(msg, false, {
                  requeue: false,
                  reason: "Número não encontrado",
                });
                return;
              }

              console.log("Resultado:", resultado);

              // Acknowledge da mensagem
              channel.ack(msg);
            })
            .catch((error) => {
              console.error("Erro durante a atualização:", error);
              // Enviar uma resposta de erro ao rejeitar a mensagem
              channel.reject(msg, false);
            });
        } catch (error) {
          console.error("Erro durante o processamento da mensagem:", error);
          // Enviar uma resposta de erro ao rejeitar a mensagem
          channel.reject(msg, false);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error("Erro durante a inicialização do consumidor:", error);
  }
}

startConsumer(); // Iniciar o consumidor
