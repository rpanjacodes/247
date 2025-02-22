const fs = require("fs");
const { exec } = require("child_process");
const ytdl = require("youtube-dl-exec");
const { fetchPlaylist } = require("./fetchYoutube.js");
const { refreshCookies } = require("./autoRefreshCookies.js");

const YOUTUBE_STREAM_KEY = "YOUR_YOUTUBE_STREAM_KEY";
const IMAGE_FOLDER = "./IMAGE_FOLDER";  // Folder with background images
const FONT_PATH = "font.ttf";

let playlist = [];
let currentIndex = 0;
let imageIndex = 0;

// Get list of images in the folder
const images = fs.readdirSync(IMAGE_FOLDER).filter(file => file.endsWith(".jpg") || file.endsWith(".png"));

async function getNextSong() {
    if (currentIndex >= playlist.length) {
        console.log("🎵 Re-fetching playlist...");
        await fetchPlaylist();
        playlist = JSON.parse(fs.readFileSync("playlist.json"));
        currentIndex = 0;
    }
    return playlist[currentIndex++];
}

function getNextImage() {
    const imagePath = `${IMAGE_FOLDER}/${images[imageIndex]}`;
    imageIndex = (imageIndex + 1) % images.length; // Loop images
    return imagePath;
}

async function stream() {
    await refreshCookies();
    await fetchPlaylist();
    playlist = JSON.parse(fs.readFileSync("playlist.json"));

    while (true) {
        const songUrl = await getNextSong();
        console.log(`▶ Streaming: ${songUrl}`);
        
        let imagePath = getNextImage();
        
        const ffmpegCmd = `ffmpeg -re -i "$(youtube-dl-exec -f bestaudio ${songUrl} -o -)" \
            -loop 1 -i ${imagePath} \
            -vf "drawtext=text='Now Playing: ${songUrl}':fontfile=${FONT_PATH}:fontsize=24:fontcolor=white:x=10:y=10" \
            -c:v libx264 -preset ultrafast -tune stillimage \
            -c:a aac -b:a 128k -f flv rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}`;

        const ffmpegProcess = exec(ffmpegCmd);
        ffmpegProcess.stdout.on("data", (data) => console.log(data));
        ffmpegProcess.stderr.on("data", (data) => console.error(data));

        // Change image every 20 seconds
        setInterval(() => {
            imagePath = getNextImage();
            console.log(`🔄 Switching background to: ${imagePath}`);
        }, 20000); // 20s
        
        await new Promise((resolve) => ffmpegProcess.on("exit", resolve));
    }
}

stream();
