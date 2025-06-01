// require("dotenv/config");
// const fs = require("node:fs");
// const path = require("node:path");
// const { Client, Collection, IntentsBitField } = require("discord.js");
// const { CommandHandler } = require("djs-commander");
// const client = new Client({
//   intents: [
//     IntentsBitField.Flags.Guilds,
//     IntentsBitField.Flags.GuildMembers,
//     IntentsBitField.Flags.GuildMessages,
//     IntentsBitField.Flags.MessageContent,
//   ],
// });

// client.commands = new Collection();

// new CommandHandler({
//   client,
//   eventsPath: path.join(__dirname, "events"),
//   commandsPath: path.join(__dirname, "commands"),
// });

// client.once("ready", () => {
//   console.log(`Logged in as ${client.user.tag}`);
// });

// // ✅ Login
// client.login(process.env.DISCORD_CLIENT_TOKEN);
require("dotenv/config");
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, IntentsBitField } = require("discord.js");
const { CommandHandler } = require("djs-commander");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates, // Required for voice functionality
  ],
});

client.commands = new Collection();
client.musicQueues = new Collection(); // Store music queues for each guild

new CommandHandler({
  client,
  eventsPath: path.join(__dirname, "events"),
  commandsPath: path.join(__dirname, "commands"),
});

client.once("ready", () => {
  console.log(`🎵 Music Bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_CLIENT_TOKEN);
