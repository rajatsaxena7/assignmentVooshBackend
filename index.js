const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const chatRoutes = require("./src/routes/chat");
const { connect } = require("./src/redisClient");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT;

connect().then(() => {
  app.listen(PORT, () => console.log(`🚀 Backend running on {PORT}`));
});
