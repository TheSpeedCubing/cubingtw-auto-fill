import { chromium } from "playwright";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

const competitor = config.competitor;

// seconds to wait after the preview shows up before clicking "報名送出 Send！", -1 to disable
const AUTOSUBMIT_DELAY = Number(config.autosubmit_delay ?? -1);
if (Number.isNaN(AUTOSUBMIT_DELAY)) {
    throw new Error("autosubmit_delay must be a number of seconds, or -1 to disable");
}

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

const EVENT_IDS = [
    "33", "22", "44", "55", "66", "77",
    "3bld", "3fmc", "3oh",
    "clock", "mega", "pyra", "skewb", "sq1",
    "4bld", "5bld", "mbld",
];

async function checkFirstEvent(page) {
    await page.waitForSelector('[id^="form_event_"]', {state: "attached"});
    for (const id of EVENT_IDS) {
        const selector = `#form_event_${id}`;
        if (await page.locator(selector).count() > 0) {
            await page.check(selector);
            console.log(`${selector} -> check`);
            return;
        }
    }
    throw new Error("no known event found in the form");
}

const REFRESH_LEAD_MS = 10 * 1000;

function formatTaiwanTime(date) {
    return new Intl.DateTimeFormat('en-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
}

const DATETIME_RE = /(\d{4})\/(\d{1,2})\/(\d{1,2})\D+?(\d{1,2}):(\d{2}):(\d{2})/g;

// "2026/10/19 (一) 20:00:00 ~ 2026/10/30 (五) 23:59:59" -> { start, end }
function parsePeriod(text) {
    const dates = [...text.matchAll(DATETIME_RE)].map(m => {
        const [year, month, day, hour, minute, second] = m.slice(1).map(Number);
        return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second));
    });
    if (dates.length === 0) {
        return null;
    }
    return { start: dates[0], end: dates[1] ?? null };
}

async function getRegistrationPeriod(page, url) {
    await page.goto(url, {waitUntil: "domcontentloaded"});
    const closed = await page.locator('button.disabled', {hasText: "報名結束"}).count() > 0;

    // when spots are released, a "重新開放報名時間：..." period is shown under the original one
    const reopen = page.locator('p', {hasText: /重新開放報名時間：\s*\d{4}\//}).first();
    if (await reopen.count() > 0) {
        const period = parsePeriod(await reopen.textContent());
        if (period) {
            return { ...period, reopen: true, closed };
        }
    }

    const regular = page.locator('h3:has-text("報名時間") + p').first();
    const period = await regular.count() > 0 ? parsePeriod(await regular.textContent()) : null;
    return { start: null, end: null, ...period, reopen: false, closed };
}

async function sleepUntil(time) {
    while (true) {
        const remaining = time - Date.now();
        if (remaining <= 0) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, Math.min(remaining, 60 * 1000)));
    }
}

async function waitUntilValid(page, url) {
    let i = 1;
    while (true) {
        const taiwanTime = formatTaiwanTime(new Date());

        console.log(`[${taiwanTime}] attempting... (${i})`);
        await page.goto(url, {waitUntil: "domcontentloaded"});
        const canSelect = page.url().endsWith("/registration/select");
        console.log("result: " + (canSelect ? "registration available." : "redirected to /registration"));
      
        if (canSelect) {  
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

        const period = await getRegistrationPeriod(page, `https://cubing-tw.net/event/${config.event}/registration`);
        if (period.closed || (period.end && period.end.getTime() <= Date.now())) {
            console.log("registration has closed." + (period.end ? ` (ended at ${formatTaiwanTime(period.end)})` : ""));
            await browser.close();
            return;
        }

        const start = period.start;
        if (start) {
            const refreshAt = start.getTime() - REFRESH_LEAD_MS;
            console.log(`${period.reopen ? "registration reopens" : "registration starts"} at ${formatTaiwanTime(start)}`);
            if (refreshAt > Date.now()) {
                console.log(`waiting until ${formatTaiwanTime(new Date(refreshAt))} to start refreshing...`);
                await sleepUntil(refreshAt);
            }
        } else {
            console.log("cannot parse registration time, start refreshing now.");
        }

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
            ];
        }

        await Promise.all([
            ...fields.map(f => fillField(page, f.type, f.selector, f.value)),
            checkFirstEvent(page),
        ]);

        await page.click('#BTN_Preview');
        console.log("Preview");

        if (AUTOSUBMIT_DELAY >= 0) {
            // the preview (with the token Send needs) is loaded by ajax after the modal opens
            await page.waitForSelector('#Preview_main #modal_form_token', {state: "attached"});
            await page.waitForSelector('#BTN_Send', {state: "visible"});
            console.log(`auto submit in ${AUTOSUBMIT_DELAY} second(s)...`);
            await page.waitForTimeout(AUTOSUBMIT_DELAY * 1000);
            await page.click('#BTN_Send');
            console.log("Send");
        }
        console.log("DONE!");
    } catch (err) {
        console.error("ERROR：", err);
    } finally {
        // await browser.close();
    }
})();
