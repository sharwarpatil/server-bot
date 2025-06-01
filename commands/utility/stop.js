const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the music and clear the queue"),

  run: async ({ interaction }) => {
    const queue = interaction.client.musicQueues.get(interaction.guild.id);

    if (!queue) {
      return interaction.reply("❌ No music is currently playing!");
    }

    const member = interaction.member;
    if (!member.voice.channel) {
      return interaction.reply(
        "❌ You need to be in a voice channel to stop music!"
      );
    }

    queue.stop();
    if (queue.connection) {
      queue.connection.destroy();
    }
    interaction.client.musicQueues.delete(interaction.guild.id);

    const embed = {
      color: 0xff0000,
      title: "⏹️ Music Stopped",
      description: "Music stopped and queue cleared!",
    };

    await interaction.reply({ embeds: [embed] });
  },
};
