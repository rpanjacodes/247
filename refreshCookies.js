const puppeteer = require("puppeteer");
const fs = require("fs");

const COOKIES_PATH = "cookies.json";

async function refreshCookies() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://www.youtube.com");

    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies));

    await browser.close();
    console.log("Cookies refreshed!");
}

module.exports = refreshCookies;
