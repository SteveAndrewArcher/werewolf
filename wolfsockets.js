var socketio = require('socket.io');
var wolf = require('./werewolf.js');

module.exports.listen = function(http){
	io = socketio.listen(http)

	io.sockets.on('connection', function(socket){
		
		socket.on('create-game', function(name){
			var roomid = wolf.generateRoomID()
			socket.room = roomid;
			socket.join(roomid);
			var game = wolf.createGame(name, roomid, socket.id)
			io.sockets.in(roomid).emit('lobby', roomid, game);	
		});
		
		socket.on('join-game', function(roomid, name){
			game = wolf.joinGame(name, roomid, socket.id)
			if(game){
				if(game==="duplicate name"){
					socket.emit('no-room', "There's already a player with that name, try another!");
				}else{
					socket.room = roomid;
					socket.join(roomid);
					io.sockets.in(roomid).emit('lobby', roomid, game);
				}
			}else{
				socket.emit('no-room', "That room doesn't exist!");
			}
		});

		socket.on('rejoin', function(roomid){
			game = wolf.rejoinGame()
			if(game){
				socket.room = roomid;
				socket.join(roomid);
				if(game.started){
					if(game.day){
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
		
		socket.on("quit", function(roomid, name){
			wolf.quit();
		});
		
		socket.on('game-start', function(roomid){
			game = wolf.startGame();
			if(game){
				io.sockets.in(roomid).emit('day', game);
			}
		});
		
		socket.on('vote-locked', function(vote, roomid){
			game = wolf.voteLocked(vote, roomid)
			if(game){
				if(game==='village-win'){
					io.sockets.in(roomid).emit('village-win')
				}
				else if(game==='wolves-win'){
					io.sockets.in(roomid).emit('wolves-win')
				}else{
					io.sockets.in(roomid).emit('night', game)
				}
			}
		});
		
		socket.on('kill', function(namevoted, roomid){
			game=wolf.kill(namevoted,roomid,socket.id)
			if(game){
				io.sockets.in(roomid).emit('night', game);
			}
		});
		
		socket.on('kill-locked', function(namekilled, roomid){
			game = wolf.killLocked();
			if(game){
				if(game==='village-win'){
					io.sockets.in(roomid).emit('village-win')
				}
				else if(game==='wolves-win'){
					io.sockets.in(roomid).emit('wolves-win')
				}else{
					io.sockets.in(roomid).emit('day', game)
				}
			}
		});

		socket.on("game-over", function(roomid){
			wolf.gameOver()
		})
		
		socket.on('doc-save', function(name, roomid){
			game = wolf.docSave()
			if(game){
				io.sockets.in(roomid).emit('night', game);
			}
		});
		
		socket.on('sher-pick', function(name, roomid){
			game = wolf.sherPick()
			if(game){
				io.sockets.in(roomid).emit('night', game);
			}
		});
		
	});

	return io;
}

