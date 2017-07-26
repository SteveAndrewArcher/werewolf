var games = {}

function generateRoomID(){
	var roomid = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	do{
		for(var i=0; i < 5; i++ ){
			roomid += possible.charAt(Math.floor(Math.random() * possible.length));
		}
	}while(games[roomid]);
	return roomid
}

function createGame(name, roomid, socket){
	games[roomid] = {
		players:[
			{socket:socket, name:name, hangvotes:0, killvotes:[]}
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
	return games[roomid];
}

function joinGame(name, roomid, socket){
	if(games[roomid]){
		if(games[roomid].players.some(function(player){return name==player.name})){
			return "duplicate name"
		}else{
			games[roomid].players.push({socket:socket, name:name, hangvotes:0, killvotes:[]});
			return games[roomid]
		}
	}else{
		return null
	}
}

function rejoinGame(roomid){
	if(games[roomid]){
		return games[roomid]
	}else{
		return null;
	}
}

function quit(name, roomid){
	if(games[roomid]){
		for(var i=0; i<games[roomid].villagers.length;i++){
			if(name==games[roomid].villagers[i]){
				games[roomid].villagers.splice(i,1);
			}
		}
		for(var i=0; i<games[roomid].werewolves.length; i++){
			if(name==games[roomid].werewolves[i]){
				games[roomid].werewolves.splice(i,1);
			}
		}
		for(var i=0; i<games[roomid].players.length; i++){
			if(name==games[roomid].players[i].name){
				games[roomid].players.splice(i,1)
			}
		}
		if(name==games[roomid].doctor){
			games[roomid].docdead = true;
		}
		if(name==games[roomid].sheriff){
			games[roomid].sheriffdead = true;
		}
		if(games[roomid].players.length==0){
			gameOver(roomid);
		}
	}else{
		return null
	}
}

function startGame(roomid){
	if(games[roomid]){	
		var randoms = [];
		for(var i=0; i<games[roomid].players.length; i++){
			randoms.push(i);
		}
		var numWolves = Math.floor(randoms.length/3);
		for(var i=0; i<numWolves; i++){
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
		return games[roomid];
	}	
}

function voteLocked(vote, roomid){
	if(games[roomid]){
		for(i=0; i<games[roomid].players.length; i++){
			if(games[roomid].players[i].name==vote){
				games[roomid].players[i].hangvotes++;
			}
		}
		games[roomid].totalvotes++
		if(games[roomid].totalvotes==games[roomid].players.length){
			return voteComplete(roomid);
		}else{
			return null
		}
	}
}

function voteComplete(roomid){
	if(games[roomid]){
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
		if(games[roomid].werewolves.length==0){
			return 'village-win'
		}
		else if(games[roomid].villagers.length<=games[roomid].werewolves.length){
			return 'wolves-win'
		}else{
			return games[roomid]
		}
	}
}

function kill(namevoted, roomid, socket){
	if(games[roomid]){
		for(var i=0; i<games[roomid].players.length; i++){
			for(var j=0; j<games[roomid].players[i].killvotes.length; j++){
				if(games[roomid].players[i].killvotes[j]==socket){
					games[roomid].players[i].killvotes.splice(j,1);
				}
			}
			if(namevoted==games[roomid].players[i].name){
				games[roomid].players[i].killvotes.push(socket);
			}
		}
		return games[roomid];
	}
}

function killLocked(namekilled, roomid){
	if(games[roomid]){
		if(games[roomid].saved==namekilled)
		{
			games[roomid].hanged = "none";
			games[roomid].totalvotes = 0;
			for(var i=0; i<games[roomid].players.length; i++){
				games[roomid].players[i].hangvotes = 0;
			}
			return games[roomid]
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
			games[roomid].day = true;
			if(games[roomid].werewolves.length==0){
				return 'village-win'
			}
			else if(games[roomid].villagers.length<=games[roomid].werewolves.length){
				return 'wolves-win'
			}else{
				return games[roomid]
			}
		}
	}
}

function gameOver(roomid){
	if(games[roomid]){
		games[roomid].players.pop()
		if(games[roomid].players.length==0){
			delete games[roomid];
			return "game deleted"
		}else{
			return null
		}
	}
}

function docSave(name,roomid){
	if(games[roomid]){
		games[roomid].saved = name;
		return games[roomid]
	}
}

function sherPick(name,roomid){
	if(games[roomid]){
		games[roomid].investigationcomplete = true;
		games[roomid].accused = name;
		return games[roomid]
	}
}

module.exports = {
	generateRoomID,
	createGame,
	joinGame,
	rejoinGame,
	quit,
	startGame,
	voteLocked,
	voteComplete,
	kill,
	killLocked,
	gameOver,
	docSave,
	sherPick,
	games
}