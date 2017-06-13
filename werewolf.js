var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('port', process.env.PORT || 3000);

http.listen(app.get('port'), function(){
  console.log('listening on *:3000');
});
app.use(express.static(__dirname + '/public'));
app.get('/', function(req,res){
	res.sendFile(__dirname + '/index.html');
});

var games = {};

io.sockets.on('connection', function(socket){
	
	socket.on('create-game', function(data){
		var roomid = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		for(var i=0; i < 5; i++ ){
			roomid += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		socket.room = roomid;
		socket.join(roomid);
		games[roomid] = {
			players:[
				{socket:socket.id, name:data, hangvotes:0, killvotes:[]}
				],
			werewolves:[],
			villagers:[],
			totalvotes:0,
			hanged:"none",
			killed:"none",
			saved:"none",
			accused:"none",
			investigationcomplete:false,
			sheriffdead:false,
			docdead:false,
			started:false,
			day:true
			}
		
		io.sockets.in(roomid).emit('lobby', roomid, games[roomid]);	
	});
	
	socket.on('join-game', function(roomid, name){
		if(games[roomid]){
			socket.room = roomid;
			socket.join(roomid);
			games[roomid].players.push({socket:socket.id, name:name, hangvotes:0, killvotes:[]});
			io.sockets.in(roomid).emit('lobby', roomid, games[roomid]);
		}else{
			socket.emit('no-room', "That room doesn't exist!");
		}
	});

	socket.on('rejoin', function(roomid){
		if(games[roomid]){
			socket.room = roomid;
			socket.join(roomid);
			if(games[roomid].started){
				if(games[roomid].day){
					socket.emit('day', games[roomid])
				}else{
					socket.emit('night', games[roomid])
				}
			}else{
				socket.emit('lobby', roomid, games[roomid]);
			}
		}else{
			socket.emit('rejoin-fail')
		}
	});
	
	socket.on('game-start', function(roomid){
		var randoms = [];
		for(var i=0; i<games[roomid].players.length; i++){
			randoms.push(i);
		}
		var numWolves = Math.floor(randoms.length/3);
		for(var i=0; i<numWolves ;i++){
			var wolf = Math.floor(Math.random()*randoms.length);
			games[roomid].werewolves.push(games[roomid].players[randoms[wolf]].name);	
			randoms.splice(wolf,1);
		}
		var sheriff = Math.floor(Math.random()*randoms.length);
		games[roomid].sheriff = games[roomid].players[randoms[sheriff]].name;
		games[roomid].villagers.push(games[roomid].players[randoms[sheriff]].name);
		randoms.splice(sheriff,1);
		var doctor = Math.floor(Math.random()*randoms.length);
		games[roomid].doctor = games[roomid].players[randoms[doctor]].name;
		games[roomid].villagers.push(games[roomid].players[randoms[doctor]].name);
		randoms.splice(doctor,1);
		for(var i=0; i<randoms.length; i++){
			games[roomid].villagers.push(games[roomid].players[randoms[i]].name);
		}
		games[roomid].started = true
		io.sockets.in(roomid).emit('day', games[roomid]);	
	});
	
	socket.on('vote-locked', function(vote, roomid){
		for(i=0; i<games[roomid].players.length; i++){
			if(games[roomid].players[i].name==vote){
				games[roomid].players[i].hangvotes++;
			}
		}
		games[roomid].totalvotes++
		if(games[roomid].totalvotes==games[roomid].players.length){
			voteComplete(roomid);
		}	
	});
	
	function voteComplete(roomid){
		for(var i=0; i<games[roomid].players.length; i++){
			if(games[roomid].players[i].hangvotes > (games[roomid].players.length)/2){
				games[roomid].hanged = games[roomid].players[i].name;
				games[roomid].players.splice(i,1);
				for(var j=0; j<games[roomid].werewolves.length;j++){
					if(games[roomid].hanged==games[roomid].werewolves[j]){
						games[roomid].werewolves.splice(j,1);
					}
				}
				for(var k=0; k<games[roomid].villagers.length;k++){
					if(games[roomid].hanged==games[roomid].villagers[k]){
						games[roomid].villagers.splice(k,1);
					}
				}
			}
		}
		if(games[roomid].hanged==games[roomid].doctor){
			games[roomid].docdead = true;
		}
		if(games[roomid].hanged==games[roomid].sheriff){
			games[roomid].sheriffdead = true;
		}
		games[roomid].killed = "none";
		games[roomid].saved = "none";
		games[roomid].accused = "none";
		games[roomid].investigationcomplete = false;
		for(var i=0; i<games[roomid].players.length; i++){
			games[roomid].players[i].killvotes = [];
		}
		games[roomid].day = false;
		io.sockets.in(roomid).emit('night',games[roomid])
		if(games[roomid].werewolves.length==0){
			io.sockets.in(roomid).emit('village-win');
			delete games[roomid];
		}
		if(games[roomid].villagers.length<=games[roomid].werewolves.length){
			io.sockets.in(roomid).emit('wolves-win');
			delete games[roomid];
		}
	}
	
	socket.on('kill', function(namevoted, roomid){
		for(var i=0; i<games[roomid].players.length; i++){
			for(var j=0; j<games[roomid].players[i].killvotes.length; j++){
				if(games[roomid].players[i].killvotes[j]==socket.id){
					games[roomid].players[i].killvotes.splice(j,1);
				}
			}
			if(namevoted==games[roomid].players[i].name){
				games[roomid].players[i].killvotes.push(socket.id);
			}
		}
		io.sockets.in(roomid).emit('night', games[roomid]);
		
	});
	
	socket.on('kill-locked', function(namekilled, roomid){
		if(games[roomid].saved==namekilled)
		{
			games[roomid].hanged = "none";
			games[roomid].totalvotes = 0;
			for(var i=0; i<games[roomid].players.length; i++){
				games[roomid].players[i].hangvotes = 0;
			}
			io.sockets.in(roomid).emit('day', games[roomid]);
		}else{
			
			for(var i=0; i<games[roomid].villagers.length;i++){
					if(namekilled==games[roomid].villagers[i]){
						games[roomid].villagers.splice(i,1);
					}
				}
				
			for(var i=0; i<games[roomid].werewolves.length; i++){
				if(namekilled==games[roomid].werewolves[i]){
					games[roomid].werewolves.splice(i,1);
				}
				
			}
			for(var i=0; i<games[roomid].players.length; i++){
				if(namekilled==games[roomid].players[i].name){
					games[roomid].players.splice(i,1)
				}
			}
			games[roomid].killed = namekilled;
			if(games[roomid].killed==games[roomid].doctor){
			games[roomid].docdead = true;
			}
			if(games[roomid].killed==games[roomid].sheriff){
			games[roomid].sheriffdead = true;
			}
			games[roomid].hanged = "none";
			games[roomid].totalvotes = 0;
			for(var i=0; i<games[roomid].players.length; i++){
				games[roomid].players[i].hangvotes = 0;
			}
			game[roomid].day = true;
			io.sockets.in(roomid).emit('day', games[roomid]);
			if(games[roomid].werewolves.length==0){
				io.sockets.in(roomid).emit('village-win');
				delete games[roomid];
			}
			if(games[roomid].villagers.length<=games[roomid].werewolves.length){
				io.sockets.in(roomid).emit('wolves-win');
				delete games[roomid];
			}
		}
	});
	
	socket.on('doc-save', function(name, roomid){
		games[roomid].saved = name;
		io.sockets.in(roomid).emit('night', games[roomid]);
	});
	
	socket.on('sher-pick', function(name, roomid){
		games[roomid].investigationcomplete = true;
		games[roomid].accused = name;
		io.sockets.in(roomid).emit('night', games[roomid]);
	});
	
});