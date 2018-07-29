
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
    utility.write(io,'Game '+name+' made:' + this);
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
        utility.write(that.io,"title is "+title);
        var d = distance.getEditDistance(answer,title);
        if(d > title.length / 5)
        {
            socket.emit("correct");
            utility.write(that.io,'Client '+socket.id+ 'is correct');
            that.nextSong();
        }
        else{
          utility.write(that.io,'Client '+socket.id+ 'is incorrect');
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
    if(this.song_position < this.songs.length-1){
      this.io.to(this.name).emit('play',this.songs[++this.song_position]);
    }
    else{
      this.io.to(this.name).emit('message', "game over");
    }
  }
}
module.exports = Game;
