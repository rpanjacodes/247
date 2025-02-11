const { exec } = require("child_process");

const YOUTUBE_STREAM_KEY = "your-key";

const IMAGE_PATH = "background.jpg";

async function startStream() {

    if (!YOUTUBE_STREAM_KEY) {

        console.error("Error: YOUTUBE_STREAM_KEY is not set.");

        return;

    }

    console.log("Fetching songs from Spotify...");

    const getSpotifyTracks = require("./fetchSpotify");

    const tracks = await getSpotifyTracks();

    if (tracks.length === 0) {

        console.error("No tracks found in the Spotify playlist.");

        return;

    }

    console.log(`Starting YouTube livestream with ${tracks.length} tracks...`);

    // Updated FFmpeg command to ensure even height

    const ffmpegCmd = `ffmpeg -re -loop 1 -i ${IMAGE_PATH} -vf "scale=iw:trunc(ih/2)*2" -f flv rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}`;

    const process = exec(ffmpegCmd);

    process.stdout.on("data", (data) => console.log(`[FFmpeg]: ${data}`));

    process.stderr.on("data", (data) => console.error(`[FFmpeg Error]: ${data}`));

    process.on("exit", (code) => console.log(`[FFmpeg] Exited with code ${code}`));

}

module.exports = startStream;
