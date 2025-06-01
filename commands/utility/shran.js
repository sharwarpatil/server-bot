const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shran")
    .setDescription("Replies with Shran!"),

  // ✅ This is required for djs-commander to work
  run: async ({ interaction }) => {
    await interaction.reply("Gay ass nigga");
  },
};
