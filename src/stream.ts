import { spawn } from "child_process";
import { Config } from "./config";

export default async function (rtmp: string, display: string, overlay: string) {
  // Organize GStreamer pipeline into logical sections
  const compositorSetup = [
    "compositor",
    "name=comp",
    "sink_0::xpos=0",
    "sink_0::ypos=0",
    "sink_0::zorder=1",
    "sink_0::alpha=1.0",
    "sink_1::xpos=0",
    "sink_1::ypos=0",
    "sink_1::zorder=0",
    "sink_1::alpha=1.0",
  ];

  const videoProcessing = [
    "!",
    "queue",
    "!",
    "videoconvert",
    "!",
    "queue",
    "!",
    `video/x-raw,format=I420,width=${Config.width},height=${Config.height},framerate=${Config.fps}/1`,
  ];

  const videoEncoding = [
    "!",
    "x264enc",
    "tune=zerolatency",
    "speed-preset=ultrafast",
    `bitrate=${Config.bitrate}`,
    "key-int-max=30",
    "bframes=0",
    "!",
    "queue",
    "!",
    "video/x-h264,profile=baseline",
  ];

  const muxing = [
    "!",
    "flvmux",
    "name=mux",
    "streamable=true",
    "!",
    "rtmpsink",
    `location=${rtmp}`,
    "sync=false",
  ];

  const overlaySource = [
    "ximagesrc",
    `display-name=${overlay}`,
    "use-damage=false",
    "show-pointer=true",
    "!",
    "videoconvert",
    "!",
    "video/x-raw,format=RGBA",
    "!",
    "queue",
    "!",
    "comp.sink_0",
  ];

  const displaySource = [
    "ximagesrc",
    `display-name=${display}`,
    "use-damage=false",
    "show-pointer=false",
    "!",
    "videoconvert",
    "!",
    "video/x-raw,format=RGBA",
    "!",
    "queue",
    "!",
    "comp.sink_1",
  ];

  const audioSource = [
    "pulsesrc",
    "device=@DEFAULT_MONITOR@",
    "!",
    "queue",
    "!",
    "audioconvert",
    "!",
    "queue",
    "!",
    "audioresample",
    "!",
    "queue",
    "!",
    "voaacenc",
    `bitrate=${Config.audioBitrate}`,
    "!",
    "queue",
    "!",
    "mux.",
  ];

  // Combine all pipeline sections
  const command = [
    "gst-launch-1.0",
    "-v",
    ...compositorSetup,
    ...videoProcessing,
    ...videoEncoding,
    ...muxing,
    ...overlaySource,
    ...displaySource,
    ...audioSource,
  ];

  const maxRetries = Config.maxRetries;
  let retryCount = 0;
  let gst: ReturnType<typeof spawn> | null | undefined = null;
  
  const startPipeline = (): ReturnType<typeof spawn> | undefined => {
    try {
      console.log(`Starting GStreamer pipeline (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      gst = spawn("gst-launch-1.0", command.slice(1), {
        stdio: ["inherit", "pipe", "pipe"],
      });

      if (gst.stdout) {
        gst.stdout.on("data", (data) => console.log(`stdout: ${data}`));
      }

      if (gst.stderr) {
        gst.stderr.on("data", (data) => console.error(`stderr: ${data}`));
      }

      gst.on("close", (code) => {
        if (code === 0) {
          console.log("GStreamer pipeline completed successfully");
        } else {
          console.error(`GStreamer pipeline exited with code ${code}`);
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Attempting to restart pipeline in 5 seconds...`);
            setTimeout(startPipeline, Config.retryDelay);
          } else {
            console.error(`Maximum retry attempts (${maxRetries}) reached. Giving up.`);
            process.exit(1);
          }
        }
      });

      gst.on("error", (err) => {
        console.error("Failed to start GStreamer process:", err);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Attempting to restart pipeline in 5 seconds...`);
            setTimeout(startPipeline, Config.retryDelay);
        } else {
          console.error(`Maximum retry attempts (${maxRetries}) reached. Giving up.`);
          process.exit(1);
        }
      });
      
      return gst;
    } catch (error) {
      console.error("Error starting stream:", error);
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Attempting to restart pipeline in 5 seconds...`);
        setTimeout(startPipeline, Config.retryDelay);
      } else {
        console.error(`Maximum retry attempts (${maxRetries}) reached. Giving up.`);
        throw error;
      }
    }
  };

  gst = startPipeline();
  
  const cleanup = () => {
    if (gst) {
      console.log("Shutting down GStreamer pipeline...");
      gst.kill("SIGINT");
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
