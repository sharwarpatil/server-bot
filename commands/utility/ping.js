const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  // ✅ This is required for djs-commander to work
  run: async ({ interaction }) => {
    await interaction.reply("Hello!");
  },
};
