const fs = require("fs");

const { exec } = require("child_process");

const ytdl = require("youtube-dl-exec");

const { fetchPlaylist } = require("/home/container/fetchYoutube.js");

const { refreshCookies } = require("/home/container/autoRefreshCookies.js");

const YOUTUBE_STREAM_KEY = "4jye-x93a-rkad-x7ap-e7fq";

const IMAGE_PATH = "static_image.jpg";

const FONT_PATH = "/home/container/font.ttf";

let playlist = [];

let currentIndex = 0;

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

        const ffmpegCmd = `ffmpeg -re -i "$(youtube-dl-exec -f bestaudio ${songUrl} -o -)" -loop 1 -i ${IMAGE_PATH} -vf "drawtext=text='Now Playing: ${songUrl}':fontfile=${FONT_PATH}:fontsize=24:fontcolor=white:x=10:y=10" -c:v libx264 -preset ultrafast -tune stillimage -c:a aac -b:a 128k -f flv rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}`;
        
const ffmpegProcess = exec(ffmpegCmd);

        ffmpegProcess.stdout.on("data", (data) => console.log(data));

        ffmpegProcess.stderr.on("data", (data) => console.error(data));

        await new Promise((resolve) => ffmpegProcess.on("exit", resolve));

    }

}

stream();
