const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");

const app = express();
dotenv.config();
connectDB();

app.get('/', (req,res) => {
    res.send("API is running");
});

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started successfully on PORT ${PORT}`.yellow.bold));