import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { NotFound } from "./middleware/error.middleware.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import { createServer } from "http";
import notificationRouter from "./routes/notificationRoutes.js";
import path from "path";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB();

app.use("/api/user", userRouter);

app.use("/api/chat", chatRouter);

app.use("/api/message", messageRouter);

app.use("/api/notifications", notificationRouter);

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();

  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html")),
  );
}

app.use(NotFound);

io.on("connection", (socket) => {
  console.log("Connected to Socket.io");

  socket.on("Setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("Join Chat", (room) => {
    socket.join(room);
    console.log("Joined Room", room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("New Message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat users not defined");

    chat.users.forEach((u) => {
      if (u._id === newMessageRecieved.senderName._id) return;
      socket.in(u._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("Setup", () => {
    console.log("DISCONNECTED");
    socket.leave(userData._id);
  });
});

httpServer.listen(PORT, () => {
  console.log("Server started at PORT 5000");
});
