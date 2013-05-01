#!/app/bin/node

var http = require('http');


function saveHistory() {
  
	http.get("http://hellisotherpeople.herokuapp.com/history", function(res) {
	  console.log("Got response: " + res.statusCode);
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});  

}

saveHistory();