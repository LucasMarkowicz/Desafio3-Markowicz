const mongoose = require("mongoose");

const userCollection = "user";

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  associatedCart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cart",
  },
});

userSchema.pre("findOne", function (next) {
  this.populate("associatedCart");
  next();
});

const User = mongoose.model(userCollection, userSchema);

module.exports = User;
