/*const express = require("express");
const amqp = require("amqplib/callback_api");
const NumberModel = require("../models/number.model");

const app = express();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "src/views");

app.use((req, res, next) => {
  console.log(`Request Type: ${req.method}`);
  console.log(`Content Type: ${req.headers["content-type"]}`);
  console.log(`Date: ${new Date()}`);

  next();
});

// Função para enviar mensagem para RabbitMQ
function sendToQueue(message) {
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      const exchange = "Soma"; // Nome da sua exchange

      channel.assertExchange(exchange, "direct", {
        durable: false,
      });

      channel.publish(exchange, "", Buffer.from(message));

      setTimeout(function () {
        connection.close();
      }, 500);
    });
  });
}

app.post("/calcularSoma", async (req, res) => {
  const num1 = parseFloat(req.body.num1);
  const num2 = parseFloat(req.body.num2);

  if (isNaN(num1) || isNaN(num2)) {
    return res
      .status(400)
      .json({ error: "Os valores fornecidos não são números válidos." });
  }

  const resultado = num1 + num2;

  const number = new NumberModel({
    Number_1: num1,
    Number_2: num2,
    Result: resultado,
  });

  try {
    const savedNumber = await number.save();

    // Envia o resultado para a exchange no RabbitMQ
    sendToQueue(JSON.stringify({ resultado, number: savedNumber }));

    res.json({ resultado, number: savedNumber });
  } catch (error) {
    console.error("Erro ao salvar no banco de dados:", error);
    res.status(500).send("Erro ao salvar no banco de dados");
  }
});

app.get("/views/numbers", async (req, res) => {
  const numbers = await NumberModel.find({});
  res.render("index", { numbers });
});

const port = 8080;
app.listen(port, () => console.log(`Rodando com express na porta ${port}!`));*/

const express = require("express");
const amqp = require("amqplib/callback_api");
const NumberModel = require("../models/number.model");

const app = express();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "src/views");

app.use((req, res, next) => {
  console.log(`Request Type: ${req.method}`);
  console.log(`Content Type: ${req.headers["content-type"]}`);
  console.log(`Date: ${new Date()}`);

  next();
});

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    var queue = "Fila-soma";

    channel.assertQueue(queue, {
      durable: true,
    });

    app.post("/calcularSoma", async (req, res) => {
      const num1 = parseFloat(req.body.num1);
      const num2 = parseFloat(req.body.num2);

      if (isNaN(num1) || isNaN(num2)) {
        return res
          .status(400)
          .json({ error: "Os valores fornecidos não são números válidos." });
      }

      const resultado = num1 + num2;

      const number = new NumberModel({
        Number_1: num1,
        Number_2: num2,
        Result: resultado,
      });

      try {
        const savedNumber = await number.save();

        // Envia o resultado para a fila 'hello' no RabbitMQ
        channel.sendToQueue(
          queue,
          Buffer.from(JSON.stringify({ resultado, number: savedNumber }))
        );

        res.json({ resultado, number: savedNumber });
      } catch (error) {
        console.error("Erro ao salvar no banco de dados:", error);
        res.status(500).send("Erro ao salvar no banco de dados");
      }
    });

    app.get("/views/numbers", async (req, res) => {
      const numbers = await NumberModel.find({});
      res.render("index", { numbers });
    });

    const port = 8080;
    app.listen(port, () =>
      console.log(`Rodando com express na porta ${port}!`)
    );
  });
});
