export type Config = {
  url: string;
  rtmp: string;
  display: string;
  overlay: string;
  width: number;
  height: number;
  fps: number;
};

function toInt(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  return parseInt(value) || fallback;
}

export const Config = {
  url: process.env.URL || "https://example.com",
  rtmp: process.env.RTMP || "rtmp://host.docker.internal:1935/live/stream",
  display: process.env.DISPLAY || ":99",
  overlay: process.env.OVERLAY || ":98",
  width: toInt(process.env.WIDTH, 1920),
  height: toInt(process.env.HEIGHT, 1080),
  fps: toInt(process.env.FPS, 30),
} satisfies Config;
