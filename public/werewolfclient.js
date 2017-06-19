

var socket= io();

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function createGame(){
	$('#thisplayer').val($('#newgamename').val());
	socket.emit('create-game', $('#newgamename').val());	
}

function joinGame(){
	$('#thisplayer').val($('#joingamename').val());
	$('#join').prop('disabled', true)
	socket.emit('join-game', $('#joinroomid').val(), $('#joingamename').val());
}

function quit(){
	if(confirm("Are you sure you want to quit the game?")==true){
		document.cookie = "werewolfroomid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "werewolfplayername=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		socket.emit('quit', roomid, $('#thisplayer').val());
		$('#templatecontainer').html("<p>You have left the game</p>");
		socket.disconnect();
	}
}

function gameStart(){
	socket.emit('game-start', roomid);
}

function vote(name){
	$('.vote').removeClass('clicked');
	$('#'+name).addClass('clicked');
	$('#clicked').val(name);
}

function lockVote(){
	$('#votelocker').remove();
	$("#quit").attr("hidden",true)
	socket.emit('vote-locked', $('#clicked').val(), roomid);
}

function kill(name){
	socket.emit('kill', name, roomid);
}
	
function lockKill(){
	$('#killlocker').remove();
	$("#quit").attr("hidden",true)
	socket.emit('kill-locked', $('#clicked').val(), roomid);
}

function docSave(name){
	socket.emit('doc-save', name, roomid);
	$('#pick').html("");
}

function sherPick(name){
	socket.emit('sher-pick', name, roomid);
}

//onload, check cookie to see if game in progress
var roomid = getCookie("werewolfroomid")
if(roomid != ""){
	//game is in progress, rejoin
	$('#thisplayer').val(getCookie("werewolfplayername"))
	socket.emit('rejoin', roomid);
}

socket.on('lobby', function(room, data){
	roomid = room;
	document.cookie = "werewolfroomid="+roomid+"; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
	document.cookie = "werewolfplayername="+$('#thisplayer').val()+"; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
	$('#templatecontainer').html(Handlebars.templates.lobby(data));
	$('#room').text("Have your friends join this room: " + roomid);
	if(data.players.length>5){
		$('#templatecontainer').append('<p>Press this button when all players are in!</p><button onclick="gameStart()">Start The Game</button>');
	}
});

socket.on('no-room', function(data){
	$('#noroom').text(data);
	$('#join').prop('disabled', false)
});

socket.on('rejoin-fail', function(){
	document.cookie = "werewolfroomid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	document.cookie = "werewolfplayername=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
});



socket.on('day', function(data){
	$('#templatecontainer').html(Handlebars.templates.day(data));
	if(data.werewolves.indexOf($('#thisplayer').val())!=-1){
		$('#wolf').html("<p>You're a WEREWOLF!</p>");
	}
	if(data.killed!="none" && data.killed!=data.saved){
		$('#nightresults').text("Last night " + data.killed + " was killed by werewolves!")
	}
	if(data.killed==$('#thisplayer').val()){
		$('#templatecontainer').html("<p>You've been killed by the werewolves!</p");
		socket.disconnect();
	}
});



socket.on('night', function(data){
	$('#templatecontainer').html(Handlebars.templates.night(data));
	if(data.hanged!="none"){
		$('#dayresults').text("Today " + data.hanged + " was killed by an angry mob!");
	}
	$('#pick').html("<p>Night has fallen! So spooky... All you can do is huddle under the covers and wait for daytime!</p>");
	if(data.werewolves.indexOf($('#thisplayer').val())!=-1){
		$('#pick').html(Handlebars.templates.wolfpick(data));
		for(var i=0; i<data.players.length; i++){
			if(data.players[i].killvotes.length==data.werewolves.length && (data.saved!="none" || data.docdead) && (data.investigationcomplete || data.sheriffdead)){
				$('#clicked').val(data.players[i].name);
				$('#templatecontainer').append('<button id="killlocker" class="lockbtn" onclick="lockKill()">Lock In Kill</button>');
			}
		}
	}
	if(data.sheriff == $('#thisplayer').val()){
		if(!data.investigationcomplete){
			$('#pick').html(Handlebars.templates.sherpick(data));
		}else{
			$("#quit").attr("hidden",true)
			$('#pick').html("");
			if(data.werewolves.indexOf(data.accused)!=-1){
				$('#results').text(data.accused+" IS a werewolf!");
			}else{
				$('#results').text(data.accused+" is NOT a werewolf!");
			}
		}
	}	
	if(data.doctor == $('#thisplayer').val()){
		$('#pick').html("");
		if(data.saved=="none"){
			$('#pick').html(Handlebars.templates.docpick(data));
		}else{
			$("#quit").attr("hidden",true)
			$('#results').text(data.saved+" is safe from the werewolves tonight.");
		}
	}
	if(data.hanged==$('#thisplayer').val()){
		$('#templatecontainer').html("<p>You were killed by an angry mob of villagers!</p>");
		socket.disconnect();
	}
});

socket.on('wolves-win', function(){
	$('#templatecontainer').html("<p>The wolves now outnumber the villagers, they have taken over the town!</p><p>WEREWOLVES WIN!</p>");
});

socket.on('village-win', function(){
	$('#templatecontainer').html("<p>The werewolves have all been eliminated, the village is safe!</p><p>VILLAGERS WIN!</p>");
});

