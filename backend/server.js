const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messsageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();
connectDB();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/api/test", (req, res) => {
  res.send("API");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messsageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

//----------------------Deployment---------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV == 'production') {
//     // console.log("Serving frontend static files...");
//     const buildPath = path.join(__dirname1, "frontend", "build");
//     console.log("Frontend build path:", buildPath);
//     app.use(express.static(buildPath));

//     // app.use(express.static());
//     // console.log("Serving frontend static files...");

//     app.get('*', (req, res) => {
//         // console.log("Sending index.html");
//         res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
//     });
// } else {
//     app.get('/', (req, res) => {
//         res.send("API is running");
//         // console.log("Serving frontend files...");
//     });
// }

//----------------------Deployment---------------------

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server started successfully on PORT ${PORT}`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
});
