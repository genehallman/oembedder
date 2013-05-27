var requester = require('request');
var http = require('http');
var url = require('url');
var cheerio = require('cheerio');
var cache = {};

var twitterRegex = /https*:\/\/twitter\.com\/.*\/status\/.*/;
    
var server = http.createServer(function (request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;

  if (!query.url || !query.url.match(twitterRegex)) {
    return writeResult(response);
  }
  
  query.url = query.url + "/photo/1/large";
  if (cache[query.url]) {
    writeResult(response, cache[query.url]);
  }
  
  requester(query.url, function(err, res, body) {
    console.log("Got response: ", arguments);
    $ = cheerio.load(body);
    var result = $('img.large').attr('src');
    cache[query.url] = result;
    writeResult(response, result);
  });
});

var writeResult = function(response, result) {
  if (result) {
    response.writeHead(301, {"Content-Type": "application/json", "Location": result});
  } else {
    response.writeHead(400);
  }
  response.end();
  return true;
};

// Listen on port 8000, IP defaults to 127.0.0.1
var port = process.env.PORT || 8000;
server.listen(port);

// Put a friendly message on the terminal
console.log("Server running at on port " + port);
