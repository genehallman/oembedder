var requester = require('request');
var http = require('http');
var url = require('url');
var cheerio = require('cheerio');

var twitterRegex = /https*:\/\/twitter\.com\/.*\/status\/.*/;
    
var server = http.createServer(function (request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;

  if (!query.url || !query.url.match(twitterRegex)) {
    return writeResult(response, "");
  }
  
  query.url = query.url + "/photo/1/large";
  
  requester(query.url, function(err, res, body) {
    console.log("Got response: " + res.statusCode);
    $ = cheerio.load(body);
    writeResult(response, $('img.large').attr('src'));
  });
});

var writeResult = function(response, result) {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end("{\"url\": \""+result+"\"}");
  return true;
};

// Listen on port 8000, IP defaults to 127.0.0.1
var port = process.env.PORT || 8000;
server.listen(port);

// Put a friendly message on the terminal
console.log("Server running at on port " + port);
