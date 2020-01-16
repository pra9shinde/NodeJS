const express = require('express');
const app = express();

const server = app.listen(3000);
const io = require('socket.io')(server);

const users = {};


io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected',name);
  });
  
  //socket.emit('chat-message', 'Hello World!!'); message will be sent to users on connection
  socket.on('send-chat-message', message => {
    // console.log(message);
    socket.broadcast.emit('chat-message',{ message: message, name: users[socket.id] } );
  });
});