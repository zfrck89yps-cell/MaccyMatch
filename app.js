function renderMenu() {
  document.getElementById("app").innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:42px;font-weight:900;">
      Main Menu
    </div>
  `;
}

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 400);
}

window.addEventListener("load", () => {
  renderMenu();

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  let started = false;
  let safetyTimer = null;

  const start = async () => {
    if (started) return;
    started = true;

    tapText.style.display = "none";

    // IMPORTANT: exact filename & path (match your repo exactly)
    video.src = "/MaccyMatch/Assets/Splash.mp4?v=10";
    video.currentTime = 0;

    // show the video *above* the image
    video.style.display = "block";
    video.style.zIndex = "2";
    img.style.zIndex = "1";

    // Try with sound first
    video.muted = false;
    video.volume = 1.0;

    // When metadata loads, schedule a safety hide based on real duration
    const setSafetyFromDuration = () => {
      if (!isFinite(video.duration) || video.duration <= 0) return;
      clearTimeout(safetyTimer);
      // duration in ms + little buffer
      safetyTimer = setTimeout(hideSplash, Math.ceil(video.duration * 1000) + 400);
    };

    video.addEventListener("loadedmetadata", setSafetyFromDuration, { once: true });
    video.addEventListener("ended", () => {
      clearTimeout(safetyTimer);
      hideSplash();
    }, { once: true });

    try {
      await video.play();
    } catch (e) {
      // iOS Safari likely blocked autoplay-with-sound
      // Keep splash up, show message, and allow another tap attempt
      started = false;
      tapText.textContent = "Tap again";
      tapText.style.display = "block";

      // Hide video layer so you don't get black
      video.pause();
      video.style.display = "none";

      return;
    }
  };

  // Use only ONE event to avoid double-trigger issues on iOS
  splash.addEventListener("pointerup", start);
});
