function renderMenu() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div style="
      width:100%; height:100%;
      display:flex; flex-direction:column;
      align-items:center; justify-content:flex-start;
      padding-top:40px;
      ">
      <div style="
        font-size:64px;
        font-weight:1000;
        color:#FFD84D;
        text-shadow: 0 4px 0 #C97A00, 0 12px 20px rgba(0,0,0,0.35);
        ">
        Maccy Match!
      </div>

      <div style="
        margin-top:10px;
        font-size:34px;
        font-weight:900;
        color:#FFE9A6;
        text-shadow: 0 3px 0 rgba(0,0,0,0.25);
      ">
        Pick a Category
      </div>

      <div style="margin-top:30px; font-size:28px; font-weight:800; color:#222; background:rgba(255,255,255,0.75); padding:16px 24px; border-radius:18px;">
        (Menu placeholder – we’ll add the 6 category cards next)
      </div>
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
  // Always render menu immediately (so you never get a black screen)
  renderMenu();

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  if (!splash || !video || !img) {
    // If splash elements missing, just run menu
    return;
  }

  let started = false;

  const start = async () => {
    if (started) return;
    started = true;

    tapText.style.display = "none";

    // Ensure the MP4 path matches EXACTLY your repo
    video.src = "./Assets/Splash.mp4?v=1";
    video.currentTime = 0;
    video.style.display = "block";
    video.muted = false;      // you want sound
    video.volume = 1.0;

    // Try play (iOS requires this to be directly from a user gesture)
    try {
      await video.play();
    } catch (e) {
      // If unmuted is blocked, try muted fallback
      try {
        video.muted = true;
        await video.play();
      } catch (e2) {
        // If video can’t play at all, don’t block the app
        hideSplash();
        return;
      }
    }

    // Hide the still image once video is actually playing
    img.style.opacity = "0";

    // Hide splash when video ends (don’t cut it off early)
    video.addEventListener("ended", () => {
      hideSplash();
    }, { once: true });

    // Safety fallback AFTER metadata is loaded (use real duration)
    video.addEventListener("loadedmetadata", () => {
      const durMs = Math.ceil((video.duration || 3) * 1000);
      setTimeout(() => hideSplash(), durMs + 250);
    }, { once: true });
  };

  // Use pointerup to avoid double firing (click + touchstart)
  splash.addEventListener("pointerup", start, { once: true });

  // Optional: if pointer events aren’t available on some iOS oddities
  splash.addEventListener("touchend", start, { once: true });
});
