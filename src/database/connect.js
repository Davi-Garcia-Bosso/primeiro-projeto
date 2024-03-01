const mongoose = require("mongoose");

const connectToDataBase = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cursonodejs.nqgz2kf.mongodb.net/database?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    // Verifica o status da conexão
    if (mongoose.connection.readyState === 1) {
      console.log("Conexão efetuada com sucesso!");
    } else {
      console.error(
        "A conexão não foi bem-sucedida. Estado da conexão:",
        mongoose.connection.readyState
      );
    }
  } catch (error) {
    console.error("Ocorreu um erro ao realizar a conexão! Erro: ", error);
    throw error; // Lança o erro novamente para que chamadores possam tratá-lo
  }
};

module.exports = connectToDataBase;
