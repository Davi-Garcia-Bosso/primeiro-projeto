const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
