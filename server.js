'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);


const clients = [];
var games = [];
var user_to_game = {};
var username = {};

io.on('connection', (socket) => {
  console.log('Client '+socket.id+' connected');
  clients.push(socket.id);

  socket.on('join',(name) =>{
    socket.join(name);
    user_to_game[socket.id] = name;
    socket.send('in room '+ name);
  });

  socket.on('send clients',()=>{
    socket.send(clients)
  });

  socket.on('set username', (name)=>{
    username[name] = socket.id;
    console.log(username);
  });

  socket.on('test1',()=>{
    console.log('test1');
  });    

  socket.on('invite', (name)=>{
    socket.to(username[name]).emit('invite');
  });

  socket.on('play', ()=>{
    io.to(user_to_game[socket.id]).emit('play');
    console.log('playing on '+user_to_game[socket.id]); 
  });
  socket.on('resume', ()=>{
    io.to(user_to_game[socket.id]).emit('resume');
    console.log('resuming on '+user_to_game[socket.id]); 
  });
  socket.on('pause', ()=>{
    io.to(user_to_game[socket.id]).emit('pause');
    console.log('pausing on '+user_to_game[socket.id]); 
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});
io.on('test',()=>{
  console.log('test');
});

io.on('clear_users', () => {
  console.log('Cleared');
  console.log(clients);
  clients.length = 0;
  console.log(clients);
});
