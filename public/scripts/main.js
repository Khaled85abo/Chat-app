import { io } from "/socket.io/socket.io.esm.min.js";
let socket;

connect.addEventListener("click", () => {
  socket = io();
  socket.on("activate", (message) => {
    send.disabled = false;
    console.log(message);
  });
  socket.on("messages", (messages) => {
    console.log(messages);
    ul.innerHTML = "";
    for (let msg of messages) {
      const li = document.createElement("li");
      li.innerText = msg.content;
      ul.appendChild(li);
    }
  });
});

disconnect.addEventListener("click", () => {
  socket = null;
  send.disabled = true;
  console.log("Logged out from chat!");
});
send.addEventListener("click", () => {
  socket.emit("message", message.value);
});
