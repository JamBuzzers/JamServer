
var utility = require("./utility.js");
var distance = require("./distance");
class Game {
  constructor(name,io, invitees) {
    utility.write(io,'Game '+name+' is being made');

    this.invitees = {};
    this.score = {};
    this.socket_to_name

    var that = this;
    for(var i = 0; i < invitees.length; i++)
    {
      /*utility.getSocketId(invitees[i],function(socketid){
        that.invitees[socketid] = false;
        that.score[socketid] = 0;
      })*/
      utility.getById(invitees[i],function(data){
        that.invitees[data.socket_id] = false;
        that.score[data.socket_id] = 0;
        that.socket_to_name[data.socket_id] = data.name;
      })
    }
    this.timer =100;
    this.name = name;
    this.song_position = 0;
    this.io = io;
    this.WinnerCountdown = null;
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

    //Now we're reusing invitees to keep track of answers
    socket.on('pause', ()=>{
      utility.write(this.io,'Client '+socket.id+' pauses ');
      this.io.to(this.name).emit('pause');
      clearInterval(this.WinnerCountdown);
    });

    socket.on('submit',(answer)=>{
      utility.write(this.io,'Client '+socket.id+' submits '+answer);
      var that = this;
      utility.getToken(socket.id,function(token){
        utility.getTitle(that.songs[that.song_position],token, function(title){
          utility.write(that.io,"title is "+title);
          var d = distance.getEditDistance(answer,title);
          if(d < title.length / 5)
          {
              that.score[socket.id]++;
              socket.broadcast.to(that.name).emit("result",socket.id+ " was correct");
              socket.emit("result", "you were correct");
              utility.write(that.io,'Client '+socket.id+ 'is correct');
              this.nextRound();
              setTimeout(that.nextSong,5000,that);
          }
          else{
            socket.broadcast.to(that.name).emit("result",socket.id+ " was incorrect");
            socket.emit("result", "you were incorrect");
            utility.write(that.io,'Client '+socket.id+ 'is incorrect');
            //utility.write(that.io,'Client '+socket.id+' resumes ');
            that.io.to(that.name).emit('resume');
            that.startTimer();
          }
          var k = Object.keys(that.invitees);
          for(var i = 0; i <k.length; i++)
            {
              that.io.to(k[i]).emit("score", that.score[k[i]]);
            } 
        })
      });
    });
    if(this.numPlayers == Object.keys(this.invitees).length)
    {
      this.io.to(this.name).emit('play',this.songs[this.song_position]);
      this.startTimer();
    }
  }
  
  nextSong(that){
    if(that.song_position < that.songs.length-1){
      that.io.to(that.name).emit('play',that.songs[++that.song_position]);
      that.timer = 30;
      that.startTimer();
    }
    else{
       var k = Object.keys(that.score);
       const winner = k.reduce(function(a, b){ return score[a] > score[b] ? a : b });
       console.log("Winner is "+ winner);
          for(var i = 0; i <k.length; i++)
            {
              if(k[i] == winner)
              {
                that.io.to(k[i]).emit("final score", that.score[k[i]],1);
              }
              else{
                that.io.to(k[i]).emit("final score", that.score[k[i]],0);
              }
            } 
    }
  }
  startTimer(){
    var that = this;
    utility.write(this.io,"starting timer at "+this.timer);
    this.WinnerCountdown = setInterval(function(scope){
      that.io.to(that.name).emit('timer', that.timer);
      that.timer--;
      if (that.timer === 0) {
        clearInterval(that.WinnerCountdown);
      }
    }, 1000);
  }
  nextRound(){
    var k = Object.keys(that.score);
    var names = [];
    var scores = []
    for(var i = 0; i <k.length; i++)
    {
      names.push(this.socket_to_name[k[i]]);
      scores.push(this.socket_to_name[scores[k[i]]]);
    }
    this.io.to(that.name).emit('next round', names,scores);
  }
}
module.exports = Game;
