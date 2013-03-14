// example using express.js:
var fs 		= require('fs');
var express = require('express');

var myHTML = fs.readFileSync('machine.html','utf8'); // html with buttons
var tally = {}; // object to provide a live tally of the votes

// let any monitoring software know we are up
process.send('online');

// handle a shutdown message
process.on('message', function(message) {
	if (message === 'shutdown') {
   	process.exit(0);
 	}
});

// do the express stuff to start up app
app = express();
app.use(express.bodyParser());
app.use(express.logger('dev'));;

// respond to get /  with our html with buttons and jquery post
app.get('/', function(req, res){
  res.send(myHTML);
});

// respond to get /getTally with a short report about votes counted
app.get('/getTally', function(req, res) {
   var showTally = "<html><body><table>"
   for (i in tally) {
   	   showTally += '<tr><td>' + i + '</td><td>' + tally[i] + '</td></tr>'
   }
   showTally += '</table></body></html>'
   res.send(showTally)
});

// handle post to /vote
app.post('/vote', function(req, res){
   var thisVote=req.body; // accept incoming payload
   thisVote.timeReceived=new Date; // add a timestamp
   // keep running totals in tally object
   if (tally.hasOwnProperty(thisVote.vote)){ // is this one we know about
      ++tally[thisVote.vote];
   } else {                                  // start a new total
   	   tally[thisVote.vote] = 1;
   }
   // save the output to audit log
   fs.appendFile('audit.log',JSON.stringify(thisVote)+'\n', function (err) {
       if (err) throw err});
   res.end() // done
});

app.listen(8080);
