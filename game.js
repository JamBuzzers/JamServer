
var utility = require("./utility.js");
var distance = require("./distance");
class Game {
  constructor(name,io, invitees) {
    utility.write(io,'Game '+name+' is being made');

    this.invitees = {};

    var that = this;
    for(var i = 0; i < invitees.length; i++)
    {
      utility.getSocketId(invitees[i],function(socketid){
        that.invitees[socketid] = false;
      })
    }
    this.name = name;
    this.song_position = 0;
    this.io = io;
    this.songs = utility.getPlaylist();
    this.numPlayers = 0;
    utility.write(io,'Game '+name+' made');
  }
  addUser(socket){
    if(this.invitees[socket.id]){
      return;
    }
    this.invitees[socket.id] = true;
    this.numPlayers++;
    socket.join(this.name);
    utility.write(this.io,'Client '+socket.id+' joins game '+ this.name);

    socket.on('resume', ()=>{
      utility.write(this.io,'Client '+socket.id+' resumes ');
      this.io.to(this.name).emit('resume');
    });

    socket.on('pause', ()=>{
      utility.write(this.io,'Client '+socket.id+' pauses ');
      this.io.to(this.name).emit('pause');
    });

    socket.on('submit',(answer)=>{
      utility.write(this.io,'Client '+socket.id+' submits '+answer);
      var that = this;
      utility.getTitle(function(title){
        var d = distance.getEditDistance(answer,title);
        if(d > title.length / 5)
        {
            socket.emit("correct");
            that.nextSong();
        }
        else{
          that.resume();
        }
      })
    });
    if(this.numPlayers == Object.keys(this.invitees).length)
    {
      this.io.to(this.name).emit('play',this.songs[this.song_position]);
    }
  }
  
  nextSong(){
    this.io.to(this.name).emit('play',this.songs[++this.song_position]);
  }
}
module.exports = Game;
