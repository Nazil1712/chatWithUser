const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const userController = require("./controller/User.controller");
const User = require("./model/User.model")
const Message = require("./model/Message.model")

const PORT = 8080;

app.use(express.json());
app.use(cors());
app.use("/api", userController);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

main().catch((error) => {
  console.log(error);
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/chatWithUser");
  console.log("Datbase connected");
}


io.on("connection", (socket) => {
  // console.log("SOCKET connnected",socket)

  socket.on("sendMessage", async({ toUserName, message, fromUserName }) => {
    try {
      const recipient = await User.findOne({ name: toUserName });
      if (recipient && recipient.socketId) {
        io.to(recipient.socketId).emit('receiveMessage', { message });

        // Store the message in MongoDB
        await Message.create({
          from: fromUserName,
          to: toUserName,
          message,
        });

        console.log(`Message sent from ${socket.id} to ${recipient.socketId}`);
      } else {
        console.log('Recipient not found');
      }
    } catch (err) {
      console.error('Error sending private message:', err);
    }
  });

  socket.on("newUserRegistered", () => {
    console.log("newUserRegistered");
    io.emit("newConnected");
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    try {
      await User.findOneAndUpdate(
        { socketId: socket.id },
        { $unset: { socketId: 1 } } 
      );
      console.log("Socket ID removed from user in database");
    } catch (error) {
      console.error("Error removing socketId from user:", error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`SERVER is running on PORT ${PORT}`);
});
