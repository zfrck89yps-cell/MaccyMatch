let started = false;

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
  // Always render menu BEHIND the splash immediately (prevents “black screen”)
  renderMenu();
  showApp();

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  // Start state: image visible, video hidden
  img.style.display = "block";
  video.style.display = "none";
  tapText.style.display = "block";

  const start = async () => {
    if (started) return;
    started = true;

    // keep PNG showing until video is ACTUALLY playing
    tapText.textContent = "Loading…";
    tapText.style.display = "block";

    // make sure we have the right file + bust cache
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
      // keep menu showing, just remove splash
      endSplash();
    };

    // Only swap from PNG -> video when frames are rendering
    const onPlaying = () => {
      tapText.style.display = "none";
      video.style.display = "block";
      img.style.display = "none";
      // safety timeout based on duration (prevents cutting it off early)
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
      // iOS sometimes blocks unmuted; try muted
      try {
        video.muted = true;
        await video.play();
        // if muted, still wait for "playing" before swapping
      } catch (e2) {
        failToMenu();
      }
    }
  };

  // pointerup works best on iPad Safari
  splash.addEventListener("pointerup", start);
});
