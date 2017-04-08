
// Load Config File
var config = require('./config.json');

// Load libraries; instantiate express app and socket.io
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var tmi = require('tmi.js');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

// Setup Watson Tone Analyzer
var tone_analyzer = new ToneAnalyzerV3({
  username: config.watson.username,
  password: config.watson.password,
  version_date: config.watson.version_date,
});

// Set up options for connection to twitch chat
// Add channels in the config.json file
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
};

// Connect to twitch
var client = new tmi.client(tmi_options);
client.connect();

// Emit hello world announcement on first chat connection
client.on('connected', function(address, port) {
  client.action(config.twitch_channels[0], "Hello World");
});



// Serve any files in the 'vendor' directory as static resources
// This is where js libraries for the client are stored
app.use(express.static('vendor'))

// Serve index.html on /
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Start the web server on port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});

// Setup a websocket with any web client that connects
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});


// When a chat message comes in, process it with watson tone analysis
// and send that to any clients connected via websockets
// This is the meat of the proram
client.on('chat', function(channel, user, message, self) {
  tone_analyzer.tone({ text: message },
  function(err, tone) {
    if (err)
      console.log(err);
    else
      io.emit('chat message', tone['document_tone']);
  });
});
