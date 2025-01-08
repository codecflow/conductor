import { chromium } from "playwright";

import { Config } from "./config";

import stream from "./stream";

import { fullscreen } from "./scripts/dom";
import { unmute } from "./scripts/audio";

const { url, width, height } = Config;

const context = await chromium.launchPersistentContext("", {
  headless: false,
  executablePath: "/usr/bin/chromium-browser",
  viewport: { width, height },
  args: [
    "--no-sandbox",
    "--disable-gpu",
    '--app=data:text/html,<html style="background: transparent;"><body style="background: transparent;"><h1 style="background:red;">HELLO</h2></body></html>',
    "--test-type",
    "--disable-software-rasterizer",
    "--disable-dev-shm-usage",
    `--window-size=${width},${height}`,
    "--window-position=0,0",
    "--autoplay-policy=no-user-gesture-required",
    "--use-fake-ui-for-media-stream",
    "--start-maximized",
    "--enable-audio-mixer",
    "--enable-audio-stream",
    "--alsa-output-device=default",
    "--disable-infobars",
    "--disable-blink-features=AutomationControlled",
  ],
  ignoreDefaultArgs: ["--enable-automation"],
});

const page = context.pages()[0];
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(unmute);
await page.evaluate(fullscreen);

stream(Config.rtmp, Config.display, Config.overlay);

await new Promise(() => {});
