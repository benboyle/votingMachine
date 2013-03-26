
0.0.9 / 2013-03-28 
==================

  * added download function and /download
  * add sockjs2.html which contains socket based tests
  * cleaned up source for jshint
  * Merge pull request #3 from drewww/sendvotes
  * Switched to sending vote notices instead of tallies, to let us do per-user visualizations if we want to.
  * include example buttons for sockjs
  * take out debugging
  * moved broadcast to handle vote so posted votes generate message
  * Merge pull request #2 from drewww/documentation
  * Updated the README.
  * Merge pull request #1 from drewww/all-sockets
  * Changed to tally throughout, removing echo.
  * Started broadcasting the tally when votes come in.
  * Started accepting votes in sockjs.
  * Some minor changes to shutdown behavior.
  * Some changes to how logging is handled to make sure we never miss anything and don't open the file each time.
  * Abstracted the vote management code so we can accept votes on sockjs, too.
  * clean up close sockJS connection
  * added sockJS connectivity for people who need tally info
  * added public directory, eliminated gettally, prettied up code
  * first commit
