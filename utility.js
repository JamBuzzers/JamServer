var request = require('request');
const express = require('express');
const socketIO = require('socket.io');
var admin = require('firebase-admin');
var serviceAccount = require('./what-s-that-jam-firebase-adminsdk-4pblj-97afb9e634.json');
var async = require("async");



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://users.firebaseio.com'
});
var db = admin.firestore();


exports.getPlaylist = function(user1, user2){
  var answer = ["2cEnYJKLSZPH7MFSk6C05c","3EApebexZ7YqDIqw2EMTDh","3PdgIdRXJjgxfOr7slldel"];
  return answer;
}
exports.getTitle = function(id, token, call){
  var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+token
    };
  var options = {
      url: 'https://api.spotify.com/v1/tracks/'+id,
      headers: headers
  };
  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        call(info.name);
    }
}
  request(options, callback);
}

exports.getProfile = function(token,call){
  console.log("here2");
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+token
  };
var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: headers
};
function callback(error, response, body) {
  console.log(error);
  console.log(response.statusCode)
  if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      call(info.display_name,info.id);
  }
}
request(options, callback);
}
exports.saveuser = function(token, socket_id){
  exports.getProfile(token,function(name,id){
    var docRef = db.collection('users').doc(id);
    if(name != null)
      lower_name = name.toLowerCase();
    else
      lower_name = id
    docRef.set({
      token:token,
      name:lower_name,
      socket_id:socket_id,
      active:true
    },SetOptions.merge());
  })
}
exports.getSocketId = function(userid, callback){
    var userRef = db.collection('users').doc(userid);
    var getDoc = userRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        callback(doc.data().socket_id)
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
}
exports.saveGame = function(id, users){
  var docRef = db.collection('games').doc(id);
    docRef.set({
      players:users
    });
}
exports.logout = function(socketid){
  var userRef = db.collection('users')
  var user = userRef.where('socket_id','==',socketid).get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      var uref = db.collection('users').doc(doc.id);
      uref.update({active : false});
    });
  });
}
exports.getToken = function(socketid, callback){
  var userRef = db.collection('users')
  var user = userRef.where('socket_id','==',socketid).get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      callback(doc.data().token);
    });
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });;
}
exports.write = function(io, string){
  console.log(string);
  io.emit('message',string);
}
exports.getPopular = function(userid, call){
  var range = ["short","medium","long"];
  var userRef = db.collection('users').doc(userid);
  

  var getDoc = userRef.get()
  .then(doc => {
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      var songs_ids = [];
      
   
      async.forEach(range, function(ran,callback){
        var headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+doc.data().token
      };
          var options = {
            url: 'https://api.spotify.com/v1/me/top/tracks?time_range='+ran+'_term&limit=50&offset=0',
            headers: headers
        };
        function cb(error, response, body) {
          if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            for(var i = 0;i < info.items.length; i++){
              songs_ids.push(info.items[i].id)
            }
            callback();
          }
          else{
            console.log(response.statusCode);
          }
        }
        request(options, cb);
      },function(err){
        console.log("final");
        console.log(songs_ids.length);
        call(songs_ids)
      });
    }
  })
  .catch(err => {
    console.log('Error getting document', err);
  });
}
exports.makePlaylist = function(userlist, call){
  var userlists = [];
  async.forEach(userlist, function(user,callback){
    exports.getPopular(user,function(songs){
      userlists.push(songs);
      callback();
    })
  },function(err){
    var list= [];
    for(var i = 0; i < userlists[0].length; i++)
    {
      var inall = true;
      for(var j = 0; j <userlists.length;j++){
        if( !userlists[j].includes(userlists[0][i])){
          inall = false;
        }
      }
      if(inall){
        list.push(userlists[0][i])
      }
    }
    call(list);
  })
}