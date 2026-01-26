function renderMenu() {
  const app = document.getElementById("app");

  // Placeholder menu (replace later)
  app.innerHTML = `
    <div style="
      font-size: 42px;
      font-weight: 700;
      text-align: center;
    ">
      Main Menu
    </div>
  `;
}

function fadeOutSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;

  splash.style.transition = "opacity 350ms ease";
  splash.style.opacity = "0";

  setTimeout(() => {
    splash.remove();
  }, 380);
}

window.addEventListener("load", () => {
  renderMenu();

  const idleVideo = document.getElementById("idleVideo");
  const splashVideo = document.getElementById("splashVideo");
  const tapOverlay = document.getElementById("tapOverlay");

  const startSplash = async () => {
    // Prevent double taps
    tapOverlay.remove();

    // Stop idle loop
    try {
      idleVideo.pause();
    } catch (e) {}

    idleVideo.style.opacity = "0";

    // Show splash video
    splashVideo.style.transition = "opacity 120ms ease";
    splashVideo.style.opacity = "1";

    try {
      splashVideo.currentTime = 0;
      splashVideo.muted = false; // allowed due to user tap
      await splashVideo.play();

      splashVideo.addEventListener(
        "ended",
        fadeOutSplash,
        { once: true }
      );

      // Safety fallback
      setTimeout(() => {
        if (document.getElementById("splash")) {
          fadeOutSplash();
        }
      }, 3500);

    } catch (err) {
      console.error("Splash playback failed:", err);
      fadeOutSplash();
    }
  };

  tapOverlay.addEventListener("click", startSplash, { once: true });
  tapOverlay.addEventListener("touchstart", startSplash, { once: true });
});
