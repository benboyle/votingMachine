// collect votes
var fs      = require('fs');
var express = require('express');
var http    = require('http');
var sockjs  = require('sockjs');
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var tally   = {}; // object to provide a live tally of the votes

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
process.on('message', function(message) {
  if (message === 'shutdown') {
    process.exit(0);
  };
});

// do the express stuff to start up app
app = express();
var server = http.createServer(app);
sockjs_echo.installHandlers(server, {prefix:'/echo'});

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

// handle post to /vote
app.post('/vote', function(req, res){
   var thisVote=req.body; // accept incoming payload
   thisVote.timeReceived=new Date; // add a timestamp
   thisVote.reqip = req.ip;  // grab the ip address
   // keep running totals in tally object fix not to if then else
   tally[thisVote.vote]=(tally.hasOwnProperty(thisVote.vote))?tally[thisVote.vote]+1:1;
   // save the output to audit log
   fs.appendFile('audit.log',JSON.stringify(thisVote)+'\n', function (err) {
       if (err) throw err});
   res.end() // done
});

server.listen(8080);
