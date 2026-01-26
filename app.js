/* Improved splash start logic:
   - Derives the MP4 path from the splash image src (avoids case/path mismatches)
   - Tries unmuted play first, falls back to muted if blocked
   - Adds robust logging and error handlers
   - Uses multiple strategies to determine duration (duration, seekable, buffered)
   - Watches durationchange/progress/timeupdate to avoid premature cutoff
*/

function renderMenu() {
  const app = document.getElementById("app");
  app.style.display = "flex";
  app.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:42px;font-weight:900;">
      Main Menu
    </div>
  `;
}

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.classList.add("hidden");
  setTimeout(() => {
    splash.remove();
    renderMenu();
  }, 400);
}

window.addEventListener("load", () => {
  renderMenu(); // the app content is rendered but hidden behind splash

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  let started = false;
  let safetyTimer = null;

  // Estimate duration from duration, seekable, or buffered ranges
  const estimateDuration = () => {
    try {
      if (isFinite(video.duration) && video.duration > 0) return video.duration;
      if (video.seekable && video.seekable.length) {
        return video.seekable.end(video.seekable.length - 1);
      }
      if (video.buffered && video.buffered.length) {
        return video.buffered.end(video.buffered.length - 1);
      }
    } catch (e) {
      // ignore any exceptions accessing ranges
    }
    return null;
  };

  // Set a safety timer slightly after the estimated duration to avoid early cut-off
  const setSafetyFromDuration = () => {
    const d = estimateDuration();
    if (!d) {
      console.debug('setSafetyFromDuration: no duration available yet', {
        duration: video.duration,
        buffered: video.buffered && video.buffered.length ? video.buffered.end(video.buffered.length - 1) : null,
        seekable: video.seekable && video.seekable.length ? video.seekable.end(video.seekable.length - 1) : null,
      });
      return;
    }
    clearTimeout(safetyTimer);
    // Add a buffer (800ms) to avoid premature hiding
    safetyTimer = setTimeout(() => {
      console.debug('safety timer fired after estimated duration', { estimatedDurationMs: Math.ceil(d * 1000) + 800 });
      hideSplash();
    }, Math.ceil(d * 1000) + 800);
    console.debug('safety timer set', { seconds: d, timeoutMs: Math.ceil(d * 1000) + 800 });
  };

  // If currentTime approaches duration, hide immediately (guard against stale timers)
  const maybeHideAtEnd = () => {
    if (isFinite(video.duration) && video.duration > 0) {
      if (video.currentTime >= Math.max(0, video.duration - 0.25)) {
        clearTimeout(safetyTimer);
        hideSplash();
      }
    }
  };

  const clearPlaybackListeners = (opts = {}) => {
    try {
      video.removeEventListener("loadedmetadata", setSafetyFromDuration);
      video.removeEventListener("durationchange", setSafetyFromDuration);
      video.removeEventListener("progress", setSafetyFromDuration);
      video.removeEventListener("timeupdate", maybeHideAtEnd);
    } catch (e) { /* ignore */ }
    if (opts.clearTimer) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }
  };

  const start = async (ev) => {
    // allow keyboard activation (Enter / Space)
    if (ev && ev.type === 'keydown' && !(ev.key === 'Enter' || ev.key === ' ')) return;

    if (started) return;
    started = true;

    tapText.style.display = "none";

    // Derive mp4 path from the image src to avoid case/path mismatches.
    // If img src ends with .png/.jpg/.jpeg change extension to .mp4, preserve any query param.
    const imgSrc = img.getAttribute('src') || '';
    let videoSrc = imgSrc.replace(/(\.(png|jpg|jpeg))(?:\?.*)?$/i, '.mp4');

    // If no replacement happened, fallback to a relative Assets path
    if (videoSrc === imgSrc) {
      videoSrc = './Assets/Splash.mp4';
    }

    // Add a cache-busting query only if there was none (optional)
    if (!/\?/.test(videoSrc)) {
      videoSrc += '?v=10';
    }

    // show the video above the image
    video.style.display = "block";
    video.style.zIndex = "2";
    img.style.zIndex = "1";

    // reset any previous state
    video.currentTime = 0;
    video.pause();

    // Remove previously attached handlers (if any)
    clearPlaybackListeners({ clearTimer: true });

    // Attach robust listeners
    video.addEventListener("loadedmetadata", setSafetyFromDuration);
    video.addEventListener("durationchange", setSafetyFromDuration);
    video.addEventListener("progress", setSafetyFromDuration);
    video.addEventListener("timeupdate", maybeHideAtEnd);

    const onEnded = () => {
      clearTimeout(safetyTimer);
      hideSplash();
    };

    const onError = (e) => {
      console.error('splash video element error', e, {
        src: video.src,
        readyState: video.readyState,
        networkState: video.networkState,
      });
      // Let user retry
      started = false;
      tapText.textContent = "Tap to Start";
      tapText.style.display = "block";
      video.pause();
      video.style.display = "none";
      clearPlaybackListeners({ clearTimer: true });
    };

    video.addEventListener("ended", onEnded, { once: true });
    video.addEventListener("error", onError, { once: true });

    // Helpful debug logging
    console.log('Attempting to play splash video', { src: videoSrc, evType: ev ? ev.type : undefined });

    video.src = videoSrc;

    // Try play unmuted first (because this is user gesture). If blocked, fall back to muted.
    video.muted = false;
    video.volume = 1.0;

    try {
      await video.play();
      console.log('splash video started (unmuted)', { readyState: video.readyState, duration: video.duration });
    } catch (e) {
      console.warn('unmuted play blocked or failed, trying muted play', e);
      // Try muted play (works around autoplay-with-sound policies)
      try {
        video.muted = true;
        await video.play();
        console.log('splash video started (muted)', { readyState: video.readyState, duration: video.duration });
        // Let user know sound is available on another tap
        tapText.textContent = "Tap to enable sound";
        tapText.style.display = "block";
        // Allow a single extra tap to unmute and continue
        const enableSoundOnce = async (ev2) => {
          try {
            video.muted = false;
            // attempt to keep playing (unmute may be enough)
            await video.play();
            tapText.style.display = "none";
            console.log('user enabled sound');
          } catch (err) {
            console.error('unmute attempt failed', err);
            tapText.textContent = "Sound blocked";
            tapText.style.display = "block";
          } finally {
            // remove this handler after first use
            splash.removeEventListener('pointerup', enableSoundOnce);
            splash.removeEventListener('keydown', enableSoundOnce);
          }
        };
        // add handler to unmute on next tap/key
        splash.addEventListener('pointerup', enableSoundOnce, { once: true });
        splash.addEventListener('keydown', enableSoundOnce, { once: true });
      } catch (err2) {
        console.error('muted play also failed', err2);
        // Give control back to user
        started = false;
        tapText.textContent = "Tap again";
        tapText.style.display = "block";
        video.pause();
        video.style.display = "none";
        clearPlaybackListeners({ clearTimer: true });
        return;
      }
    }
  };

  // Use a single activation event and also support keyboard activation for accessibility.
  splash.addEventListener("pointerup", start);
  splash.addEventListener("keydown", start);

  // Optional: expose a programmatic test function for debugging in console
  window._maccymatch_test_start = start;
});
