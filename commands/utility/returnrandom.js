// const { SlashCommandBuilder } = require("discord.js");
// import axios from "axios";

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName("affirmation")
//     .setDescription("Replies with affirmations!"),

//   // ✅ This is required for djs-commander to work
//   run: async ({ interaction }) => {
//     await interaction.reply("Loading...");
//     fetchRandomUserData(interaction);
//   },
// };

// const fetchRandomUserData = async (interaction) => {
//   try {
//     const response = await axios.get(`https://www.affirmations.dev/`);
//     const affirmation = response.data.affirmation;
//     await interaction.editReply(affirmation);
//   } catch (error) {
//     console.error("Error fetching data", error);
//     await interaction.editReply(error);
//   }
// };
const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("affirmation")
    .setDescription("Replies with affirmations!"),

  // ✅ This is required for djs-commander to work
  run: async ({ interaction }) => {
    await interaction.reply("Loading...");
    fetchRandomUserData(interaction);
  },
};

const fetchRandomUserData = async (interaction) => {
  try {
    const response = await axios.get(`https://www.affirmations.dev/`);
    const affirmation = response.data.affirmation;
    await interaction.editReply(affirmation);
  } catch (error) {
    console.error("Error fetching data", error);
    await interaction.editReply(
      "Sorry, I couldn't fetch an affirmation right now. Please try again later!"
    );
  }
};
