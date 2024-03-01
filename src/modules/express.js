const express = require("express");
const path = require("path");
const amqp = require("amqplib/callback_api");
const NumberModel = require("../models/number.model");

const app = express();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use((req, res, next) => {
  console.log(`Request Type: ${req.method}`);
  console.log(`Content Type: ${req.headers["content-type"]}`);
  console.log(`Date: ${new Date()}`);

  next();
});

app.route("/getResult/:id").get(async (req, res) => {
  const id = req.params.id;
  console.log("ID recebido:", id);

  try {
    const number = await NumberModel.findById(id);

    if (number && number.Status === "done") {
      res.json({
        Status: number.Status,
        Result: number.Result,
      });
    } else {
      res
        .status(404)
        .json({ error: "Número não encontrado ou status não concluído" });
    }
  } catch (error) {
    console.error("Erro ao obter o resultado:", error);
    res.status(500).json({ error: "Erro ao obter o resultado" });
  }
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
    Status: "pending", // Definir o status como "pending" inicialmente
  });

  try {
    const savedNumber = await number.save();

    // Envia o resultado para a exchange no RabbitMQ
    sendToQueue(JSON.stringify({ resultado, number: savedNumber }));

    // Retorna uma resposta indicando que a operação está "pendente"
    res.json({
      status: "pending",
      _id: savedNumber._id,
      resultado,
      number: savedNumber,
    });
  } catch (error) {
    console.error("Erro ao salvar no banco de dados:", error);
    res.status(500).send("Erro ao salvar no banco de dados");
  }
});

// Modificações na rota /atualizarStatus

app.get("/numbers", async (req, res) => {
  const numbers = await NumberModel.find({});
  res.render("index", { numbers });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.ejs"));
});

// Adicione a rota estática para servir arquivos estáticos (vistas e recursos públicos)
app.use(express.static(path.join(__dirname, "../views")));

const port = 8080;
app.listen(port, () => console.log(`Rodando com express na porta ${port}!`));

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
