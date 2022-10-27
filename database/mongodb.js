const mongoose = require("mongoose");
const mongoHost = process.env.MONGO_CONNECTION_STRING;
// const Task = require("../src/models/taskModel"); //created model loading here

mongoose.Promise = global.Promise;

try {
  mongoose.connect(
    mongoHost,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    },
    () => {
      console.log("Database MongoDB Connected...");
    }
  );
} catch (err) {
  console.log("MongoDB: " + err);
}

module.exports = mongoose;
