const mongoose = require("mongoose");

const numberSchema = new mongoose.Schema({
  Number_1: {
    type: Number,
    required: true,
  },
  Number_2: {
    type: Number,
    required: true,
  },
  Result: {
    type: Number,
    required: true,
  },
});

const NumberModel = mongoose.model("Somatory", numberSchema);

module.exports = NumberModel;
