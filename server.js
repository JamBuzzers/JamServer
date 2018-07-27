'use strict';


const GameManager = require('./GameManager');
const express = require('express');
const socketIO = require('socket.io');
const request = require('request');
const path = require('path');
var distance = require("./distance.js");


const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);



const manager = new GameManager(io);

io.on('connection', (socket) => {
  console.log('Client '+socket.id+' connected');

  socket.on('login', (token)=>{
    manager.addSocket(socket, token);
  });
  socket.on('disconnect', () => console.log('Client '+socket.id+' disconnected'));

});

