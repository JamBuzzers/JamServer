'use strict';


const GameManager = require('./GameManager');
const utility = require('./utility');
const express = require('express');
const socketIO = require('socket.io');
const request = require('request');
const path = require('path');


const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);



const manager = new GameManager(io);

io.on('connection', (socket) => {
  utility.write(io,'Client '+socket.id+' connected');
  socket.on('login', (token)=>{
    utility.write(io, 'Client '+socket.id+' login');
    manager.addSocket(socket, token);
  });
  socket.on('disconnect', () => {
    utility.write(io,'Client '+socket.id+' disconnected');
    utility.logout(socket.id);
  });

});

