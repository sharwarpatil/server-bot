const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Replies with server info!"),

  run: async ({ interaction }) => {
    const guild = interaction.guild;
    await interaction.reply(
      `🏠 Server name: ${guild.name}\n👥 Member count: ${guild.memberCount}`
    );
  },
};
