const axios = require('axios');

const SPOTIFY_CLIENT_ID = "bd6e115adca74be3aaff0fafdfccf911";
const SPOTIFY_CLIENT_SECRET = "ab3c3cea060a4f39b43fd8b62fa718bb";
const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/playlist/7IXaLrFAFxmUELfKUycf1H?si=9bQdqFAnROO4dgXB3MQiKQ";

async function getSpotifyAccessToken() {
    const url = 'https://accounts.spotify.com/api/token';
    const params = new URLSearchParams();
    
    params.append('grant_type', 'client_credentials');
    params.append('client_id', SPOTIFY_CLIENT_ID);
    params.append('client_secret', SPOTIFY_CLIENT_SECRET);

    try {
        const response = await axios.post(url, params);
        return response.data.access_token;
    } catch (error) {
        console.error('Failed to get Spotify access token:', error);
        return null;
    }
}

async function getSpotifyTracks() {
    const accessToken = await getSpotifyAccessToken();
    if (!accessToken) return [];

    const playlistId = SPOTIFY_PLAYLIST_URL.split("playlist/")[1].split("?")[0];
    const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
        const response = await axios.get(apiUrl, { headers });
        return response.data.items.map(item => item.track.name);
    } catch (error) {
        console.error('Failed to fetch playlist:', error);
        return [];
    }
}

module.exports = getSpotifyTracks;
