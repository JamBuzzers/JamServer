var Game = require( './game.js');
var utility = require("./utility");

class GameManager{
    constructor(io) {
        this.io = io;
    }
    addSocket(socket, token){
        console.log(token,socket.id);
        utility.saveuser(token,socket.id);
        socket.on('create',(userlist)=>{

        })
        socket.on('accept',(userlist)=>{

        })
    }

}
module.exports = GameManager;
