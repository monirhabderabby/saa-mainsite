let audio: HTMLAudioElement | null = null;

export function playNotificationSound() {
  try {
    if (!audio) {
      audio = new Audio("/sound/bell.mp3");
      audio.volume = 0.6;
    }
    // Reset and play
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browser blocks autoplay — ignored, user must interact first
    });
  } catch {
    // Silently fail
  }
}
