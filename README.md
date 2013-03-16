VOTING MACHINE
==============


A system for a lightweight crowd voting platform. Designed for the MIT Media Lab's *Learning Creative Learning* class in Spring 2013. Initial concept and design by Ben Boyle.

Setup
-----

Clone the repository, `cd` into the directory, and then run `npm install` to fetch the dependencies.

Run
---

The server is started with the command `node machine.js`. By default, the server uses port 8080 for its http and sockjs traffic.

If you're running the server on `localhost`, it serves its content at:

 - http://localhost:8080/public/sockjs.html (which is basically sockjs example code right now)
 - http://localhost:8080/public/index.html (which has the buttons, and uses them to post, but has no way to get feedback)
 
 
Notes
-----
 
Any text sent in sockjs (using `sockjs.send(text)`) will be treated as a vote for that key. So for instance if we wanted "clap" to be the key we tracked, we could do `sockjs.send("clap")` and it would register as a vote for clap.

In response to each vote, the server sends a message to all connected clients which is an object where each key is a voteKey and each value is the number of total votes ever for that key. You will need to use `JSON.parse(e.data)` to turn the message contents into an actual object. How you then represent that data is up to you!

Next Steps
----------

As vote totals grow, we may want to start batching the updates, so every vote doesn't trigger a message to every user. Ie, every second, check and see if votes came in over the last second and if yes, broadcast a message.

We may also want to be more thoughtful about distinguishing voter identification to help disambiguate between lots of people clapping once and a few people clapping a lot.