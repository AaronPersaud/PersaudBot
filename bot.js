const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const prefix = "!";
const prefix2 = "ll!"

var deck = new Array("Guard (1)","Guard (1)","Guard (1)","Guard (1)","Guard (1)","Priest (2)","Priest (2)","Baron (3)","Baron (3)","Handmaid (4)", "Handmaid (4)", "Prince (5)","Prince (5)","King (6)","Countess (7)", "Princess (8)");
let shuffled = null;

let setup = false;
let activeGame = false;
let turn = null;

const players = [];
const ids = [];

//Fisher-Yates shuffling algorithm (returns new array)
function shuffle(arr) {
  let array = [...arr]; 
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function nextTurn(channelID) {
  const remaining = [];
  for (var player of players) {
          if(!player.eliminated) {
            remaining.push(player.id);
          }
  }
  if (remaining.length === 1 || deck.length <= 1) {
    return declareWinner(remaining);
  }
  while(true) {
    if (turn === players.length - 1) {
      turn = 0;
    }
    else {
      turn += 1;
    }
    if (remaining.includes(players[turn].id)) {
      break;
    } 
  }
  players[turn].handmaided = false;
  players[turn].hand.push(shuffled[0]);
  players[turn].id.send(`You have drawn ${shuffled[0]}. It is your turn!`);
  shuffled.shift();
  client.channels.cache.get(channelID).send(`It is ${players[turn].id}'s turn!`);
}

function declareWinner(remaining) {
  //check 1 player left, he/she wins
  //compare scores, highest number wins
  //if tie, compare scores, declare winner 
  //it tie again, declare tie
  //reset variables 
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

  // if (command === "ping") {
  //   const timeTaken = Date.now() - message.createdTimestamp;
  //   message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  // }

  // else if (command === "sum") {
  //   const numArgs = args.map(x => parseFloat(x));
  //   const sum = numArgs.reduce((counter, x) => counter += x);
  //   message.reply(`The sum of all the arguments you provided is ${sum}!`);
  // }
  if (command === "hello") {
    message.reply(`Greetings, human!`);
  }
  else if (command === "start") {
    if (setup) {
      message.reply(`Game already in progress!`);
    }
    else {
      message.reply(`Starting new game of Love Letter. Type ll!join to join the game.`);
      setup = true;
    }
  }
  else if (command === "join") {
    if (!setup) {
      message.reply(`No game in progress! Type ll!start to start a game`);
    }
    else if (activeGame) {
      message.reply(`Game already in progress. Please wait for the next one.`);
    }
    else {
      if (ids.includes(message.author.id)) {
        message.reply(`You are already in the game!`);
      }
      else if (players.length === 4) {
        message.reply(`Maximum number of players reached!`);
      }
      else {
        client.channels.cache.get(message.channel.id).send(`${message.author} joins the game!`);
        let data = {"hand":[],"played":[],"eliminated":false,"handmaided":false,"id":message.author};
        players.push(data);
        ids.push(message.author.id);
      }    
    }
  }
  else if (command === "play") {
    if (!setup) {
      message.reply(`No game in progress! Type ll!start to start a game`);
    }
    else {
      if (players.length <= 1) {
        message.reply(`Not enough players! Love Letter requires 2-4 players.`);
      }
      else {
        activeGame = true;
        shuffled = shuffle(deck);
        console.log(deck);
        console.log(shuffled);
        for (var player of players) {
          player.id.send(`You have drawn ${shuffled[0]}`);
          player.hand.push(shuffled[0]);
          shuffled.shift();
        }
        client.channels.cache.get(message.channel.id).send(`${players[0].id}, the game has started. It is your turn!`);
        turn = 0;
        console.log(shuffled);
      }
    }
    // add check to make sure only people in the game can start it 
    // cant call activeGame if play is already true
  }
  else if (command === "guard") {
    // is it your turn?
    // have the card
    // game started
    // are you in the game
    // arguments
    // wrong argument
    // check if opponent not eliminated
    // handmaid check
    // logic (check if player's card is equal to guess)
  }
  else if (command === "priest") {
    // is it your turn?
    // have the card
    // game started
    // are you in the game
    // arguments
    // wrong argument
    // check if opponent is not eliminated
    // handmaid check
    // logic (send player card name)
  }
  else if (command === "king") {
    // is it your turn?
    // have the card
    // game started
    // are you in the game
    // arguments
    // wrong argument
    // check if opponent is not eliminated
    // handmaid check
    // logic (switch hands)
  }
  else if (command === "handmaid") {
    if (!activeGame) {
      message.reply("Game not started as yet! Type ll!play to start the game.")
    }
    else if (!ids.includes(message.author.id)) {
      message.reply(`,you are not in this game! Please wait for the next one.`)
    }
    else if (ids[turn] !== message.author.id) {
      message.reply(`,it is not your turn! It is ${players[turn].id}'s turn.`)
    }
    else if (args.length > 0) {
      message.reply("No arguments are necessary for this card");
    }
    else if (!players[turn].hand.includes("Handmaid (4)")) {
      message.reply("You are currently not holding this card!");
    }
    else {
      message.reply("You are now protected for this round");
      players[turn].handmaided = true;
      players[turn].played.push(4);
      const index = players[turn].hand.indexOf("Handmaid (4)");
      players[turn].hand.splice(index,1);
      nextTurn(message.channel.id);
    }
  }
});

client.login(config.BOT_TOKEN);

//TODO
// - make it work in multiple servers at once
// - let player player in multiple servers at once
// - timeout
// leave game
// stop game