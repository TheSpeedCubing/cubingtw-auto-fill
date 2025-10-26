import { chromium } from "playwright";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
const competitor = config.competitor;

async function fillField(page, type, selector, value) {
    await page.waitForSelector(selector);
    if (type === "fill") {
        await page.fill(selector, value);
    } else if (type === "check") {
        await page.check(selector);
    } else if (type === "select") {
        await page.selectOption(selector, value);
    }
    console.log(`${selector} -> ${type}`);
}

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        await page.goto(`https://cubing-tw.net/event/${config.event}/registration/select`, { waitUntil: "domcontentloaded" });

        if (!competitor.new) {
            await fillField(page, "fill", 'input[id^="WCAID_input_"]', competitor.wcaid);
            await page.waitForSelector('input[id^="WCAID_input_"].is-valid');
            await page.click('#WCAID_Button');
            console.log("Go");

            var fields = [
                { type: "select", selector: "#form_birthday_year", value: competitor.year },
                { type: "select", selector: "#form_birthday_month", value: competitor.month },
                { type: "select", selector: "#form_birthday_day", value: competitor.day },
                { type: "fill", selector: "#form_email", value: competitor.email },
                { type: "check", selector: "#form_event_" + competitor.event }
            ];
        } else {
            await page.click('button.btn.btn-outline-primary.btn-lg');
            console.log("首次報名");

			await fillField(page, "fill", "#form_english_name", competitor.english_name);
			await fillField(page, "fill", "#form_local_name", competitor.local_name);

            var fields = [
                { type: "fill", selector: "#form_country", value: competitor.country },
                { type: "check", selector: "#form_gender_" + (competitor.gender === "male" ? "m" : "f") },
                { type: "select", selector: "#form_birthday_year", value: competitor.year },
                { type: "select", selector: "#form_birthday_month", value: competitor.month },
                { type: "select", selector: "#form_birthday_day", value: competitor.day },
                { type: "fill", selector: "#form_email", value: competitor.email },
                { type: "check", selector: "#form_event_" + competitor.event }
            ];
        }

        await Promise.all(fields.map(f => fillField(page, f.type, f.selector, f.value)));

        await page.click('#BTN_Preview');
        console.log("Preview");
        console.log("DONE!");
    } catch (err) {
        console.error("ERROR：", err);
    } finally {
        // await browser.close();
    }
})();
