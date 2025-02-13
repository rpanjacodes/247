const puppeteer = require("puppeteer");

const fs = require("fs");

async function refreshCookies() {

    console.log("🔄 Refreshing YouTube cookies...");

    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    

    await page.goto("https://www.youtube.com", { waitUntil: "networkidle2" });

    const cookies = await page.cookies();

    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));

    await browser.close();

    console.log("✅ Cookies refreshed!");

}

module.exports = { refreshCookies };
