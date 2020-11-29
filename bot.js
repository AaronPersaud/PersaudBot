const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const prefix = "!";
const prefix2 = "ll!"

var deck = new Array(1,1,1,1,1,2,2,3,3,4,4,5,5,6,7,8)

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(deck)
console.log(deck)

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

  console.log(args)
  console.log(command)

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
    message.reply(`Greetings, human!`)
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