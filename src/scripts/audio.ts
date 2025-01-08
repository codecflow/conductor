export function unmute() {
  type Target = HTMLVideoElement | HTMLAudioElement;
  const elements = document.querySelectorAll<Target>("video, audio");
  elements.forEach((element) => {
    element.muted = false;
    element.volume = 1;
  });
}
