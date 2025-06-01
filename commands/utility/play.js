// commands/utility/play.js - PLAY-DL VERSION (Updated)
const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const { MusicQueue } = require("../../utils/musicQueue");
const { search, video_basic_info, validate } = require("play-dl");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Song name or YouTube URL")
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    try {
      const query = interaction.options.getString("query");
      const member = interaction.member;
      const voiceChannel = member.voice.channel;

      if (!voiceChannel) {
        return interaction.reply(
          "❌ You need to be in a voice channel to play music!"
        );
      }

      // Check if bot has permissions
      const permissions = voiceChannel.permissionsFor(interaction.client.user);
      if (!permissions.has(["Connect", "Speak"])) {
        return interaction.reply(
          "❌ I need permission to connect and speak in your voice channel!"
        );
      }

      await interaction.deferReply();

      console.log(`Searching for: ${query}`);

      // Search for the song with better error handling
      let songInfo;
      let songUrl;

      try {
        // Check if it's a direct YouTube URL
        const urlValidation = validate(query);

        if (urlValidation === "yt_video") {
          console.log("Direct YouTube URL detected");
          songUrl = query;

          // Get video info using play-dl
          const videoInfo = await video_basic_info(query);
          songInfo = {
            title: videoInfo.video_details.title,
            url: query,
            durationInSec: videoInfo.video_details.durationInSec,
            thumbnails: videoInfo.video_details.thumbnails,
          };
        } else {
          console.log("Searching YouTube for:", query);
          const searched = await search(query, {
            limit: 1,
            source: { youtube: "video" },
          });

          if (searched.length === 0) {
            return interaction.editReply(
              "❌ No results found for your search!"
            );
          }

          songInfo = searched[0];
          songUrl = songInfo.url;

          console.log(`Search result: ${songInfo.title}`);
        }

        console.log(`Found song: ${songInfo.title}`);
        console.log(`URL: ${songUrl}`);
      } catch (searchError) {
        console.error("Search error:", searchError);
        return interaction.editReply(
          "❌ Error searching for the song. Please try again with a different query."
        );
      }

      // Create song object with validation
      const song = {
        title: songInfo.title || "Unknown Title",
        url: songUrl,
        duration: songInfo.durationInSec || 0,
        thumbnail: songInfo.thumbnails?.[0]?.url || null,
        requestedBy: interaction.user,
      };

      // Get or create music queue
      let queue = interaction.client.musicQueues.get(interaction.guild.id);
      if (!queue) {
        queue = new MusicQueue(interaction.guild);
        interaction.client.musicQueues.set(interaction.guild.id, queue);
      }

      // Join voice channel if not connected
      if (!queue.connection) {
        try {
          const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
          });

          // Set up connection with proper error handling
          queue.setupConnection(connection);

          // Wait for connection to be ready
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Connection timeout"));
            }, 10000);

            connection.on(VoiceConnectionStatus.Ready, () => {
              clearTimeout(timeout);
              console.log("Voice connection ready");
              resolve();
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
              clearTimeout(timeout);
              reject(new Error("Failed to connect"));
            });

            connection.on("error", (error) => {
              clearTimeout(timeout);
              reject(error);
            });
          });

          console.log("Successfully connected to voice channel");
        } catch (connectionError) {
          console.error("Voice connection error:", connectionError);
          return interaction.editReply(
            "❌ Failed to connect to voice channel!"
          );
        }
      }

      // Add song to queue
      await queue.addSong(song);

      // Get current queue status for display
      const queueStatus = queue.getQueue();
      const positionInQueue =
        queueStatus.upcoming.length + (queueStatus.current ? 1 : 0);

      const embed = {
        color: 0x00ff00,
        title: queue.playing ? "🎵 Added to Queue" : "🎵 Now Playing",
        description: `**${song.title}**`,
        thumbnail: song.thumbnail ? { url: song.thumbnail } : undefined,
        fields: [
          {
            name: "Duration",
            value: song.duration ? formatDuration(song.duration) : "Unknown",
            inline: true,
          },
          {
            name: "Requested by",
            value: song.requestedBy.toString(),
            inline: true,
          },
          {
            name: "Position in queue",
            value: queue.playing ? positionInQueue.toString() : "Now Playing",
            inline: true,
          },
        ],
        footer: {
          text: `Queue length: ${queueStatus.upcoming.length} songs`,
        },
      };

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Play command error:", error);
      const errorMessage =
        "❌ An error occurred while trying to play the song. Please try again.";

      if (interaction.deferred) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  },
};

function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "Unknown";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
