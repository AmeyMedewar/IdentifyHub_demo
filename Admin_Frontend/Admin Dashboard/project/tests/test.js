const { Builder, By, until } = require("selenium-webdriver");

async function runTest() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("https://www.google.com");
        console.log("Selenium Test Opened Google Successfully");
    } finally {
        await driver.quit();
    }
}

runTest();
