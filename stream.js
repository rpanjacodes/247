const fs = require("fs");
const { exec } = require("child_process");
const ytdl = require("youtube-dl-exec");
const { fetchPlaylist } = require("./fetchYoutube.js");
const { refreshCookies } = require("./autoRefreshCookies.js");

const YOUTUBE_STREAM_KEY = "4jye-x93a-rkad-x7ap-e7fq";
const IMAGE_FOLDER = "images"; // Folder containing images
const FONT_PATH = "font.ttf";

let playlist = [];
let currentIndex = 0;
let imageIndex = 0;

// Load images from the folder
const images = fs.readdirSync(IMAGE_FOLDER).filter(file => file.endsWith(".jpg") || file.endsWith(".png"));
if (images.length === 0) {
    console.error("No images found in the folder!");
    process.exit(1);
}

async function getNextSong() {
    if (currentIndex >= playlist.length) {
        console.log("🎵 Re-fetching playlist...");
        await fetchPlaylist();
        playlist = JSON.parse(fs.readFileSync("playlist.json"));
        currentIndex = 0;
    }
    return playlist[currentIndex++];
}

async function stream() {
    await refreshCookies();
    await fetchPlaylist();
    playlist = JSON.parse(fs.readFileSync("playlist.json"));

    while (true) {
        const songUrl = await getNextSong();
        console.log(`▶ Streaming: ${songUrl}`);

        // Change images every 20 seconds
        imageIndex = (imageIndex + 1) % images.length;
        const imagePath = `${IMAGE_FOLDER}/${images[imageIndex]}`;

        const ffmpegCmd = `
            ffmpeg -re -i "$(youtube-dl-exec -f bestaudio ${songUrl} -o -)" \
            -loop 1 -i ${imagePath} \
            -vf "drawtext=text='Now Playing: ${songUrl}':fontfile=${FONT_PATH}:fontsize=24:fontcolor=white:x=10:y=10, \
                  drawtext=text='Subscribers: 100K':fontfile=${FONT_PATH}:fontsize=24:fontcolor=white:x=w-text_w-20:y=h-text_h-20, \
                  drawtext=text='Donations Appear Here':fontfile=${FONT_PATH}:fontsize=20:fontcolor=white:x=10:y=h-50:box=1:boxcolor=black@0.5" \
            -c:v libx264 -preset ultrafast -tune stillimage -c:a aac -b:a 128k \
            -f flv rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}
        `;

        const ffmpegProcess = exec(ffmpegCmd);

        ffmpegProcess.stdout.on("data", (data) => console.log(data));
        ffmpegProcess.stderr.on("data", (data) => console.error(data));

        // Wait for 20 seconds before switching the image
        await new Promise(resolve => setTimeout(resolve, 20000));
    }
}

stream();

