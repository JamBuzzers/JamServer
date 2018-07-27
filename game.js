
var utility = require("./utility.js");
var distance = require("./distance");
class Game {
  constructor(name,io, socketids) {
    this.invitees = {};
    for(i = 0; i < invitees.length; i++)
    {
      this.invitees[invitees[i]] = false;
    }
    this.name = name;
    this.song_position = 0;
    this.io = io;
    this.songs = utility.getPlaylist();
    this.numPlayers = 0;
  }
  addUser(socket){
    if(this.invitees[socket.id]){
      return;
    }
    this.invitees[socket.id] = true;
    this.numPlayers++;
    socket.join(this.name);
    socket.on('resume', ()=>{
      this.io.to(this.name).emit('resume');
    });
    socket.on('pause', ()=>{
      this.io.to(this.name).emit('pause');
    });
    socket.on('submit',(answer)=>{
      utility.getTitle(function(title){
        var d = distance.getEditDistance(answer,title);
        if(d > title.length / 5)
        {
            socket.emit("correct");
            nextSong();
        }
        else{
          resume();
        }
      })
    });
    if(this.numPlayers == Object.keys(this.invitees).length)
      {
        this.io.to(this.name).emit('play',this.songs[this.song_position]);
      }
  }
  
  nextSong(){
    this.io.to(this.name).emit('play',songs[++this.song_position]);
  }
}
module.exports = Game;
