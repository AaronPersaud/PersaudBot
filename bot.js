const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();
const giphy = require('giphy-api')(config.GIPHY_TOKEN);

const prefix = "!";
const prefix2 = "ll!"

const greetings = {0:"Greetings, human!",1:"What it do, baybee?",2:"How you doin'?",3:"May the force be with you"}

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

function remaining(lst) {
  const remaining = [];
  for (var player of players) {
    if(!player.eliminated) {
      remaining.push(player.id.id);
    }
  }
  return remaining;
}

function nextTurn(channelID) {
  const remaining = [];
  for (var player of players) {
          if(!player.eliminated) {
            remaining.push(player.id);
          }
  }
  if (remaining.length === 1 || shuffled.length <= 1) {
    return declareWinner(remaining,channelID);
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

function declareWinner(remaining,channel) {
  const finalCards = {};
  console.log(remaining);
  if (remaining.length === 1) {
    client.channels.cache.get(channel).send(`Since they are the only player remaining, ${remaining[0]} is the winner!`);
  }
  else {
    client.channels.cache.get(channel).send(`Game over! TODO: determine winner.`);
    for (let player of remaining) {
      const lastCard = player[played].slice(-1)[0]
      const entry = parseInt(lastCard.charAt(lastCard.length-2))
      finalCards[player] = entry;
    }   
  }
  //compare scores, highest number wins
  //if tie, compare scores, declare winner 
  //it tie again, declare tie
  shuffled = null;
  setup = false;
  activeGame = false;
  turn = null;
  players.splice(0, players.length);
  ids.splice(0, ids.length);
}

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', function(member) {
  console.log("User " + member.user.username + " has joined the server!");
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
    const num = Math.floor(Math.random() * (Object.keys(greetings).length));
    //message.reply(greetings[num]);
    message.channel.send(`${message.author}: `+greetings[num]);

  }
  else if (command === "gif") {
    // no arguments
    if (args.length > 0) {
      const tag = args.join(' ');
      giphy.random({
      tag: tag,
      }, function (err, res) {
        if (err) { // elaborate on this in future
          message.channel.send(`Something went wrong! Please try again.`);
        }
        else if (res.data.images) {
          const embed = new Discord.MessageEmbed() 
          .setTitle(`Random ${tag} GIF`)
          .setTimestamp()
          .setImage(res.data.images.original.url)
          message.channel.send(embed);
        }
        else {
          message.channel.send(`No gif found found for that filter! Please try a new filter.`);
        }
      });
    }
    else {
      message.channel.send(`Please provide a filter! For example: !gif pokemon`);
    }
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
        card = shuffled[0];
        players[0].hand.push(card);
        players[0].id.send(`You drew ${card}. Your hand is ${players[0].hand}`);
        shuffled.shift();
        client.channels.cache.get(message.channel.id).send(`${players[0].id}, the game has started. It is your turn!`);
        turn = 0;
        console.log(shuffled);
      }
    }
    // add check to make sure only people in the game can start it 
    // cant call activeGame if play is already true
  }
  else if (command === "baron") {
    const remain = remaining(players);
    const opponent = message.mentions.users.first() || null;
    if (!activeGame) {
      message.reply("Game not started as yet! Type ll!play to start the game.")
    }
    else if (!ids.includes(message.author.id)) {
      message.reply(`,you are not in this game! Please wait for the next one.`)
    }
    else if (ids[turn] !== message.author.id) {
      message.reply(`,it is not your turn! It is ${players[turn].id}'s turn.`)
    }
    else if (!players[turn].hand.includes("Baron (3)")) {
      message.reply("You are currently not holding this card!");
    }
    else if (args.length !== 1) {
      message.reply("You are either missing arguments or have too many arguments. Type your command as: ll!baron @player");
    }
    else if (!opponent) {
      message.reply("Please enter a valid user! Type your command as: ll!baron @player");
    }
    else if (!ids.includes(opponent.id)) {
      message.reply("This user is not in the game! Please enter a valid user.");
    }
    else if (!remain.includes(opponent.id)) {
      message.reply("That user has been eliminated! Please choose another user.");
    }
    else if (message.author.id === opponent.id) {
      message.reply("You cannot play baron on yourself! Please choose another user.");
    }
    else if (players[ids.indexOf(opponent.id)].handmaided) {
      message.reply("that user is protected by handmaid! Your card will have no effect.");
      players[turn].played.push(3);
      const index = players[turn].hand.indexOf("Baron (3)");
      players[turn].hand.splice(index,1);
      nextTurn(message.channel.id);
    }
    else {
      players[turn].played.push(3);
      const index = players[turn].hand.indexOf("Baron (3)");
      players[turn].hand.splice(index,1);
      player_card = players[turn].hand[0];
      opponent_card = players[ids.indexOf(opponent.id)].hand[0];
      player_val = parseInt(player_card.charAt(player_card.length-2));
      opponent_val = parseInt(opponent_card.charAt(opponent_card.length-2));
      if (player_val > opponent_val) {
        client.channels.cache.get(message.channel.id).send(`${opponent} has been eliminated since ${opponent_card} has the smaller value`);
        opponent_index = ids.indexOf(opponent.id);
        players[opponent_index].eliminated = true;
      }
      else if (opponent_val > player_val) {
        message.reply(`you have been eliminated since your ${player_card} has the smaller value. Congratulations, you played yourself.`);
        players[turn].eliminated = true;
      } 
      else {
        client.channels.cache.get(message.channel.id).send(`${players[turn].id} and ${opponent} are holding the same card, so no one was eliminated.`);
      }    
      nextTurn(message.channel.id);
    }
  }
  else if (command === "prince") {
    const remain = remaining(players);
    const opponent = message.mentions.users.first() || null;
    if (!activeGame) {
      message.reply("Game not started as yet! Type ll!play to start the game.")
    }
    else if (!ids.includes(message.author.id)) {
      message.reply(`,you are not in this game! Please wait for the next one.`)
    }
    else if (ids[turn] !== message.author.id) {
      message.reply(`,it is not your turn! It is ${players[turn].id}'s turn.`)
    }
    else if (!players[turn].hand.includes("Prince (5)")) {
      message.reply("You are currently not holding this card!");
    }
    else if (args.length !== 1) {
      message.reply("You are either missing arguments or have too many arguments. Type your command as: ll!prince @player");
    }
    else if (!opponent) {
      message.reply("Please enter a valid user! Type your command as: ll!prince @player");
    }
    else if (!ids.includes(opponent.id)) {
      message.reply("This user is not in the game! Please enter a valid user.");
    }
    else if (!remain.includes(opponent.id)) {
      message.reply("That user has been eliminated! Please choose another user.");
    }
    else if (players[ids.indexOf(opponent.id)].handmaided) {
      message.reply("that user is protected by handmaid! You must either choose another player or yourself.");
    }
    else {
      players[turn].played.push(5);
      const index = players[turn].hand.indexOf("Prince (5)");
      players[turn].hand.splice(index,1);
      princed_index = ids.indexOf(opponent.id);
      if (players[princed_index].hand[0] === "Princess (8)") {
        message.channel.send(`${players[princed_index].id} has discarded the Princess. They have been eliminated!`);
        players[princed_index].eliminated = true;
      }
      else {
        const princed = players[princed_index];
        message.channel.send(`${princed.id} has discarded ${princed.hand[0]} and will draw a new card.`);
        princed.hand.shift();
        const new_card = shuffled[0];
        shuffled.shift();
        princed.hand.push(new_card);
        princed.id.send(`Your new card is ${new_card}.`);
      }
      nextTurn(message.channel.id);      
    }
  }
  else if (command === "guard") {
    const remain = remaining(players);
    const opponent = message.mentions.users.first() || null;
    const valid = ['priest','baron','handmaid','prince','king','countess','princess'];
    if (!activeGame) {
      message.reply("Game not started as yet! Type ll!play to start the game.")
    }
    else if (!ids.includes(message.author.id)) {
      message.reply(`,you are not in this game! Please wait for the next one.`)
    }
    else if (ids[turn] !== message.author.id) {
      message.reply(`,it is not your turn! It is ${players[turn].id}'s turn.`)
    }
    else if (!players[turn].hand.includes("Guard (1)")) {
      message.reply("You are currently not holding this card!");
    }
    else if (args.length !== 2) {
      message.reply("You are either missing arguments or have too many arguments. Type your command as: ll!guard @player card");
    }
    else if (!opponent) {
      message.reply("Please enter a valid user! Type your command as: ll!guard @player card");
    }
    else if (!ids.includes(opponent.id)) {
      message.reply("This user is not in the game! Please enter a valid user.");
    }
    else if (!remain.includes(opponent.id)) {
      message.reply("That user has been eliminated! Please choose another user.");
    }
    else if (message.author.id === opponent.id) {
      message.reply("You cannot play guard on yourself! Please choose another user.");
    }
    else if ((args[1]) === "guard") {
      message.reply("You cannot guess guard! Try again.");
    }
    else if (!valid.includes(args[1])) {
      message.reply("Not a valid card! Valid cards are as follows: priest baron handmaid prince king countess princess");
    }
    else if (players[ids.indexOf(opponent.id)].handmaided) {
      message.reply("that user is protected by handmaid! Your card will have no effect.");
      players[turn].played.push(1);
      const index = players[turn].hand.indexOf("Guard (1)");
      players[turn].hand.splice(index,1);
      nextTurn(message.channel.id);
    }
    else {
      opponent_card = players[ids.indexOf(opponent.id)].hand[0];
      converted = opponent_card.split(' ')[0].toLowerCase();
      if (converted === args[1]) {
        message.reply(`you have guessed correctly! ${opponent} is now eliminated.`);
        players[ids.indexOf(opponent.id)].eliminated = true;
      }
      else {
        message.reply(`wrong! ${opponent} was not holding a ${args[1]}.`);
      }
      const index = players[turn].hand.indexOf("Guard (1)");
      players[turn].hand.splice(index,1);
      nextTurn(message.channel.id);
    }
    
  }
  else if (command === "priest") {
    const remain = remaining(players);
    const opponent = message.mentions.users.first() || null;
    if (!activeGame) {
      message.reply("Game not started as yet! Type ll!play to start the game.")
    }
    else if (!ids.includes(message.author.id)) {
      message.reply(`,you are not in this game! Please wait for the next one.`)
    }
    else if (ids[turn] !== message.author.id) {
      message.reply(`,it is not your turn! It is ${players[turn].id}'s turn.`)
    }
    else if (!players[turn].hand.includes("Priest (2)")) {
      message.reply("You are currently not holding this card!");
    }
    else if (args.length !== 1) {
      message.reply("You are either missing arguments or have too many arguments. Type your command as: ll!priest @player");
    }
    else if (!opponent) {
      message.reply("Please enter a valid user! Type your command as: ll!priest @player");
    }
    else if (!ids.includes(opponent.id)) {
      message.reply("This user is not in the game! Please enter a valid user.");
    }
    else if (!remain.includes(opponent.id)) {
      message.reply("That user has been eliminated! Please choose another user.");
    }
    else if (message.author.id === opponent.id) {
      message.reply("You cannot play priest on yourself! Please choose another user.");
    }
    else if (players[ids.indexOf(opponent.id)].handmaided) {
      message.reply("that user is protected by handmaid! Your card will have no effect.");
      players[turn].played.push(2);
      const index = players[turn].hand.indexOf("Priest (2)");
      players[turn].hand.splice(index,1);
      nextTurn(message.channel.id);
    }
    else {
      message.reply(`you have been shown ${opponent}'s card in private!`);
      players[turn].id.send(`${opponent} is current holding ${players[ids.indexOf(opponent.id)].hand[0]}.`);
      players[turn].played.push(2);
      const index = players[turn].hand.indexOf("Priest (2)");
      players[turn].hand.splice(index,1);
      nextTurn(message.channel.id);
    }
  }
  else if (command === "king") {
    const remain = remaining(players);
    const opponent = message.mentions.users.first() || null;
    if (!activeGame) {
      message.reply("Game not started as yet! Type ll!play to start the game.")
    }
    else if (!ids.includes(message.author.id)) {
      message.reply(`,you are not in this game! Please wait for the next one.`)
    }
    else if (ids[turn] !== message.author.id) {
      message.reply(`,it is not your turn! It is ${players[turn].id}'s turn.`)
    }
    else if (!players[turn].hand.includes("King (6)")) {
      message.reply("You are currently not holding this card!");
    }
    else if (args.length !== 1) {
      message.reply("You are either missing arguments or have too many arguments. Type your command as: ll!king @player");
    }
    else if (!opponent) {
      message.reply("Please enter a valid user! Type your command as: ll!king @player");
    }
    else if (!ids.includes(opponent.id)) {
      message.reply("This user is not in the game! Please enter a valid user.");
    }
    else if (!remain.includes(opponent.id)) {
      message.reply("That user has been eliminated! Please choose another user.");
    }
    else if (message.author.id === opponent.id) {
      message.reply("You cannot play king on yourself! Please choose another user.");
    }
    else if (players[ids.indexOf(opponent.id)].handmaided) {
      message.reply("that user is protected by handmaid! Your card will have no effect.");
      players[turn].played.push(6);
      const index = players[turn].hand.indexOf("King (6)");
      players[turn].hand.splice(index,1);
      nextTurn(message.channel.id);
    }
    else {
      players[turn].played.push(6);
      const index = players[turn].hand.indexOf("King (6)");
      players[turn].hand.splice(index,1);
      player_card = players[turn].hand[0];
      opponent_card = players[ids.indexOf(opponent.id)].hand[0];
      players[turn].hand.shift();
      players[ids.indexOf(opponent.id)].hand.shift();
      players[turn].hand.push(opponent_card);
      players[ids.indexOf(opponent.id)].hand.push(player_card);
      message.reply(`you and ${opponent} have swapped cards!`);
      players[turn].id.send(`You now have ${opponent_card} and ${opponent} now has ${player_card}.`);
      //send card to opponent as well 
      nextTurn(message.channel.id);
    }
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
  else if (command === "countess") {
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
    else if (!players[turn].hand.includes("Countess (7)")) {
      message.reply("You are currently not holding this card!");
    }
    else {
      message.reply("You have played the countess.");
      players[turn].played.push(7);
      const index = players[turn].hand.indexOf("Countess (7)");
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
// on changeturn, display both cards they're holding
// make prince and king force you to discard countess
// you can only enter commands into the channel