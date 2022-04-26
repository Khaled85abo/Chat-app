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
  const messages = await Message.find({});
  socket.emit("messages", messages);
  socket.data.messages = [];
  socket.emit("activate", "Activated chat!");
  socket.on("message", async (message) => {
    socket.data.messages.push(message);
    await Message.create({
      content: message,
    });
    const messages = await Message.find({});
    socket.emit("messages", messages);
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

const createToken = (data) => {
  const { email, nickname, _id } = data;
  console.log("data in create token: ", data);
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
  try {
    const user = await User.find({
      email: req.body.email,
    });
    const passwordMatch = await bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (passwordMatch) {
      const token = createToken(user);
      console.log(token);

      req.token = token;
      res.redirect("/chat");
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
    delete user.password;
    const token = createToken(user);
    console.log(token);

    req.token = token;
    res.redirect("/chat");
  } catch (error) {
    console.log("Error creating User: ", error);
  }
});

app.get("/chat", (req, res) => {
  res.render("chat", { token: req.token });
});

connect();
server.listen(5500, console.log("server running om port 5500"));
