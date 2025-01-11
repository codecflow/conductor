import { chromium } from "playwright";

import { Config } from "./config";

import stream from "./stream";

const { width, height, rtmp, display, overlay, url } = Config;

stream(rtmp, display, overlay);

const defaultPage = `text/html,<html style="background: transparent;"><body style="background: transparent;"><h1 style="background:red;">HELLO</h1></body></html>`
chromium.launchPersistentContext("", {
  headless: false,
  executablePath: "/usr/bin/chromium-browser",
  viewport: { width, height },
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--remote-debugging-port=9222",
    `--app=data:${url ?? defaultPage}`,
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

await new Promise(() => {});
