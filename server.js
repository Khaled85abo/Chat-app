const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connect = require("./db/connection");
const Message = require("./db/models/messages");
const app = express();
// app.set("view engine", "ejs");
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
  console.log("connected!");
  const messages = await Message.find({});
  console.log(messages);
  socket.emit("messages", messages);
  socket.data.messages = [];
  socket.emit("activate", "Activated chat!");
  socket.on("message", async (message) => {
    socket.data.messages.push(message);
    await Message.create({
      content: message,
    });
    console.log(socket.data.messages);
    const messages = await Message.find({});
    console.log(messages);
    socket.emit("messages", messages);
  });
});

connect();
server.listen(5500, console.log("server running om port 5500"));
