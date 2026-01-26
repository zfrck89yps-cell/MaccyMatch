function renderMenu() {
  document.getElementById("app").innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      height:100%;
      font-size:42px;
      font-weight:900;">
      Main Menu
    </div>
  `;
}

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 450);
}

window.addEventListener("load", () => {
  // Render menu behind splash (so it’s ready)
  renderMenu();

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const video = document.getElementById("splashVideo");

  let started = false;

  const start = async (ev) => {
    if (started) return;
    started = true;

    if (ev && ev.type === "touchstart") {
      // iOS: prevents ghost clicks / delays
      ev.preventDefault();
    }

    // Hide “Tap to Start”
    tapText.style.display = "none";

    // Point to your mp4 (relative path for GitHub Pages)
    video.src = "./Assets/Splash.mp4?v=12";
    video.currentTime = 0;

    // Show video over the image
    video.style.display = "block";

    // Try with sound (must be started by user tap)
    video.muted = false;
    video.volume = 1.0;

    // If it ends, fade to menu
    const onEnded = () => hideSplash();
    video.addEventListener("ended", onEnded, { once: true });

    // Safety fallback: hide splash after duration is known
    const safetyTimer = setTimeout(() => hideSplash(), 6000);

    try {
      // Ensure metadata loads so iOS behaves
      video.load();

      await video.play();

      // If duration becomes available, use it instead of 6s
      const tryDuration = () => {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          clearTimeout(safetyTimer);
          setTimeout(() => hideSplash(), Math.ceil(video.duration * 1000) + 200);
        }
      };

      // Sometimes duration arrives after play starts
      video.addEventListener("loadedmetadata", tryDuration, { once: true });
      tryDuration();

    } catch (e) {
      // If play fails for any reason, just continue to menu
      hideSplash();
    }
  };

  // Reliable tap handlers for iOS + desktop
  splash.addEventListener("click", start, { once: true });
  splash.addEventListener("touchstart", start, { once: true, passive: false });
});
