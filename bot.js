const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const prefix = "!";
const prefix2 = "ll!"

//var deck = new Array(1,1,1,1,1,2,2,3,3,4,4,5,5,6,7,8)

let setup = false;
let activeGame = false;

const players = [];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', function(member) {
  console.log("User " + member.user.username + " has joined the server!");
  // send custom message TODO
  member.send(`Welcome to the server, scrub!`);
  const general = member.guild.channels.cache.find(c => c.name === "general");
  if (general) general.send(`Welcome ${member.user.username}! We're glad to have you here.`);
});

client.on("message", function(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix) && !message.content.startsWith(prefix2)) return;
  var commandBody = null
  if (message.content.startsWith(prefix)) {
    commandBody = message.content.slice(prefix.length);
  }
  else {
    commandBody = message.content.slice(prefix2.length);
  }
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  // console.log(args)
  // console.log(command)

  if (command === "ping") {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  }

  else if (command === "sum") {
    const numArgs = args.map(x => parseFloat(x));
    const sum = numArgs.reduce((counter, x) => counter += x);
    message.reply(`The sum of all the arguments you provided is ${sum}!`);
  }
  else if (command === "hello") {
    message.reply(`Greetings, human!`);
  }
  else if (command === "start") {
    if (setup) {
     
     let activeGame = false; message.reply(`Game already in progress!`);
    }
    else {
      message.reply(`Starting new game of Love Letter. Type ll!join to join the game.`);
      setup = true;

let activeGame = false;    }
  }
  else if (command === "join") {
    if (!setup) {
     
     let activeGame = false; message.reply(`No game in progress! Type ll!start to start a game`);
    }
    else if (activeGame) {
      message.reply(`Game already in progress. Please wait for the next one.`);
    }
    else {
      if (players.length === 4) {
        message.reply(`Maximum number of players reached!`);
      }
      else {
        client.channels.cache.get(message.channel.id).send(`${message.author} joins the game!`);
        players.push(message.author);
      }    
    }
  }
  else if (command === "play") {
    if (!setup) {
     
     let activeGame = false; message.reply(`No game in progress! Type ll!start to start a game`);
    }
    else {
      if (players.length <= 1) {
        message.reply(`Not enough player! Love Letter requires 2-4 players.`);
      }
      else {
        activeGame = true;
        var deck = new Array("Guard (1)","Guard (1)","Guard (1)","Guard (1)","Guard (1)","Priest (2)","Priest (2)","Baron (3)","Baron (3)","Handmaid (4)", "Handmaid (4)", "Prince (5)","Prince (5)","King (6)","Countess (7)", "Princess (8)");
        shuffle(deck);
        // Deal cards out
        // Message each player their card
        players[0].send(`You have drawn ${deck[0]}`);
        client.channels.cache.get(message.channel.id).send(`${players[0]}, the game has started. It is your turn!`);
      }
    }
  }
  else if (command === "handmaid") {
    if (args.length > 0) {
      message.reply("No arguments are necessary for this card");
    }
    // need case for if you don't have it
    else {
      message.reply("You are now protected for this round");
      // set some variable to true
    }
  }
});

client.login(config.BOT_TOKEN);