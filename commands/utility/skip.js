const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),

  run: async ({ interaction }) => {
    const queue = interaction.client.musicQueues.get(interaction.guild.id);

    if (!queue || !queue.playing) {
      return interaction.reply("❌ No music is currently playing!");
    }

    const member = interaction.member;
    if (!member.voice.channel) {
      return interaction.reply(
        "❌ You need to be in a voice channel to skip songs!"
      );
    }

    const currentSong = queue.currentSong;
    queue.skip();

    const embed = {
      color: 0xff9900,
      title: "⏭️ Song Skipped",
      description: currentSong
        ? `Skipped: **${currentSong.title}**`
        : "Skipped current song",
    };

    await interaction.reply({ embeds: [embed] });
  },
};
