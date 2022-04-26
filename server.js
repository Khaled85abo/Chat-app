const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
// app.set("view engine", "ejs");
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) =>{
    console.log("connected!")
    socket.data.messages = []
    socket.emit('activate', 'Activated chat!')
    socket.on('message', (message) => {
        socket.data.messages.push(message)
        socket.emit('messages', socket.data.messages)
    })
})


server.listen(5500, console.log("server running om port 5500"));
