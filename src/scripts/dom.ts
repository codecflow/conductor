export function fullscreen() {
  document.documentElement.requestFullscreen().catch(console.error);
}
