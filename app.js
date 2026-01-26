if (started) return;
started = true;

tapText.style.display = "none";

// Derive mp4 path from the image src (preserve query if present)
const imgSrc = img.getAttribute('src') || '';
let videoSrc = imgSrc.replace(/(\.(png|jpg|jpeg))(?:\?.*)?$/i, '.mp4');
if (videoSrc === imgSrc) {
  videoSrc = './Assets/Splash.mp4';
}
if (!/\?/.test(videoSrc)) {
  videoSrc += '?v=10';
}

// Reset and show video
video.style.display = "block";
video.style.zIndex = "2";
img.style.zIndex = "1";
video.currentTime = 0;
video.pause();

// Remove previous safety timer
clearSafetyTimer();

// Set src last to trigger metadata load
video.src = videoSrc;

// Try unmuted first
video.muted = false;
video.volume = 1.0;

console.debug('Attempting to play splash video', { src: video.src, evType: ev ? ev.type : undefined });

try {
  await video.play();
  console.debug('splash video started unmuted', { readyState: video.readyState, duration: video.duration });
  // ensure safety timer is set if metadata already available
  setSafetyFromDuration();
} catch (err) {
  console.warn('unmuted play blocked, trying muted', err);
  try {
    video.muted = true;
    await video.play();
    console.debug('splash video started muted', { readyState: video.readyState, duration: video.duration });
    tapText.textContent = "Tap to enable sound";
    tapText.style.display = "block";

    // allow one tap to unmute
    const enableSoundOnce = async () => {
      try {
        video.muted = false;
        await video.play();
        tapText.style.display = "none";
      } catch (err2) {
        console.error('unmute attempt failed', err2);
        tapText.textContent = "Sound blocked";
        tapText.style.display = "block";
      } finally {
        splash.removeEventListener('pointerup', enableSoundOnce);
        splash.removeEventListener('keydown', enableSoundOnce);
      }
    };
    splash.addEventListener('pointerup', enableSoundOnce, { once: true });
    splash.addEventListener('keydown', enableSoundOnce, { once: true });

    setSafetyFromDuration();
  } catch (err3) {
    console.error('muted play also failed', err3);
    // Give control back to user
    started = false;
    tapText.textContent = "Tap again";
    tapText.style.display = "block";
    video.pause();
    video.style.display = "none";
    clearSafetyTimer();
    return;
  }
}
