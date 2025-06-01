const {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  StreamType,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const { stream, validate } = require("play-dl");

class MusicQueue {
  constructor(guild) {
    this.guild = guild;
    this.songs = [];
    this.volume = 0.5;
    this.playing = false;
    this.player = new AudioPlayer();
    this.connection = null;
    this.currentSong = null;

    this.player.on(AudioPlayerStatus.Idle, () => {
      console.log("Audio player is idle, playing next song...");
      this.playing = false;
      this.currentSong = null;
      this.play();
    });

    this.player.on("error", (error) => {
      console.error("Audio player error:", error);
      this.playing = false;
      this.currentSong = null;
      // Skip to next song instead of trying to replay the broken one
      setTimeout(() => this.play(), 1000);
    });

    this.player.on(AudioPlayerStatus.Playing, () => {
      console.log("Audio player started playing");
    });
  }

  async addSong(song) {
    this.songs.push(song);
    if (!this.playing) {
      await this.play();
    }
  }

  async play() {
    if (this.songs.length === 0) {
      this.playing = false;
      console.log("Queue is empty, stopping playback");
      return;
    }

    if (this.playing) {
      console.log("Already playing, skipping play attempt");
      return;
    }

    const song = this.songs.shift();
    this.currentSong = song;
    this.playing = true;

    console.log(`Attempting to play: ${song.title}`);
    console.log(`URL: ${song.url}`);

    try {
      // Validate URL before attempting to stream
      if (!this.isValidYouTubeURL(song.url)) {
        throw new Error("Invalid YouTube URL");
      }

      console.log("URL validation passed");

      // Create stream with play-dl
      const streamData = await stream(song.url, {
        quality: 0, // Use lowest quality for better stability (0 = lowest, 2 = highest)
        seek: 0,
        discordPlayerCompatibility: true,
      });

      console.log("Stream created successfully with play-dl");
      console.log(`Stream type: ${streamData.type}`);

      // Create audio resource
      const resource = createAudioResource(streamData.stream, {
        inputType:
          streamData.type === "opus" ? StreamType.Opus : StreamType.Arbitrary,
        metadata: song,
        inlineVolume: true,
      });

      // Set volume if resource supports it
      if (resource.volume) {
        resource.volume.setVolume(this.volume);
      }

      this.player.play(resource);

      if (this.connection) {
        this.connection.subscribe(this.player);
        console.log("Successfully subscribed player to connection");
      } else {
        throw new Error("No voice connection available");
      }
    } catch (error) {
      console.error("Error playing song:", error);
      console.error("Failed song:", song.title, song.url);

      this.playing = false;
      this.currentSong = null;

      // Try next song after a brief delay
      setTimeout(() => {
        console.log("Attempting to play next song after error...");
        this.play();
      }, 2000);
    }
  }

  async isValidYouTubeURL(url) {
    try {
      // Check if it's a valid URL first
      const urlObj = new URL(url);

      // Check if it's a YouTube URL
      const isYouTube =
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be");

      if (!isYouTube) {
        return false;
      }

      // Validate using play-dl
      const validation = validate(url);
      return validation === "yt_video"; // 'yt_video' means valid YouTube video
    } catch (error) {
      console.error("URL validation error:", error);
      return false;
    }
  }

  skip() {
    if (this.playing) {
      console.log("Skipping current song");
      this.player.stop();
    }
  }

  stop() {
    console.log("Stopping music and clearing queue");
    this.songs = [];
    this.playing = false;
    this.currentSong = null;
    this.player.stop();
  }

  pause() {
    if (this.playing) {
      console.log("Pausing music");
      this.player.pause();
    }
  }

  resume() {
    if (this.playing) {
      console.log("Resuming music");
      this.player.unpause();
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (this.currentSong && this.player.state.resource?.volume) {
      this.player.state.resource.volume.setVolume(this.volume);
    }
  }

  getQueue() {
    return {
      current: this.currentSong,
      upcoming: this.songs,
      playing: this.playing,
    };
  }

 
  setupConnection(connection) {
    this.connection = connection;

    connection.on(VoiceConnectionStatus.Disconnected, () => {
      console.log("Voice connection disconnected");
      this.stop();
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log("Voice connection destroyed");
      this.stop();
    });

    connection.on("error", (error) => {
      console.error("Voice connection error:", error);
    });
  }
}

module.exports = { MusicQueue };
