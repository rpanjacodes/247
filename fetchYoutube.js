const ytdl = require("youtube-dl-exec");

const fs = require("fs");

const PLAYLIST_URL = "https://youtube.com/playlist?list=PLBBu3Lqn5XGzMJbPmxQZqXH3P5voc1Lrm&si=fqXv8BXVFO14TWkk";

async function fetchPlaylist() {

    try {

        const result = await ytdl(PLAYLIST_URL, {

            dumpJson: true,

            flatPlaylist: true,

        });

        const videoUrls = result.entries.map((video) => video.url);

        fs.writeFileSync("playlist.json", JSON.stringify(videoUrls, null, 2));

        console.log("✅ Playlist updated!");

    } catch (error) {

        console.error("❌ Failed to fetch playlist:", error);

    }

}

module.exports = { fetchPlaylist };
