const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const userController = require("./controller/User.controller");
const messageController = require("./controller/Message.Controller");
const User = require("./model/User.model");
const Message = require("./model/Message.model");

const PORT = 8080;

app.use(express.json());
app.use(cors());
app.use("/api", userController);
app.use("/api", messageController);

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

  socket.on("sendMessage", async ({ toUserName, message, fromUserName, timestamp }) => {
    try {
      const recipient = await User.findOne({ name: toUserName });
      // console.log("recipent", recipient);
      if (recipient && recipient.socketId) {
        io.to(recipient.socketId).emit("receiveMessage", {
          message,
          fromUserName,
          toUserName,
          timestamp
        });

        // Store the message in MongoDB
        await Message.create({
          from: fromUserName,
          to: toUserName,
          message,
        });

        // console.log(`Message sent from ${socket.id} to ${recipient.socketId}`);
      } else {
        // console.log("Recipient not found");
        await Message.create({
          from: fromUserName,
          to: toUserName,
          message,
        });
      }
    } catch (err) {
      console.error("Error sending private message:", err);
    }
  });

  socket.on("newUserRegistered", () => {
    // console.log("newUserRegistered");
    io.emit("newConnected");
  });

  socket.on("typing",({to, socketId, from})=>{
    console.log(from, "User is typing", to, socketId )
    socket.to(socketId).emit("userTyping")
  })

  socket.on('stopTyping', ({to, socketId, from}) => {
    socket.to(socketId).emit('userStoppedTyping');
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    try {
      await User.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: null, isOn: false }, // Set socketId to null and isOn to false
        { new: true } 
      );

      io.emit("UserDisconnected",{socketId: socket.id})
      // console.log("Socket ID removed from user in database");
    } catch (error) {
      console.error("Error removing socketId from user:", error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`SERVER is running on PORT ${PORT}`);
});
