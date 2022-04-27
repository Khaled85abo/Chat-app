import { io } from "/socket.io/socket.io.esm.min.js";
let socket;

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
      const content = document.createElement("span");
      content.innerText = msg.content;
      li.appendChild(content);
      if (!msg.myMessage) {
        const user = document.createElement("span");
        user.classList.add("user-name");
        user.innerText = msg.user.nickname;
        li.appendChild(user);
      }
      if (msg.myMessage) {
        li.classList.add("right");
      }
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
  message.value = "";
});
