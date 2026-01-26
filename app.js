/* Improved splash start logic:
   - Derives the MP4 path from the splash image src (avoids case/path mismatches)
   - Tries unmuted play first, falls back to muted if blocked
   - Adds robust logging and error handlers
   - Keeps pointer events off the image so the container receives taps
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

  const setSafetyFromDuration = () => {
    if (!isFinite(video.duration) || video.duration <= 0) return;
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(hideSplash, Math.ceil(video.duration * 1000) + 400);
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

    // If no replacement happened, fallback to a relative Assets path (adjust if your repo uses different folder)
    if (videoSrc === imgSrc) {
      videoSrc = './Assets/Splash.mp4';
    }

    // Add a cache-busting query only if there was none (optional)
    if (!/\?/.test(videoSrc)) {
      videoSrc += '?v=10';
    }

    video.src = videoSrc;
    video.currentTime = 0;

    // show the video above the image
    video.style.display = "block";
    video.style.zIndex = "2";
    img.style.zIndex = "1";

    // remove any previously attached listeners
    video.removeEventListener("loadedmetadata", setSafetyFromDuration);
    video.removeEventListener("ended", hideSplash);

    video.addEventListener("loadedmetadata", setSafetyFromDuration, { once: true });
    video.addEventListener("ended", () => {
      clearTimeout(safetyTimer);
      hideSplash();
    }, { once: true });

    // Helpful debug logging
    console.log('Attempting to play splash video', { src: video.src, evType: ev ? ev.type : undefined });

    // Try play unmuted first (because this is user gesture). If blocked, fall back to muted.
    video.muted = false;
    video.volume = 1.0;

    // Error handler to capture network/decoding errors
    video.addEventListener('error', (e) => {
      console.error('splash video element error', e, {
        src: video.src,
        networkState: video.networkState,
        readyState: video.readyState,
      });
      // Let user retry
      started = false;
      tapText.textContent = "Tap to Start";
      tapText.style.display = "block";
      video.pause();
      video.style.display = "none";
    }, { once: true });

    try {
      await video.play();
      console.log('splash video started (unmuted)');
    } catch (e) {
      console.warn('unmuted play blocked or failed, trying muted play', e);
      // Try muted play (works around autoplay-with-sound policies)
      try {
        video.muted = true;
        await video.play();
        console.log('splash video started (muted)');
        // Let user know sound is available on another tap
        tapText.textContent = "Tap to enable sound";
        tapText.style.display = "block";
        // Allow a single extra tap to unmute and continue
        const enableSoundOnce = async () => {
          try {
            video.muted = false;
            await video.play(); // usually still playing; unmute may be enough
            tapText.style.display = "none";
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
