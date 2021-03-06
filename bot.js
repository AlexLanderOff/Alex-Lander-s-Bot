process.on('unhandledRejection', (reason, p) => {
  unhandledRejections.set(p, reason);
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('rejectionHandled', (p) => {
  unhandledRejections.delete(p);
});

process.on('uncaughtException', (err) => {
  console.error("[" + new Date() + "] Uncaught exception Error: \n" + err.stack);
});

process.on('warning', (warning) => {
  console.warn(warning.stack);
});


const unhandledRejections = new Map();
var Discord = require("discord.js");
var ytdl = require('ytdl-core');
var opus = require('opusscript');
var searchYT = require('youtube-search');
const fs = require("fs");
const sql = require('sqlite');
sql.open('./db.sqlite');
const auth = require('./auth.json')
const info = require('./info.json')
var post_dBots = false;

exports.Discord = Discord;
exports.searchYT = searchYT;
exports.ytdl = ytdl;
exports.fs = fs;
exports.sql = sql;

var talkedRecently = [];
exports.talkedRecently = talkedRecently;

var speakerPhoneConnections = {};
exports.speakerPhoneConnections = speakerPhoneConnections;

var speakerPhoneSearching = [];
exports.speakerPhoneSearching = speakerPhoneSearching;

var commands = new Array();

exports.commands = commands;

if (post_dBots) {
  const dBotsAPI = require('discord-bots-api');
  const dBots = new dBotsAPI(auth["discord-bots-token"]);
};


var cleverbot = require("cleverbot.io");
var CBOT = new cleverbot(auth["cleverbot-token"], auth["cleverbot-password"]);
exports.CBOT = CBOT;
var unirest = require('unirest');
exports.unirest = unirest;
var bot = new Discord.Client();
exports.bot = bot;
var botToken = auth["bot-token"];
var botId = "442784146998427663";

var isRestartSure = false;
exports.isRestartSure = isRestartSure;
// Makes my life 100x easier.
var myServerId = "422074759581270027";

// MUSIC PART APPLICATION LINK
var musQueue = {};

// Dont touch pls
var canPrune = true;

var magicEightBall = new Array(
  'As I see it, yes',
  'Better not tell you now',
  'Cannot predict now',
  'Don\'t count on it',
  'If you say so',
  'In your dreams',
  'It is certain',
  'Most likely',
  'Out of psychic coverage range',
  'Signs point to yes',
  'Sure, sure',
  'Shake harder and ask again',
  'Sorry, Ask again',
  'Ask again later',
  'Very doubtful',
  'Without a doubt',
  'Yes, definitely',
  'You can\'t handle the truth',
  'Sadly, we say no.',
  'I don\'t approve',
  'I don\t agree.',
  'null result.',
  'Answer = true',
  'Answer = false'
)

//-----------------------------------------------
exports.globalAdmin = new Array(
  "178542844171124736" // Thomas (me)
)

exports.musQueue = musQueue;
exports.magicEightBall = magicEightBall;
//-----------------------------------------------

var flipACoin = new Array(
  "Heads",
  "Tails"
)

exports.flipACoin = flipACoin;

var rollADice = new Array(
  "1",
  "2",
  "3",
  "4",
  "5",
  "6"
)

exports.rollADice = rollADice;

// Ready
bot.on('ready', () => {

  if (bot.shard) {
    if (bot.shard.count === 0) {
      console.log(`\n\nNo Shard ||| ${bot.guilds.size} servers`);
    } else {
      console.log(`\n\nShard #${bot.shard.id + 1}/${bot.shard.count}  ||| (${bot.guilds.size} servers)`);
    };
  } else {
    console.log(`\n\nNo Shard ||| ${bot.guilds.size} servers`);
  };

  fs.readdir('./commands/', (err, files) => {
    if (err) console.error(err);
    var size = files.length + 4; // + 4 for the four commands that are not in their own files and use collectors instead.
    console.log("Commands> Loading " + size + " commands!");
    files.forEach(f => {
      commands.push(f.replace(".js", ""));
    });

    commands.push("volume");
    commands.push("skip");    // These commands
    commands.push("pause");   // use collectors.
    commands.push("resume");
  });

  console.log('\n\n');

  CBOT.setNick("Auroria-DBOTSession");
  CBOT.create(function (err, session) {
    console.log("Cleverbot> Initialized");
  });

  sql.run('CREATE TABLE IF NOT EXISTS db (guildID TEXT, prefix TEXT, joinleave TEXT, joinleaveid TEXT, invites TEXT)').then(() => {
    console.log("SQL> DB Table ready!");
  });

  sql.run('CREATE TABLE IF NOT EXISTS blacklist (guildID TEXT, reason TEXT, blacklister TEXT)').then(() => {
    console.log("SQL> Blacklist Table ready!");
  });

  if (post_dBots) {
    dBots.postStats(bot.user.id, bot.guilds.size)
      .then(() => { console.log("Discord Bots> Set server_count to " + bot.guilds.size + ".") });
  };


  setTimeout(function () {
    console.log("Setting game.");
    bot.user.setActivity("Prefix: ;- | invite.gg/landers")
      .then(console.log("Set game to Prefix: ;- | invite.gg/landers"));
  }, 5000);

  setInterval(function () {

    if (Object.keys(speakerPhoneSearching).length >= 2) {

      let guildOne = Object.keys(speakerPhoneSearching)[0];
      let guildTwo = Object.keys(speakerPhoneSearching)[1];

      let chanOne = speakerPhoneSearching[Object.keys(speakerPhoneSearching)[0]];
      let chanTwo = speakerPhoneSearching[Object.keys(speakerPhoneSearching)[1]];

      bot.guilds.get(guildOne).channels.get(chanOne).sendMessage(":telephone_receiver: **" + bot.guilds.get(guildTwo).name + "** has picked up! Say hi!");
      bot.guilds.get(guildTwo).channels.get(chanTwo).sendMessage(":telephone_receiver: **" + bot.guilds.get(guildOne).name + "** has picked up! Say hi!");

      speakerPhoneConnections[guildOne] = guildTwo;
      speakerPhoneConnections[guildOne + "-channel"] = chanTwo;
      speakerPhoneConnections[guildTwo] = guildOne;
      speakerPhoneConnections[guildTwo + "-channel"] = chanOne;


      speakerPhoneSearching = speakerPhoneSearching.splice(Object.keys(speakerPhoneSearching)[0], 1);
      speakerPhoneSearching = speakerPhoneSearching.splice(Object.keys(speakerPhoneSearching)[1], 1);
      exports.speakerPhoneSearching = speakerPhoneSearching;
    }
  }, 3000);
});

bot.on("guildMemberAdd", member => {
  if (member.guild.id == "110373943822540800" || member.guild.id == "281930461461348353") {
    return;
  }

  var enabled;
  var chan;

  sql.get(`SELECT * FROM db WHERE guildID ='${member.guild.id}'`).then(row => {
    if (!row) {
      enabled = "on";
      chan = member.guild.defaultChannel.id;
    } else {
      enabled = row.joinleave;
      chan = row.joinleaveid;
    }

    if (member.guild.channels.get(chan) == undefined || typeof member.guild.channels.get(chan) == "undefined") {
      chan = member.guild.defaultChannel.id;
      sql.run(`UPDATE db SET joinleaveid = '${member.guild.defaultChannel.id}' WHERE guildID = '${member.guild.id}'`);
    }

    if (enabled == "on") {
      member.guild.channels.get(chan).sendMessage("Welcome, <@" + member.id + ">, to **" + member.guild.name + "**!");
      return;
    } else {
      return;
    }
  });
});

bot.on("guildMemberRemove", member => {
  if (member.guild.id == "110373943822540800" || member.guild.id == "281930461461348353") {
    return;
  }

  var enabled;
  var chan;

  sql.get(`SELECT * FROM db WHERE guildID ='${member.guild.id}'`).then(row => {
    if (!row) {
      enabled = "on";
      chan = member.guild.defaultChannel.id;
    } else {
      enabled = row.joinleave;
      chan = row.joinleaveid;
    }

    if (member.guild.channels.get(chan) == undefined || typeof member.guild.channels.get(chan) == "undefined") {
      chan = member.guild.defaultChannel.id;
      sql.run(`UPDATE db SET joinleaveid = '${member.guild.defaultChannel.id}' WHERE guildID = '${member.guild.id}'`);
    }

    if (enabled == "on") {
      member.guild.channels.get(chan).sendMessage(member.user.username + "#" + member.user.discriminator + ", has left the guild! ;( Bye, bye!");
      return;
    } else {
      return;
    }
  });
});

bot.on("guildCreate", guild => {
  if (guild.name.includes("@everyone")) {
    console.log("\n\nAnother @everyone guild.\n\n"); // just because
    guild.leave();
    return;
  }

  if (guild.id == "110373943822540800") {
    return
  }

  setTimeout(function () {
    if (!guild.member(bot.user.id).hasPermission("ADMINISTRATOR")) {
      guild.defaultChannel.sendMessage("I require administrator permissions to run properly. I do not have those, please re-invite me using the following url if you wish to use me. I will disconnect now- http://xrubyy.xyz/bot")
        .then(() => guild.leave());
      return;
    }
  }, 2500);

  if (post_dBots) {
    dBots.postStats(bot.user.id, bot.guilds.size)
      .then(() => { console.log("Discord Bots> Set server_count to " + bot.guilds.size + ".") });
  };

  console.log("JOIN >>> I have just joined " + guild.name + "!");
  if (guild.members.size >= 50 && guild.members.size < 100) {
    console.log("We are on a LARGE guild (More than 50 members - " + guild.name + ").");
  }

  if (guild.members.size >= 100) {
    console.log("I am on an EXTRA LARGE guild (More than 100 members - " + guild.name + ").")
  }

  //BLACKLIST START
  sql.get(`SELECT * FROM blacklist WHERE guildID ='${guild.id}'`).then(row => {
    if (!row) {
      bot.guilds.get("280307031016079361").channels.get("280311592070021120").sendMessage("**[Server Join]**\n**Name:** `" + guild.name + "`.\n**Member Count:** " + guild.members.size + ".");
      guild.defaultChannel.sendMessage("**Hello**! Thank you for adding me to your server.\nI am a Bot created by **Alex Lander**! (*See ;-credits*).\nI have lots of features and commands to assist you! (*See ;-commands*).");
      return;
    } else {
      let guild = bot.guilds.get(row.guildID);
      let reason = row.reason;

      if (guild != null) {
        const blacklistedEmbed = new Discord.RichEmbed()
          .setTitle('')
          .setAuthor(bot.user.username, bot.user.avatarURL)
          .setColor([255, 28, 28])
          .setDescription(`This server (**${guild.name}**) is **blacklisted** from using this bot.\n**Blacklisted By:**${row.blacklister}\n**Reason:**${reason}`)
          .setFooter('', '')
          .setImage("")
          .setThumbnail("")
          .setTimestamp('')
          .setURL('');

        console.log("BLACKLIST >>> I am on blacklisted server " + guild.name + "!");
        guild.defaultChannel.sendEmbed(blacklistedEmbed, '', { disableEveryone: true });

        setTimeout(function () {
          guild.leave()
            .then(console.log("BLACKLIST HANDLED >>> I have left the blacklisted server: " + guild.name + "!\n"));
        }, 2000);
        return;
      }
    }
  });
  //BLACKLIST END
});

bot.on("guildDelete", guild => {
  if (guild.name.includes("@everyone")) {
    return;
  }

  if (post_dBots) {
    dBots.postStats(bot.user.id, bot.guilds.size)
      .then(() => { console.log("Discord Bots> Set server_count to " + bot.guilds.size + ".") });
  };

  if (guild.id == "110373943822540800") {
    return
  }

  console.log("I have just left " + guild.name + "!");
  let isBlacklisted = false;

  sql.get(`SELECT * FROM blacklist WHERE guildID = '${guild.id}'`).then(row => {
    if (row) {
      return;
    } else {
      guild.owner.sendMessage(`**Hello**,\nI just noticed that I was kicked/left from your server (**${guild.name}**).\nWas there something wrong with the bot? A bug? A feature was missing that you wanted? You didn't like a certain feature?\nI'd like you to tell me. If you can, please write (In this DM) why you didn't want me on your server. Thanks\n-Thomas.`);
      bot.guilds.get("280307031016079361").channels.get("280311592070021120").sendMessage("**[Server Leave]**\n**Name:** `" + guild.name + "`.\n**Member Count:** " + guild.members.size + ".");
      return;
    }
  });
});

bot.on("error", error => {
  console.log("Caught Error: " + error);
});

// Message event
bot.on("message", msg => {
  if (msg.channel.type == "dm" || msg.channel.type == "group") {
    if (msg.author.id == botId) {
      return;
    }

    console.log(msg.author.username + " (" + msg.author.id + ") said on DM: " + msg.content);
    return;
  }

  if (msg.author.bot) return;

  sql.get(`SELECT * FROM db WHERE guildID ='${msg.guild.id}'`).then(row => {
    var cmd = "";
    var invites;

    if (!row) {
      sql.run('INSERT INTO db (guildID, prefix, joinleave, joinleaveid, invites) VALUES (?, ?, ?, ?, ?)', [msg.guild.id, ";-", "on", undefined, "on"]);
      cmd = ";-";
    } else {
      if (row.prefix == null || row.prefix == undefined) {
        cmd = ";-";
      } else {
        cmd = row.prefix;
      }
    }

    invites = row.invites;

    //--------------------------------------------------------------------------------------------------------------------------

    if (msg.content.toLowerCase().indexOf("discord.gg") != -1) {
      if (invites != "off" || invites == undefined || typeof invites == "undefined") {
        if (msg.guild.id != "110373943822540800" && msg.guild.member(msg.author).roles.find("name", "Staff") == undefined) {
          msg.delete();
          msg.channel.sendMessage('Advertising other discord servers is not allowed! (DM your friends if you need to send an invite link, **' + msg.author.username + "#" + msg.author.discriminator + "**)");
          return;
        }
      }
    }

    // Lenny
    if (msg.content.toLowerCase().indexOf("(lenny)") != -1) {
      if (msg.guild.id != "110373943822540800") {
        msg.channel.sendMessage("**( ͡° ͜ʖ ͡° )**");
        return;
      }
    }

    if (msg.mentions.users.first() != null || msg.mentions.users.first() != undefined) {
      if (!msg.content.startsWith(cmd) && msg.mentions.users.first().id == bot.user.id) {
        if (msg.content.replace("<@" + msg.mentions.users.first().id + "> ", "") == "prefix") {
          msg.reply("This server's prefix: '" + cmd + "'.");
        } else if (msg.content.replace("<@" + msg.mentions.users.first().id + "> ", "") == "globaladmins") {
          let toSend = [];

          for (i = 0; i < this.globalAdmin.length; i++) {
            let user = bot.users.get(this.globalAdmin[i]);
            toSend.push(user.username + "#" + user.discriminator);
          }

          msg.reply("Global Admins: " + toSend.join(", "));
        } else if (msg.content.replace("<@" + msg.mentions.users.first().id + "> ", "") == "<@" + msg.mentions.users.first().id + ">") {
          msg.reply("Mention commands: prefix, globaladmins");
        }
      }
    }

    //--------------------------------------------------------------------------------------------------------------------------


    // WILL NO LONGER WORK IF SHARDED
    // MOVE TO SQL
    if (speakerPhoneConnections[msg.guild.id] != undefined && speakerPhoneConnections[msg.guild.id + "-channel"] != undefined) {
      if (bot.guilds.get(speakerPhoneConnections[msg.guild.id]) != undefined) {

        if (!bot.guilds.get(speakerPhoneConnections[msg.guild.id]).available) {
          msg.reply("Oops! There must be a server outage, their server isn't responding! Hanging up.");
          speakerPhoneConnections[speakerPhoneConnections[msg.guild.id]] = null;
          speakerPhoneConnections[speakerPhoneConnections[msg.guild.id + "-channel"]] = null;

          speakerPhoneConnections[msg.guild.id] = null;
          speakerPhoneConnections[msg.guild.id + "-channel"] = null;
          return;
        }

        if (msg.channel.id == speakerPhoneConnections[speakerPhoneConnections[msg.guild.id]]) {
          if (this.globalAdmin.indexOf(msg.author.id) != -1) {
            bot.guilds.get(speakerPhoneConnections[msg.guild.id]).channels.get(speakerPhoneConnections[msg.guild.id + "-channel"]).sendMessage(":telephone_receiver: :star: **" + msg.author.username + "#" + msg.author.discriminator + "**: " + msg.content);
          } else {
            bot.guilds.get(speakerPhoneConnections[msg.guild.id]).channels.get(speakerPhoneConnections[msg.guild.id + "-channel"]).sendMessage(":telephone_receiver: **" + msg.author.username + "#" + msg.author.discriminator + "**: " + msg.content);
          }
        }
      }
    }

    // Commands
    var args = msg.content.slice(cmd.length).split(" ");

    if (!msg.content.startsWith(cmd)) return;

    if (commands.indexOf(args[0]) != -1) {
      if (talkedRecently.includes(msg.author.id)) {
        msg.channel.sendMessage(msg.author.username + "- Please don't run commands so quickly.");
        return;
      } else {
        talkedRecently.push(msg.author.id);
        setTimeout(() => {
          const index = talkedRecently.indexOf(msg.author.id);
          talkedRecently.splice(index, 1);
        }, 2500);
      }

      let index = commands.indexOf(args[0]);

      if (args[0] == "skip" || args[0] == "volume" || args[0] == "resume" || args[0] == "pause") return;

      var file = require("./commands/" + commands[index] + ".js");

      file.run(msg);
      if (bot.shard == null) {
        console.log("[" + new Date(msg.createdTimestamp).toLocaleTimeString() + "] Commands> " + msg.author.username + " ran the " + args[0] + " command on " + msg.guild.name + ".");
      } else {
        var id = bot.shard.id + 1;
        console.log("\x1b[32m" + id + "\x1b[37m ||| [" + new Date(msg.createdTimestamp).toLocaleTimeString() + "] Commands> " + msg.author.username + " ran the " + args[0] + " command on " + msg.guild.name + ".");
      }
      return;
    }
  });
});

// And finally, login.
bot.login(botToken);