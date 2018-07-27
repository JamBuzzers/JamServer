var Game = require( './game.js');
var utility = require("./utility");

class GameManager{
    constructor(io) {
        this.io = io;
        this.counter = 0;
        this.games = {};
        this.gameCounter = 0;
    }
    addSocket(socket, token){
        console.log(token,socket.id);
        this.io.send('Client '+socket.id+' added to GameManager, with token '+token);
        utility.saveuser(token,socket.id);

        socket.on('create',(userlist)=>{
            this.io.send('Client '+socket.id+' trying to create game with users:' + userlist);
            this.games[this.gameCounter] = new Game(this.gameCounter,io,userlist);
            for(i = 0; i < userlist.length; i++){
                this.io.send(userlist[i]+' invited ');
                utility.getSocketId(userlist[i],function(socketid){
                    this.io.to(socketid).emit('invite', this.gameCounter);
                })  
            }
            this.gameCounter++;
        })
        socket.on('accept',(gameid)=>{
            if(gameid in games){
                this.io.send('Client '+socket.id+'accepts gameid '+gameid);
                game[gameid].addUser(socket);
            }
        })
    }


}
module.exports = GameManager;
