const mongoose = require("mongoose");

const connectToDataBase = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cursonodejs.nqgz2kf.mongodb.net/database?retryWrites=true&w=majority`
    );
    console.log("Conexão efetuada com sucesso!");
  } catch (error) {
    console.error("Ocorreu um erro ao realizar a conexão! Erro: ", error);
  }
};

module.exports = connectToDataBase;
