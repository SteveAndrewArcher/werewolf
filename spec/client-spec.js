var testGame;

describe("create a game", function(){

	beforeEach(function(){
		var fixture = '<div id="fixture">'+
			'<input id="newgamename" type="text">' +
			'<input id="thisplayer" type="hidden">' +
		'</div>';

		document.body.insertAdjacentHTML('afterbegin',fixture);
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("it should alert if the name field is empty", function(){
		spyOn(window,"alert");
		$('#newgamename').val("");
		createGame();
		expect(window.alert).toHaveBeenCalledWith("You must enter your name!");
	});

	it("it should alert if the name field is only spaces", function(){
		spyOn(window,"alert");
		$('#newgamename').val("     ");
		createGame();
		expect(window.alert).toHaveBeenCalledWith("You must enter your name!");
	});

	it("should add the name to the hidden this player field", function(){
		$('#newgamename').val("testName");
		createGame()
		expect($('#thisplayer').val()).toEqual("testName")
	});

	it("should emit to the create Game socket target with the creator's name", function(){
		spyOn(socket,"emit");
		$('#newgamename').val("testName");
		createGame();
		expect(socket.emit).toHaveBeenCalledWith("create-game", "testName");
	});
});

describe("join a game", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">'+
			'<input id="joingamename" type="text">' +
			'<input id="joinroomid" type="text">' +
			'<input id="thisplayer" type="hidden">' +
			'<button id="join">join</button>' +
		'</div>';

		document.body.insertAdjacentHTML('afterbegin',fixture);
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("it should alert if the name field is empty", function(){
		spyOn(window,"alert");
		$('#joingamename').val("");
		joinGame();
		expect(window.alert).toHaveBeenCalledWith("You must enter your name!");
	});

	it("it should alert if the name field is only spaces", function(){
		spyOn(window,"alert");
		$('#joingamename').val("     ");
		joinGame();
		expect(window.alert).toHaveBeenCalledWith("You must enter your name!");
	});

	it("should add the name to the hidden this player field", function(){
		$('#joingamename').val("testName");
		joinGame();
		expect($('#thisplayer').val()).toEqual("testName");
	});

	it("should emit to the join game scoket target with the name and roomid (converted to upper case)", function(){
		spyOn(socket,"emit");
		$('#joingamename').val("testName");
		$('#joinroomid').val("testid")
		joinGame();
		expect(socket.emit).toHaveBeenCalledWith("join-game", "TESTID", "testName")
	});

	it("should disable the join button to prevent double joining", function(){
		$('#joingamename').val("testName");
		$('#joinroomid').val("testid")
		joinGame();
		expect($('#join').prop("disabled")).toBe(true);;
	});
});

describe("the lobby function", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';

		document.body.insertAdjacentHTML('afterbegin',fixture);
		testGame = {
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
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
		testGame = {}
	});

	it("should display the quit button", function(){
		lobby("testid", testGame);
		expect($('#quit').attr("style")).toEqual("display:block");
	});

	it("should set the cookie with the roomid and the player name", function(){
		$('#thisplayer').val("testName");
		lobby("testid", testGame);
		expect(getCookie("werewolfroomid")).toEqual("testid");
		expect(getCookie("werewolfplayername")).toEqual("testName");
	});

	it("should load the template and insert instructions and players list", function(){
		$('#thisplayer').val("testName");
		lobby("testid", testGame);
		expect($('#room').text()).toEqual("Have your friends join this room: testid");
		expect($.trim($('#playerlist').text())).toEqual("testName");
	});

	it("should display the start game button if there are at least 6 players", function(){
		spyOn($.prototype,"append")
		testGame.players = [
			{socket:"testSocket1", name:"testName1", hangvotes:0, killvotes:[]},
			{socket:"testSocket2", name:"testName2", hangvotes:0, killvotes:[]},
			{socket:"testSocket3", name:"testName3", hangvotes:0, killvotes:[]},
			{socket:"testSocket4", name:"testName4", hangvotes:0, killvotes:[]},
			{socket:"testSocket5", name:"testName5", hangvotes:0, killvotes:[]},
			{socket:"testSocket6", name:"testName6", hangvotes:0, killvotes:[]}
		];
		lobby("testid", testGame)
		expect($.prototype.append).toHaveBeenCalledWith('<p>Press this button when all players are in!</p><button onclick="gameStart()">Start The Game</button>')
	});
});

describe("quit the game", function(){

	beforeEach(function(){
		spyOn(window, 'confirm').and.returnValue(true);
		var fixture = '<div id="fixture">' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';

		document.body.insertAdjacentHTML('afterbegin',fixture);
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should remove the cookies", function(){
		document.cookie = "werewolfroomid=testid; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		document.cookie = "werewolfplayername=testName; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		quit();
		expect(getCookie("werewolfroomid")).toEqual("");
		expect(getCookie("werewolfplayername")).toEqual("");
	});

	it("should emit the quit event with the proper args", function(){
		spyOn(socket,"emit")
		quit();
		expect(socket.emit).toHaveBeenCalledWith('quit', roomid, 'testName')
	});

	it("should remove the quit button", function(){
		quit();
		expect($('#quit').attr("style")).toEqual("display:none");
	});
});

describe("no room found", function(){

	beforeEach(function(){
		var fixture = '<div id="fixture">'+
			'<button id="join" disabled>join</button>' +
		'</div>';

		document.body.insertAdjacentHTML('afterbegin',fixture);
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should enable the join button", function(){
		noRoom();
		expect($('#join').prop("disabled")).toBe(false);
	});
});

describe("when there's no game to rejoin", function(){
	it("should remove the cookies:", function(){
		document.cookie = "werewolfroomid=testid; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		document.cookie = "werewolfplayername=testName; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		rejoinFail();
		expect(getCookie("werewolfroomid")).toEqual("");
		expect(getCookie("werewolfplayername")).toEqual("");
	});
});

describe("start the game", function(){
	it("should emit the start game event", function(){
		spyOn(socket,"emit");
		gameStart();
		expect(socket.emit).toHaveBeenCalledWith("game-start", "testid");
	})
});

describe("the day phase begins", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';
		document.body.insertAdjacentHTML('afterbegin',fixture);

		testGame = {
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
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should remove the quit button", function(){
		day(testGame);
		expect($('#quit').attr("style")).toEqual("display:none");
	});

	it("should indicate to the player if he or she is a wolf", function(){
		$('#thisplayer').val("testwolf");
		testGame.werewolves.push("testwolf");
		day(testGame);
		expect($('#wolf').html()).toEqual("<p>You're a WEREWOLF!</p>");
	});

	it("should display who was killed last night by the wolves", function(){
		testGame.killed = "test victim";
		day(testGame);
		expect($('#nightresults').text()).toEqual("Last night test victim was killed by werewolves!")
	});

	it("should not display a victim if he was saved by the doctor", function(){
		testGame.killed = "test victim";
		testGame.saved = "test victim";
		day(testGame);
		expect($('#nightresults').text()).toEqual("");
	});

	it("should not display a victim if no one is killed", function(){
		day(testGame);
		expect($('#nightresults').text()).toEqual("");
	});

	it("should tell the player if he has been killed and clear the cookies", function(){
		document.cookie = "werewolfroomid=testid; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		document.cookie = "werewolfplayername=testName; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		$('#thisplayer').val("test victim");
		testGame.killed = "test victim";
		day(testGame);
		expect($('#templatecontainer').html()).toEqual("<p>You've been killed by the werewolves!</p>")
		expect(getCookie("werewolfroomid")).toEqual("");
		expect(getCookie("werewolfplayername")).toEqual("");
	});
});

describe("a vote is cast", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';
		document.body.insertAdjacentHTML('afterbegin',fixture);

		testGame = {
			players:[
				{socket:"testSocket", name:"voted", hangvotes:0, killvotes:[]},
				{socket:"testSocket", name:"notVoted", hangvotes:0, killvotes:[]},
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
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should add the clicked class to a button that's been voted for, and not to others", function(){
		day(testGame);
		vote("voted");
		expect($('#voted').hasClass("clicked")).toBe(true);
		expect($('#notVoted').hasClass("clicked")).toBe(false);
	});

	it("should add the voted name to the hidden clicked input", function(){
		day(testGame);
		vote("voted");
		expect($('#clicked').val()).toEqual("voted");
	});
});

describe("the vote is locked", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';
		document.body.insertAdjacentHTML('afterbegin',fixture);

		testGame = {
			players:[
				{socket:"testSocket", name:"voted", hangvotes:0, killvotes:[]},
				{socket:"testSocket", name:"notVoted", hangvotes:0, killvotes:[]},
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
		day(testGame);
		vote("voted");
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should remove the vote locking button", function(){
		lockVote();
		expect($('#votelocker').length).toEqual(0);;
	});

	it("should display the quit button", function(){
		lockVote();
		expect($('#quit').attr("style")).toEqual("display:block");
	});

	it("should emit the vote locked event with the proper args", function(){
		spyOn(socket, "emit");
		lockVote();
		expect(socket.emit).toHaveBeenCalledWith("vote-locked", "voted", "testid");
	});
});

describe("the night phase begins", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';
		document.body.insertAdjacentHTML('afterbegin',fixture);

		testGame = {
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
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should display who was hanged last night by the villagers", function(){
		testGame.hanged = "test victim";
		night(testGame);
		expect($('#dayresults').text()).toEqual("Today test victim was killed by an angry mob!");
	});

	it("should not display a victim if no one is hanged", function(){
		night(testGame);
		expect($('#dayresults').text()).toEqual("");
	});

	it("should display a generic message to villagers and show them the quit button", function(){
		night(testGame);
		expect($('#quit').attr("style")).toEqual("display:block");
		expect($('#pick').html()).toEqual("<p>Night has fallen! So spooky... All you can do is huddle under the covers and wait for daytime!</p>")
	});

	it("should remove the quit button if the player is a wolf", function(){
		testGame.werewolves.push("testName")
		night(testGame);
		expect($('#quit').attr("style")).toEqual("display:none");
	});

	it("should display the kill locker button and add the voted name to the clicked input if this player is a wolf and that name has been chosen by all the wolves", function(){
		testGame.players[0].killvotes.push("a test vote");
		testGame.werewolves.push("testName");
		testGame.docdead = true;
		testGame.sheriffdead = true;
		night(testGame);
		expect($('#clicked').val()).toEqual("testName");
		expect($('#killlocker').length).toEqual(1);
	});

	it("should remove the quit button for the doctor if he hasn't chosen someone to save", function(){
		testGame.doctor = "testName";
		night(testGame);
		expect($('#quit').attr("style")).toEqual("display:none");
	});

	it("should add the quit button and display who is saved for the doctor after he chooses", function(){
		testGame.doctor = "testName";
		testGame.saved = "testName";
		night(testGame);
		expect($('#quit').attr("style")).toEqual("display:block");
		expect($('#results').text()).toEqual("testName is safe from the werewolves tonight.")
	});

	it("should display the results of the sheriff's invesitgation if the player is a wolf", function(){
		testGame.sheriff = "testName";
		testGame.werewolves = "testWolf";
		testGame.accused = "testWolf";
		testGame.investigationcomplete = true;
		night(testGame);
		expect($('#results').text()).toEqual("testWolf IS a werewolf!");
	});

	it("should display the results of the sheriff's invesitgation if the player is a wolf", function(){
		testGame.sheriff = "testName";
		testGame.accused = "testVillager";
		testGame.investigationcomplete = true;
		night(testGame);
		expect($('#results').text()).toEqual("testVillager is NOT a werewolf!");
	});

	it("should display a message, remove the quit button, and clear the cookies if the player was hanged", function(){
		testGame.hanged = "testName"
		document.cookie = "werewolfroomid=testid; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		document.cookie = "werewolfplayername=testName; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		night(testGame);
		expect($('#templatecontainer').html()).toEqual("<p>You were killed by an angry mob of villagers!</p>")
		expect(getCookie("werewolfroomid")).toEqual("");
		expect(getCookie("werewolfplayername")).toEqual("");
		expect($('#quit').attr("style")).toEqual("display:none");
	});
});

describe("a wolf votes to kill someone", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';
		document.body.insertAdjacentHTML('afterbegin',fixture);

		testGame = {
			players:[
				{socket:"testSocket", name:"testName", hangvotes:0, killvotes:["a test vote"]},
				],
			werewolves:["testName"],
			villagers:[],
			totalvotes:0,
			hanged:"none",
			killed:"none",
			saved:"none",
			accused:"none",
			investigationcomplete:false,
			sheriffdead:true,
			docdead:true,
			started:false,
			day:true
		}
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should remove the killlocker button until a response from the server is received to prevent incorrect voting", function(){
		night(testGame);
		expect($('#killlocker').length).toEqual(1);
		kill("testName");
		expect($('#killlocker').length).toEqual(0);
	});

	it('should emit the kill event with the proper args', function(){
		spyOn(socket, "emit");
		night(testGame);
		kill("testName");
		expect(socket.emit).toHaveBeenCalledWith("kill", "testName", "testid");
	});
});

describe("the kill is locked", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';
		document.body.insertAdjacentHTML('afterbegin',fixture);

		testGame = {
			players:[
				{socket:"testSocket", name:"testName", hangvotes:0, killvotes:["a test vote"]},
				],
			werewolves:["testName"],
			villagers:[],
			totalvotes:0,
			hanged:"none",
			killed:"none",
			saved:"none",
			accused:"none",
			investigationcomplete:false,
			sheriffdead:true,
			docdead:true,
			started:false,
			day:true
		}
		night(testGame);
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should remove the kill locker button", function(){
		expect($('#killlocker').length).toEqual(1);
		lockKill();
		expect($('#killlocker').length).toEqual(0);
	});

	it("should display the kill button", function(){
		lockKill();
		expect($('#quit').attr("style")).toEqual("display:block");
	});

	it("should emit the vote locked event with the proper args", function(){
		spyOn(socket, "emit");
		lockKill();
		expect(socket.emit).toHaveBeenCalledWith("kill-locked", "testName", "testid")
	});
});

describe("the doctor picks someone to save", function(){
	it("should emit the doc save event", function(){
		spyOn(socket, "emit");
		docSave("testName");
		expect(socket.emit).toHaveBeenCalledWith("doc-save", "testName", "testid");
	});
});

describe("the sheriff picks someone to accuse", function(){
	it("should emit the sheriff event", function(){
		spyOn(socket, "emit");
		sherPick("testName");
		expect(socket.emit).toHaveBeenCalledWith("sher-pick", "testName", "testid");
	});
});

describe("the wolves have won", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';
		document.body.insertAdjacentHTML('afterbegin',fixture);
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should display the game over message", function(){
		wolfWin("testid");
		expect($('#templatecontainer').html()).toEqual("<p>The wolves now outnumber the villagers, they have taken over the town!</p><p>WEREWOLVES WIN!</p>")
	});

	it("should remove the quit button", function(){
		wolfWin("testid");
		expect($('#quit').attr("style")).toEqual("display:none");
	});

	it("should clear the cookies", function(){
		document.cookie = "werewolfroomid=testid; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		document.cookie = "werewolfplayername=testName; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		wolfWin("testid");
		expect(getCookie("werewolfroomid")).toEqual("");
		expect(getCookie("werewolfplayername")).toEqual("");
	});
});

describe("the villagers have won", function(){
	beforeEach(function(){
		var fixture = '<div id="fixture">' +
			'<div id="templatecontainer"></div>' +
			'<input id="thisplayer" type="hidden" value="testName">' +
			'<button id="quit" style="display:none">test</button>' +
		'</div>';
		document.body.insertAdjacentHTML('afterbegin',fixture);
	});

	afterEach(function() {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it("should display the game over message", function(){
		villageWin("testid");
		expect($('#templatecontainer').html()).toEqual("<p>The werewolves have all been eliminated, the village is safe!</p><p>VILLAGERS WIN!</p>")
	});

	it("should remove the quit button", function(){
		villageWin("testid");
		expect($('#quit').attr("style")).toEqual("display:none");
	});

	it("should clear the cookies", function(){
		document.cookie = "werewolfroomid=testid; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		document.cookie = "werewolfplayername=testName; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/;";
		villageWin("testid");
		expect(getCookie("werewolfroomid")).toEqual("");
		expect(getCookie("werewolfplayername")).toEqual("");
	});
});