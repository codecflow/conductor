export type Config = {
  url: string;
  rtmp: string;
  display: string;
  overlay: string;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  audioBitrate: number;
  maxRetries: number;
  retryDelay: number;
};

function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value);
  return isNaN(parsed) ? fallback : parsed;
}

function toString(value: string | undefined, fallback: string): string {
  return value || fallback;
}

export const Config = {
  url: toString(process.env.URL, "https://example.com"),
  rtmp: toString(process.env.RTMP, "rtmp://host.docker.internal:1935/live/stream"),
  display: toString(process.env.DISPLAY, ":99"),
  overlay: toString(process.env.OVERLAY, ":98"),
  width: toInt(process.env.WIDTH, 1920),
  height: toInt(process.env.HEIGHT, 1080),
  fps: toInt(process.env.FPS, 30),
  bitrate: toInt(process.env.BITRATE, 3000),
  audioBitrate: toInt(process.env.AUDIO_BITRATE, 128000),
  maxRetries: toInt(process.env.MAX_RETRIES, 3),
  retryDelay: toInt(process.env.RETRY_DELAY, 5000),
} satisfies Config;
