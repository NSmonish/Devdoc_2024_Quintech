const mongoose = require("mongoose");

const connect = mongoose.connect(
  "mongodb+srv://admin:pass@backenddb.jvqbif8.mongodb.net/?retryWrites=true&w=majority&appName=Backenddb"
);

connect
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model("User", LoginSchema);

module.exports = UserModel;
