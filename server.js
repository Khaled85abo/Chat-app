const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connect = require("./db/connection");
const Message = require("./db/models/messages");
const User = require("./db/models/users");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
  console.log("connected!");
  const user = ValidateToken(socket.handshake.headers.cookie);
  const messages = await mergeMsgUser();

  socket.emit("messages", messages);
  socket.data.messages = [];
  socket.emit("activate", "Activated chat!");
  socket.on("message", async (message) => {
    const user = ValidateToken(socket.handshake.headers.cookie);
    socket.data.messages.push(message);
    await Message.create({
      content: message,
      user: user,
    });
    const messages = await mergeMsgUser();
    socket.emit("messages", messages);
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

const mergeMsgUser = async () => {
  const arr = [];
  const messages = await Message.find({});

  for (let message of messages) {
    const user = await User.find({ _id: message.user });
    const newMsg = { ...message._doc, user };
    arr.push(newMsg);
  }
  return arr;
};
const ValidateToken = (SocketCookies) => {
  const cookies = SocketCookies.split(";");
  const TokenCookie = cookies.find((cookie) => cookie.includes("token"));
  const tokenArr = TokenCookie.split("=");
  const token = tokenArr[1];
  const user = jwt.verify(token, process.env.TOKEN_SECRET);
  return user;
};
const createToken = (data) => {
  const { email, nickname, _id } = data;
  return jwt.sign({ email, nickname, _id }, process.env.TOKEN_SECRET, {
    expiresIn: "1w",
  });
};

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/sendlogin", async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);

  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    const match = bcrypt.compareSync(req.body.password, user.password);
    if (match) {
      const token = createToken(user);
      req.token = token;
      res.cookie("token", token).redirect("/chat");
    } else {
      throw new Error("Wrong password!");
    }
  } catch (error) {
    console.log("Error creating User: ", error);
  }
});
app.post("/sendsignup", async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  try {
    const user = await User.create({
      name: req.body.name,
      nickname: req.body.nickname,
      password: hash,
      email: req.body.email,
    });
    const token = createToken(user);
    res.cookie("token", token).redirect("/chat");
  } catch (error) {
    console.log("Error creating User: ", error);
  }
});

app.get("/chat", (req, res) => {
  res.render("chat", { token: req.token });
});

connect();
server.listen(5500, console.log("server running om port 5500"));
