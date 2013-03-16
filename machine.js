// collect votes
var fs      = require('fs');
var express = require('express');
var http    = require('http');
var sockjs  = require('sockjs');
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var tally   = {}; // object to provide a live tally of the votes

var log = fs.createWriteStream("audit.log", {flags:'a'});

sendTally = function(conn) {
    conn.write(JSON.stringify(tally));
}
var sockjs_echo = sockjs.createServer(sockjs_opts);
sockjs_echo.on('connection', function(conn) {
  var sendTallyId = "";
  conn.on('data', function(seconds) { // figure out how often to update listener
    if (sendTallyId != "") {  // do we have a timed task already
        clearInterval(sendTallyId)
    }
    seconds=(seconds=="" || isNaN(seconds))?5:seconds; // 5 seconds on invalid interval
    sendTally(conn);  // send the initial data
    sendTallyId=setInterval(sendTally, seconds*1000, conn); // start timed task
  });
  conn.on('end', function() {   // at end 
    if (sendTallyId != "") {
        clearInterval(sendTallyId) // cancel timed task
    };
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
sockjs_echo.installHandlers(server, {prefix:'/echo'});

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
    log.write(JSON.stringify(vote)+'\n','utf8', function (err)
      {
        if (err) throw err
      });
}

server.listen(8080);
