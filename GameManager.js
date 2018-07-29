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
        utility.write(this.io,'Client '+socket.id+' added to GameManager, with token '+token);
        utility.saveuser(token,socket.id);

        socket.on('create',(userlist)=>{
            utility.write(this.io,'Client '+socket.id+' trying to create game with users:' + userlist);
            this.games[this.gameCounter] = new Game(this.gameCounter,this.io,userlist);
            var that = this;
            for(var i = 0; i < userlist.length; i++){
                utility.write(this.io,userlist[i]+' invited ');
                utility.getSocketId(userlist[i],function(socketid){
                    utility.write(that.io, "sending invite to "+socketid);
                    that.io.to(socketid).emit('invite', that.gameCounter);
                    that.io.to(socketid).emit('message', "invited you to "+that.gameCounter);
                    that.gameCounter++;

                })  
            }
        })
        socket.on('accept',(gameid)=>{
            if(gameid in this.games){
                utility.write(this.io,'Client '+socket.id+'accepts gameid '+gameid);
                this.games[gameid].addUser(socket);
            }
            else{
                utility.write(this.io,'gameid '+gameid+' does not exist in ' + this.games);
            }
        });
    }
}
module.exports = GameManager;
