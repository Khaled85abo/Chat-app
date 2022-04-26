const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
// app.set("view engine", "ejs");
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server);

server.listen(5500, console.log("server running om port 5500"));
