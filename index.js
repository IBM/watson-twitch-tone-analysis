

var config = require('./config.json');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var tmi = require('tmi.js');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var tmi_options = {
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    reconnect: true
  },
  identity: config.twitch_identity,
  channels: config.twitch_channels
  //channels: ["nibalizer"]
};

console.log(config.twitch_channels)
var tone_analyzer = new ToneAnalyzerV3({
  username: config.watson.username,
  password: config.watson.password,
  version_date: config.watson.version_date,
});


var client = new tmi.client(tmi_options);
client.connect();
client.on('connected', function(address, port) {
  client.action("nibalizer", "Hello World");
});

client.on('chat', function(channel, user, message, self) {
  tone_analyzer.tone({ text: message },
  function(err, tone) {
    if (err)
      console.log(err);
    else
      io.emit('chat message', tone['document_tone']);
  });
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('vendor'))

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

