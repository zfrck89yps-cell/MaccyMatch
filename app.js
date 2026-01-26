// Improved startup flow: keep PNG until video is actually playing, robust fallbacks,
// and remove duplicate menu headers (Menu-background contains the title).
function renderMenu() {
  const app = document.getElementById("app");
  app.className = "menu";
  app.innerHTML = `
    <div class="menuWrap">
      <div class="grid">
        <button class="cardBtn" data-cat="animals"><span class="emoji">🐾</span>Animals</button>
        <button class="cardBtn" data-cat="vehicles"><span class="emoji">🚗</span>Vehicles</button>
        <button class="cardBtn" data-cat="food"><span class="emoji">🍎</span>Food</button>
        <button class="cardBtn" data-cat="numbers"><span class="emoji">🔢</span>Numbers</button>
        <button class="cardBtn" data-cat="colours"><span class="emoji">🎨</span>Colours</button>
        <button class="cardBtn" data-cat="shapes"><span class="emoji">🔷</span>Shapes</button>
      </div>
    </div>

    <div class="scrollHint">‹ ›</div>

    <div class="difficulty" id="difficultyBox">
      <div class="difficultyTitle">Difficulty</div>
      <div class="dots">
        <div class="dot g" data-level="easy" title="Beginner"></div>
        <div class="dot y" data-level="medium" title="Intermediate"></div>
        <div class="dot r" data-level="hard" title="Hard"></div>
      </div>
    </div>
  `;

  app.querySelectorAll(".cardBtn").forEach(btn => {
    btn.addEventListener("click", () => alert(`Category: ${btn.dataset.cat}`));
  });

  const saved = localStorage.getItem("mm_difficulty") || "easy";
  setDifficulty(saved);
  app.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      setDifficulty(dot.dataset.level);
    });
  });
}

function setDifficulty(level) {
  localStorage.setItem("mm_difficulty", level);
  document.querySelectorAll(".dot").forEach(d => {
    d.classList.toggle("active", d.dataset.level === level);
  });
}

function showApp() {
  const app = document.getElementById("app");
  app.style.display = "block";
}

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 400);
}

window.addEventListener("load", () => {
  // Render menu behind splash immediately so you never get a black screen when splash is removed
  renderMenu();
  showApp();

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  if (!splash || !video || !img) {
    // If splash elements missing, just run menu
    return;
  }

  // Start state: image visible, video hidden
  img.style.display = "block";
  img.style.opacity = "1";
  video.style.display = "none";
  tapText.style.display = "block";

  let started = false;

  const start = async () => {
    if (started) return;
    started = true;

    // Keep the PNG visible until the video is actually rendering frames
    tapText.textContent = "Loading…";
    tapText.style.display = "block";

    // Ensure the MP4 path matches EXACTLY your repo and bust cache after deploys
    video.src = "./Assets/Splash.mp4?v=" + Date.now();
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1.0;

    let endedAlready = false;
    const endSplash = () => {
      if (endedAlready) return;
      endedAlready = true;
      hideSplash();
    };

    video.addEventListener("ended", endSplash, { once: true });

    // If the video fails, don’t go black—just hide splash and show menu
    const failToMenu = () => {
      endSplash();
    };

    // Only swap from PNG -> video when frames are rendering
    const onPlaying = () => {
      tapText.style.display = "none";
      video.style.display = "block";
      img.style.display = "none";

      // use video.duration when available; safety buffer
      const ms = (Number.isFinite(video.duration) && video.duration > 0)
        ? Math.ceil(video.duration * 1000) + 400
        : 4500;
      setTimeout(endSplash, ms);
    };

    video.addEventListener("playing", onPlaying, { once: true });
    video.addEventListener("error", failToMenu, { once: true });

    try {
      await video.play();
    } catch (e) {
      // Unmuted play was blocked in some browsers; try muted fallback
      try {
        video.muted = true;
        await video.play();
        // still wait for "playing" before swapping images
      } catch (e2) {
        // If video can’t play at all, don’t block the app
        failToMenu();
      }
    }
  };

  // pointerup works best on iPad Safari
  splash.addEventListener("pointerup", start);
  // fallback
  splash.addEventListener("touchend", start);
});
