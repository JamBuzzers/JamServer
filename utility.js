var request = require('request');
var admin = require('firebase-admin');
var serviceAccount = require('./what-s-that-jam-firebase-adminsdk-4pblj-97afb9e634.json');

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
    docRef.set({
      token:token,
      name:name,
      socket_id:socket_id,
      active:true
    });
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
      players:playerss
    });
}
exports.logout = function(socketid){
  var userRef = db.collection('users')
  var user = userRef.where('socket_id','==',socketid).get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      doc.update({ active: false });
    });
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });;
}
