import { chromium } from "playwright";
import { Config } from "./config";
import stream from "./stream";

async function main() {
  try {
    console.log("Starting conductor...");
    console.log(`Configuration: ${JSON.stringify(Config, null, 2)}`);
    
    const { width, height, rtmp, display, overlay, url } = Config;
    
    // Start the streaming process
    stream(rtmp, display, overlay);
    
    // Default page to display if URL is not provided
    const defaultPage = `text/html,<html style="background: transparent;"><body style="background: transparent;"><h1 style="background:red;">HELLO</h1></body></html>`;
    
    // Launch the browser
    console.log(`Launching browser with URL: ${url}`);
    const browser = await chromium.launchPersistentContext("", {
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
    
    console.log("Browser launched successfully");
    
    // Handle browser errors
    browser.on("close", () => {
      console.log("Browser context closed");
    });
    
    // Keep the process running
    await new Promise<void>(() => {});
  } catch (error) {
    console.error("Error in main process:", error);
    process.exit(1);
  }
}

// Handle process signals
process.on("SIGINT", () => {
  console.log("Received SIGINT signal, shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM signal, shutting down...");
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});
