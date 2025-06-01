// test-stream.js - Run this to test which streaming method works
const playdl = require("play-dl");
const ytdl = require("ytdl-core");

async function testStreaming() {
  const testUrl = "https://www.youtube.com/watch?v=bnFa4Mq5PAM";

  console.log("Testing streaming methods for:", testUrl);
  console.log("=".repeat(50));

  // Test 1: play-dl high quality
  try {
    console.log("\n1. Testing play-dl (quality: 2)...");
    const stream1 = await playdl.stream(testUrl, { quality: 2 });
    console.log("✅ play-dl high quality - SUCCESS");
    console.log("Stream type:", stream1.type);
    console.log("Stream readable:", stream1.stream.readable);
  } catch (error) {
    console.log("❌ play-dl high quality - FAILED");
    console.log("Error:", error.message);
  }

  // Test 2: play-dl low quality
  try {
    console.log("\n2. Testing play-dl (quality: 0)...");
    const stream2 = await playdl.stream(testUrl, { quality: 0 });
    console.log("✅ play-dl low quality - SUCCESS");
    console.log("Stream type:", stream2.type);
    console.log("Stream readable:", stream2.stream.readable);
  } catch (error) {
    console.log("❌ play-dl low quality - FAILED");
    console.log("Error:", error.message);
  }

  // Test 3: ytdl-core
  try {
    console.log("\n3. Testing ytdl-core...");
    const info = await ytdl.getInfo(testUrl);
    console.log("Video title:", info.videoDetails.title);
    console.log("Video length:", info.videoDetails.lengthSeconds, "seconds");

    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    console.log("Available audio formats:", audioFormats.length);

    if (audioFormats.length > 0) {
      console.log("✅ ytdl-core - SUCCESS");
      console.log("Best audio format:", audioFormats[0].audioQuality);
    } else {
      console.log("❌ ytdl-core - No audio formats found");
    }
  } catch (error) {
    console.log("❌ ytdl-core - FAILED");
    console.log("Error:", error.message);
  }

  // Test 4: URL validation
  console.log("\n4. Testing URL validation...");
  console.log("play-dl validation:", playdl.yt_validate(testUrl));
  console.log("ytdl-core validation:", ytdl.validateURL(testUrl));

  console.log("\n" + "=".repeat(50));
  console.log("Test completed. Use the working method in your bot.");
}

testStreaming().catch(console.error);
