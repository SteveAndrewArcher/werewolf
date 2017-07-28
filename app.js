var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var sockets = require('./wolfsockets.js').listen(http)

app.set('port', process.env.PORT || 3000);

http.listen(app.get('port'), function(){
  console.log('listening on '+app.get('port'));
});
app.use(express.static(__dirname + '/public'));
app.get('/', function(req,res){
	res.sendFile(__dirname + '/index.html');
});