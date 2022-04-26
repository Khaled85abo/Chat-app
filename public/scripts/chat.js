import { io } from "/socket.io/socket.io.esm.min.js";
let socket;

console.log("from chat.js");
(function () {
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
})();

disconnect.addEventListener("click", () => {
  send.disabled = true;
  console.log("Logged out from chat!");
  socket.disconnect();
  window.location = "/";
});
send.addEventListener("click", () => {
  if (socket.connected) {
    socket.emit("message", message.value);
  }
});
