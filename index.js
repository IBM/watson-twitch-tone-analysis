
// Load Config File
var config = require('./secrets/config.json');

// Load libraries; instantiate express app and socket.io
var express = require('express');
var app = express();
var http = require('http').Server(app);
var httpr = require('http')
var io = require('socket.io')(http);
var tmi = require('tmi.js');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

// Setup Watson Tone Analyzer
var tone_analyzer = new ToneAnalyzerV3({
  url: config.watson.new.url,
  version: config.watson.version_date,
  iam_apikey: config.watson.new.apikey
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
app.use('/watson-twitch-tone-analysis', express.static('vendor'))

// Serve index.html on /
app.get('/watson-twitch-tone-analysis', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/anger', function(req, res){
  res.sendFile(__dirname + '/anger.html');
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

app.get('/watson-twitch-tone-analysis/channels', function (req, res, next) {
  // tell tmi to join the channel
  // set a timer so that tmi eventually leaves the channel
  // 5 minutes right now

  var twitch_channel = req.query.twitch_channel;
  client.join(twitch_channel);
  var foo = setTimeout(function(){
    client.part(twitch_channel);
  }, 300000);
  next();

  //res.send('OK - Joined channel! Note, will leave channel in 2 minutes!');
  res.redirect('/watson-twitch-tone-analysis')
  // template the frontend so it filters messages 
  // currently only sends ok, user needs to refresh main page to see results
});


// When a chat message comes in, process it with watson tone analysis
// and send that to any clients connected via websockets
// This is the meat of the proram
client.on('chat', function(channel, user, message, self) {
  tone_analyzer.tone({ text: message },


// talk to tensorflow

let url = "http://max-toxic-comment-classifier:5000/model/metadata";

httpr.get(url,(res) => {
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
        try {
            let json = JSON.parse(body);
            // do something with JSON
            console.log(json)
        } catch (error) {
            console.error(error.message);
        };
    });

}).on("error", (error) => {
    console.error(error.message);
});

  function(err, tone) {
    if (err)
      console.log(err);
    else
      io.emit('chat message', tone['document_tone']);
      //io.emit('twitch_channel_" + twitch_channel, tone['document_tone']);
  });
});
