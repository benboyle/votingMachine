// collect votes
var fs      = require('fs');
var express = require('express');
var http    = require('http');
var sockjs  = require('sockjs');
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var tally   = {}; // object to provide a live tally of the votes

var log = fs.createWriteStream("audit.log", {flags:'a'});

var connectedUsersCount = 0;
var openConnections = {};

function sendVote(conn, vote) {
	conn.write(JSON.stringify(vote));
}

function broadcastVote(vote) {
  Object.keys(openConnections).forEach(function(id) {
    sendVote(openConnections[id], vote);
  });
}

var sockjs_tally = sockjs.createServer(sockjs_opts);

sockjs_tally.on('connection', function(conn) {
  console.log("connected " + conn.id);
  
  openConnections[conn.id] = conn;
  
  conn.on('data', function(data) {
    // any string that comes in we will treat as a vote for that item.
    // it's up to clients to send sensible strings for now.
    // we might want to add a constraint that the key exist aleady in tally,
    // if we're worried about client misbehavior. But for now we'll be
    // permissive.
    handleVote(conn.id, conn.remoteAddress, data);
  });
  
  conn.on('end', function() {   // at end 
    console.log("disconnected " + conn.id);
    delete openConnections[conn.id];
  });  
});

// let any monitoring software know we are up
if (process.hasOwnProperty('send')) {
  process.send('online');
};
// handle a shutdown message
process.on('SIGINT', function(message) {
    console.log("shutting down");
    log.end();
    
    // this is bad form but for some reason the log doens't always issue
    // the 'end' or 'finish' events after you ask it to end. So give it a 
    // bit of time and then end the process.
    setTimeout(function() {
      process.exit(0)}, 200);
});

// do the express stuff to start up app
app = express();
var server = http.createServer(app);
sockjs_tally.installHandlers(server, {prefix:'/tally'});

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

// handle post to /vote
app.post('/vote', function(req, res){
   handleVote("posted", req.ip, req.body.vote);
   res.end() // done
});

function handleVote(id, ip, voteKey) {
    tally[voteKey] = (voteKey in tally) ? tally[voteKey]+1:1;
    console.log("TALLY: " + JSON.stringify(tally));
		
    var vote = {vote:voteKey, id:id, ip:ip, timestamp:Date.now()};
		
		broadcastVote(vote);
		
    log.write(JSON.stringify(vote)+'\n','utf8', function (err)
      {
        if (err) throw err
      });
}

server.listen(8080);