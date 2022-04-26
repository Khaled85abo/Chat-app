

import {io} from '/socket.io/socket.io.esm.min.js'
let socket;

connect.addEventListener('click', () =>{
     socket = io()
     socket.on('activate', (message) => {
         send.disabled = false
        console.log(message);
    })
})
disconnect.addEventListener('click', () =>{
    socket = null;
    send.disabled = true
    console.log('Logged out from chat!');
})
send.addEventListener('click', () =>{
    socket.emit('message', message.value)
    const li = document.createElement('li')
    li.innerText = message.value
    ul.appendChild(li)
})

if(socket){
    socket.on('messages', (messages) =>{
        console.log(messages)
    })

}