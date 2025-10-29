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

async function waitUntilValid(page, url) {
    let i = 1;
    while (true) {

        const now = new Date();
        const taiwanTime = new Intl.DateTimeFormat('en-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(now);

        console.log(`[${taiwanTime}] attempting... (${i})`);
        const r = await page.goto(url, {waitUntil: "domcontentloaded"});
		const canSelect = page.url().endsWith("/registration/select");
		console.log("result: " + (canSelect ? "registration available." : "redirected to /registration"));
      
        if (canSelect) {  
      //if ((await page.locator('input[id^="WCAID_input_"]').count()) > 0) {
            return;
        }
        i++;
    }
}

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ 
	  viewport: null,
	  serviceWorkers: 'block'
	});
    const page = await context.newPage();

    try {
		const url = `https://cubing-tw.net/event/${config.event}/registration/select`;
		const events = Array.isArray(competitor.events)
          ? competitor.events.map(String).map(s => s.trim()).filter(Boolean)
          : [];

		await waitUntilValid(page, url);


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
                ...events.map(ev => ({ type: "check", selector: `#form_event_${ev}` })),
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
                ...events.map(ev => ({ type: "check", selector: `#form_event_${ev}` })),
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
