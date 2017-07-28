wolf = require("../werewolf.js")

function setupTestGame(){
	var testGames = {}
	testGames["testid"] = {
		players:[
			{socket:"testSocket", name:"testName", hangvotes:0, killvotes:[]}
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
	return testGames
}

describe("the generateRoomID function", function(){
	id = wolf.generateRoomID()
	
	it("should return a string", function(){
		expect(typeof id=="string");
	});

	it("should return string with a length of 5", function(){
		expect(id.length).toEqual(5);
	});
});

describe("create a game", function(){
	beforeEach(function(){
		testGames = setupTestGame()
	});

	afterEach(function(){
		testGames = {}
	});

	it("should return an empty game with the proper format", function(){
		expect(wolf.createGame("testName","testid","testSocket")).toEqual(testGames["testid"]);
	});

});

describe("join a game", function(){
	beforeEach(function(){
		testGames = setupTestGame()
		testGames["testid"].players.push({socket:"testSocket2", name:"testName2", hangvotes:0, killvotes:[]})
		wolf.createGame("testName","testid","testSocket")
	});

	afterEach(function(){
		testGames = {}
	});

	it("should return null if the room id is not in the games object", function(){
		expect(wolf.joinGame("testName2", "not a roomid", "testSocket2")).toBeNull()
	});

	it("should return 'duplicate name' if the name passed is already in that game", function(){
		expect(wolf.joinGame("testName", "testid", "testSocket2")).toEqual("duplicate name");
	});

	it("should return a game with the new player on success", function(){
		expect(wolf.joinGame("testName2", "testid", "testSocket2")).toEqual(testGames["testid"])
	});
});

describe("rejoin a game", function(){
	beforeEach(function(){
		testGames = setupTestGame()
		wolf.createGame("testName","testid","testSocket")
	});

	afterEach(function(){
		testGames = {}
	});

	it("should return null if there is no room with that id", function(){
		expect(wolf.rejoinGame("not a roomid")).toBeNull()
	});

	it("should return the found game on success", function(){
		expect(wolf.rejoinGame("testid")).toEqual(testGames["testid"]);
	});
});

describe("quit a game", function(){
	beforeEach(function(){
		wolf.createGame("testName","testid","testSocket")
		wolf.joinGame("testName2", "testid", "testSocket2")
		game = wolf.games["testid"]
	});

	it("should return null if there is no room with that id", function(){
		expect(wolf.quit("not a roomid")).toBeNull()
	});

	it("should remove player from the game", function(){
		wolf.quit("testName2", "testid");
		expect(game.players).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:"testName2"})]))
	});

	it("should remove player from villagers", function(){
		wolf.games["testid"].villagers.push("villager")
		wolf.quit("villager", "testid")
		expect(game.villagers).not.toEqual(jasmine.arrayContaining(["villager"]));
	});

	it("should remove player from werewolves", function(){
		game.werewolves.push("wolf")
		wolf.quit("wolf", "testid")
		expect(game.villagers).not.toEqual(jasmine.arrayContaining(["wolf"]));
	});

	it("should remove doctor", function(){
		game.docdead = false
		game.doctor = "doctor"
		wolf.quit("doctor", "testid")
		expect(game.docdead).toEqual(true);
	});

	it("should remove sheriff", function(){
		game.sheriffdead = false
		game.sheriff = "sheriff"
		wolf.quit("sheriff", "testid")
		expect(game.sheriffdead).toEqual(true);
	});

	it("should delete the game if no players remain", function(){
		wolf.quit("testName", "testid");
		wolf.quit("testName2", "testid");
		expect(wolf.games["testid"]).toBeUndefined()
	});
});

describe("starting the game", function(){
	beforeEach(function(){
		//create a game with random number of players
		numplayers = 6 + Math.floor(Math.random()*10)
		wolf.createGame("testName","testid","testSocket")
		for(var i=2; i<numplayers; i++){
			wolf.joinGame("testName"+i, "testid", "testSocket"+i)
		}
		game = wolf.games["testid"]
		wolf.startGame("testid")
	});

	it("should create a game where one third of the players are werewolves", function(){
		expect(game.werewolves.length).toEqual(Math.floor(game.players.length/3))
	});

	it("should create a game where the remaining players are villagers, with no overlap", function(){
		expect(game.villagers.length).toEqual(game.players.length-game.werewolves.length)
		for(var i=0; i<game.werewolves.length; i++){
			expect(game.villagers).not.toEqual(jasmine.arrayContaining([game.werewolves[i]]))
		}
	});

	it("should create a game with a doctor who is a villager and not a werewolf", function(){
		expect(game.doctor).toBeDefined()
		expect(game.werewolves).not.toEqual(jasmine.arrayContaining([game.doctor]))
		expect(game.villagers).toEqual(jasmine.arrayContaining([game.doctor]))
	});

	it("should create a game with a sherrif who is a villager and not a werewolf", function(){
		expect(game.sheriff).toBeDefined()
		expect(game.werewolves).not.toEqual(jasmine.arrayContaining([game.sheriff]))
		expect(game.villagers).toEqual(jasmine.arrayContaining([game.sheriff]))
	});

	it("should return a game object", function(){
		expect(wolf.startGame("testid")).toBeDefined()
	});
});

describe("a vote for who to hang is locked", function(){
	beforeEach(function(){
		//create a game with random number of players
		numplayers = 6 + Math.floor(Math.random()*10)
		wolf.createGame("testName","testid","testSocket")
		for(var i=2; i<numplayers; i++){
			wolf.joinGame("testName"+i, "testid", "testSocket"+i)
		}
		game = wolf.games["testid"]
		wolf.startGame("testid")
	});

	it("should add a vote to the total of a player and return null", function(){
		expect(wolf.voteLocked("testName", "testid")).toBeNull();
		expect(game.players[0].hangvotes).toEqual(1);
	});

	it("should add a vote to the total vote count", function(){
		wolf.voteLocked("testName", "testid");
		expect(game.totalvotes).toEqual(1);
	});

	it("should complete the vote when all players have voted", function(){
		for(var i=0; i<game.players.length-1; i++){
			wolf.voteLocked("testName", "testid")
		}
		expect(game.totalvotes).toEqual(game.players.length-1)
		expect(wolf.voteLocked("testName", "testid")).toBeDefined();
	});
});

describe("the vote for who to hang is completed", function(){
	beforeEach(function(){
		//create a game with a bunch of players
		numplayers = 10
		wolf.createGame("testName","testid","testSocket")
		for(var i=2; i<numplayers; i++){
			wolf.joinGame("testName"+i, "testid", "testSocket"+i)
		}
		game = wolf.games["testid"]
		wolf.startGame("testid")
	});

	it("should remove the player if it receives a majority of votes, and not remove others",function(){
		for(var i=0; i<Math.floor(game.players.length/2)+1; i++){
			wolf.voteLocked("testName", "testid");
		}
		for(var i=0; i<game.players.length - (Math.floor(game.players.length/2)+1); i++){
			wolf.voteLocked("testName2", "testid");
		}
		expect(game.players).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:"testName"})]))
		expect(game.players).toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:"testName2"})]))
	});

	it("should remove a villager if a villager is voted out, and not others", function(){
		var hang = game.villagers[0]
		var live = game.villagers[1]
		var players = game.players.length
		for(var i=0; i<Math.floor(players/2)+1; i++){
			wolf.voteLocked(hang, "testid");
		}
		for(var i=0; i<players- (Math.floor(game.players.length/2)+1); i++){
			wolf.voteLocked(live, "testid");
		}
		expect(game.players).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:hang})]))
		expect(game.players).toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:live})]))
		expect(game.players.length).toEqual(players-1)
	});

	it("should remove a wolf if a wolf is voted out, and not others", function(){
		var hang = game.werewolves[0]
		var live = game.werewolves[1]
		var players = game.players.length
		for(var i=0; i<Math.floor(players/2)+1; i++){
			wolf.voteLocked(hang, "testid");
		}
		for(var i=0; i<players - (Math.floor(players/2)+1); i++){
			wolf.voteLocked(live, "testid");
		}
		expect(game.players).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:hang})]))
		expect(game.players).toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:live})]))
		expect(game.players.length).toEqual(players-1)
	});

	it("should remove the doctor if he is voted out", function(){
		var hang = game.doctor
		var live = game.sheriff
		var players = game.players.length
		for(var i=0; i<Math.floor(players/2)+1; i++){
			wolf.voteLocked(hang, "testid");
		}
		for(var i=0; i<players - (Math.floor(players/2)+1); i++){
			wolf.voteLocked(live, "testid");
		}
		expect(game.players).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:hang})]))
		expect(game.players.length).toEqual(players-1)
		expect(game.docdead).toEqual(true)
	});

	it("should remove the sheriff if he is voted out", function(){
		var hang = game.sheriff
		var live = game.doctor
		var players = game.players.length
		for(var i=0; i<Math.floor(players/2)+1; i++){
			wolf.voteLocked(hang, "testid");
		}
		for(var i=0; i<players - (Math.floor(players/2)+1); i++){
			wolf.voteLocked(live, "testid");
		}
		expect(game.players).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:hang})]))
		expect(game.players.length).toEqual(players-1)
		expect(game.sheriffdead).toEqual(true)
	});

	it("should return wolves-win if there aren't more villagers than wolves", function(){
		while(game.villagers.length > game.werewolves.length){
			game.villagers.pop()
		}
		expect(wolf.voteComplete("testid")).toEqual("wolves-win")
	});

	it("should return village-win if there are no more wolves", function(){
		game.werewolves = []
		expect(wolf.voteComplete("testid")).toEqual("village-win")
	});

	it("should not remove anyone if there is no majority, and just return the game object if no one has won", function(){
		returnedGame = wolf.voteComplete("testid")
		expect(returnedGame).toBeDefined()
		expect(returnedGame.players).toEqual(game.players)
	});
});

describe("a wolf votes to kill", function(){
	beforeEach(function(){
		//create a game with a bunch of players
		numplayers = 10
		wolf.createGame("testName","testid","testSocket")
		for(var i=2; i<numplayers; i++){
			wolf.joinGame("testName"+i, "testid", "testSocket"+i)
		}
		game = wolf.games["testid"]
		wolf.startGame("testid")
	});

	it("should add the socket id of the voting wolf to the voted player's killvotes array and return the game", function(){
		expect(wolf.kill("testName", "testid","the socket id").players[0].killvotes).toEqual(jasmine.arrayContaining(["the socket id"]))
	});

	it("should remove the socket id of the voting wolf from the killvotes array when the wolf's vote changes", function(){
		wolf.kill("testName", "testid","the socket id")
		expect(wolf.kill("testName2", "testid","the socket id").players[0].killvotes).not.toEqual(jasmine.arrayContaining(["the socket id"]))
	});
});

describe("the wolf vote is complete", function(){
	beforeEach(function(){
		//create a game with a bunch of players
		numplayers = 10
		wolf.createGame("testName","testid","testSocket")
		for(var i=2; i<numplayers; i++){
			wolf.joinGame("testName"+i, "testid", "testSocket"+i)
		}
		game = wolf.games["testid"]
		wolf.startGame("testid")
	});

	it("should return a game with no one killed if the killed player is saved by the doctor", function(){
		game.saved = "testName"
		expect(wolf.killLocked("testName", "testid").players).toEqual(game.players);
	});

	it("should return a game with the killed player killed if he hasn't been saved", function(){
		expect(wolf.killLocked("testName", "testid").players).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:"testName"})]))
	});

	it("should remove the killed player from wolves if he's a wolf", function(){
		var killed = game.werewolves[0]
		expect(wolf.killLocked(killed, "testid").werewolves).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:killed})]))
	});

	it("should remove the killed player from villagers if he's a villager", function(){
		var killed = game.villagers[0]
		expect(wolf.killLocked(killed, "testid").villagers).not.toEqual(jasmine.arrayContaining([jasmine.objectContaining({name:killed})]))
	});

	it("should return wolves-win if there aren't more villagers than wolves", function(){
		while(game.villagers.length > game.werewolves.length+1){
			game.villagers.pop()
		}
		expect(wolf.killLocked(game.villagers[0],"testid")).toEqual("wolves-win")
	});

	it("should return village-win if there are no more wolves", function(){
		game.werewolves = []
		expect(wolf.killLocked(game.villagers[0],"testid")).toEqual("village-win")
	});
});

describe("a game has ended", function(){
	beforeEach(function(){
		//create a game with a bunch of players
		numplayers = 10
		wolf.createGame("testName","testid","testSocket")
		for(var i=2; i<numplayers; i++){
			wolf.joinGame("testName"+i, "testid", "testSocket"+i)
		}
		game = wolf.games["testid"]
		wolf.startGame("testid")
	});

	it("should remove a player from the player list", function(){
		var plength = game.players.length
		wolf.gameOver("testid")
		expect(game.players.length).toEqual(plength-1)
	});

	it("should return null if there are still players who haven't signaled game over, but game should still exist", function(){
		expect(wolf.gameOver("testid")).toBeNull()
		expect(wolf.games["testid"]).toBeDefined()
	});

	it("should delete the game if all players have been removed", function(){
		game.players = []
		game.players.push("one last player")
		wolf.gameOver("testid")
		expect(game["testid"]).not.toBeDefined()
	});
});

describe("the doctor saves a player", function(){
	beforeEach(function(){
		//create a game with a bunch of players
		numplayers = 10
		wolf.createGame("testName","testid","testSocket")
		for(var i=2; i<numplayers; i++){
			wolf.joinGame("testName"+i, "testid", "testSocket"+i)
		}
		game = wolf.games["testid"]
		wolf.startGame("testid")
	});

	it("return a game that indicates that a player is protected", function(){
		expect(wolf.docSave("testName", "testid").saved).toEqual("testName")
	});
});

describe("the sheriff investigates a player", function(){
	beforeEach(function(){
		//create a game with a bunch of players
		numplayers = 10
		wolf.createGame("testName","testid","testSocket")
		for(var i=2; i<numplayers; i++){
			wolf.joinGame("testName"+i, "testid", "testSocket"+i)
		}
		game = wolf.games["testid"]
		wolf.startGame("testid")
	});

	it("should return a game that indicates a player has been accused", function(){
		expect(wolf.sherPick("testName", "testid").accused).toEqual("testName")
	});

	it("should return a game that indicates the investigation has been completed", function(){
		expect(wolf.sherPick("testName", "testid").investigationcomplete).toEqual(true)
	});
});