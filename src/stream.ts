import { spawn } from "child_process";

export default async function (rtmp: string, display: string, overlay: string) {
  const command = [
    "gst-launch-1.0",
    "-v",
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
    "!",
    "queue",
    "!",
    "videoconvert",
    "!",
    "queue",
    "!",
    "video/x-raw,format=I420,width=1920,height=1080,framerate=25/1",
    "!",
    "x264enc",
    "tune=zerolatency",
    "speed-preset=ultrafast",
    "bitrate=3000",
    "key-int-max=30",
    "bframes=0",
    "!",
    "queue",
    "!",
    "video/x-h264,profile=baseline",
    "!",
    "flvmux",
    "name=mux",
    "streamable=true",
    "!",
    "rtmpsink",
    `location=${rtmp}`,
    "sync=false",
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
    "bitrate=128000",
    "!",
    "queue",
    "!",
    "mux.",
  ];

  try {
    const gst = spawn("gst-launch-1.0", command.slice(1), {
      stdio: ["inherit", "pipe", "pipe"],
    });

    gst.stdout.on("data", (data) => console.log(`stdout: ${data}`));

    gst.stderr.on("data", (data) => console.error(`stderr: ${data}`));

    gst.on("close", (code) => {
      if (code === 0) {
        console.log("GStreamer pipeline completed successfully");
      } else {
        console.error(`GStreamer pipeline exited with code ${code}`);
      }
    });

    process.on("SIGINT", () => {
      gst.kill("SIGINT");
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      gst.kill("SIGTERM");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error starting stream:", error);
    throw error;
  }
}
