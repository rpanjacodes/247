const getSpotifyTracks = require("./fetchSpotify");
const startStream = require("./stream");
startStream();
const refreshCookies = require("./refreshCookies");
const cron = require("node-cron");

async function startBot() {
    console.log("Fetching songs from Spotify...");
    const tracks = await getSpotifyTracks();

    console.log("Starting YouTube livestream...");
    startStream();

    cron.schedule("0 * * * *", async () => {
        console.log("Refreshing YouTube cookies...");
        await refreshCookies();
    });

    cron.schedule("*/10 * * * *", async () => {
        console.log("Checking for new songs in playlist...");
        const newTracks = await getSpotifyTracks();

        if (newTracks.length !== tracks.length) {
            console.log("New songs detected! Updating playlist...");
        }
    });
}

startBot();
