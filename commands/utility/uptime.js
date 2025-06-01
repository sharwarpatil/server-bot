const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Replies with client uptime!"),
  run: async ({ interaction }) => {
    const uptime = interaction.client.uptime;
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hour = Math.floor((uptime / (1000 * 60 * 60)) % 60);
    const days = Math.floor((uptime / (1000 * 60 * 60 * 24)) % 60);
    const uptimestring = `${days}days  ${hour}hour ${minutes}minutes  ${seconds}seconds`;
    await interaction.reply(`Uptime : ${uptimestring}`);
  },
};
