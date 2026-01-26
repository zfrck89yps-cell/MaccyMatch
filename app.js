let started = false;

function renderMenu() {
  const app = document.getElementById("app");
  app.className = "menu";

  // NOTE: NO extra titles here (your background already has them)
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

  // category click (placeholder for now)
  app.querySelectorAll(".cardBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-cat");
      console.log("Category:", cat);
      // TODO: route to game screen
      alert(`Category: ${cat}`);
    });
  });

  // difficulty
  const saved = localStorage.getItem("mm_difficulty") || "easy";
  setDifficulty(saved);

  app.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      setDifficulty(dot.getAttribute("data-level"));
    });
  });
}

function setDifficulty(level) {
  localStorage.setItem("mm_difficulty", level);
  document.querySelectorAll(".dot").forEach(d => {
    d.classList.toggle("active", d.getAttribute("data-level") === level);
  });
}

function showApp() {
  const app = document.getElementById("app");
  app.style.display = "block";
  renderMenu();
}

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 400);
}

window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  // Ensure splash image is visible immediately
  img.style.display = "block";
  video.style.display = "none";

  const start = async () => {
    if (started) return;
    started = true;

    tapText.style.display = "none";

    // Show video above the image
    video.style.display = "block";
    video.currentTime = 0;
    video.muted = false;   // allow sound (user gesture)
    video.volume = 1.0;

    // If iOS still blocks unmuted, we’ll fall back but keep video playing
    try {
      await video.play();
    } catch (err) {
      // try muted fallback so at least video plays
      try {
        video.muted = true;
        await video.play();
        // optional: show hint if you want
        // tapText.textContent = "Tap for sound";
        // tapText.style.display = "block";
      } catch (err2) {
        // if even muted fails, just go to menu
        hideSplash();
        showApp();
        return;
      }
    }

    // When video ends, go to menu
    const endSplash = () => {
      hideSplash();
      showApp();
    };

    video.addEventListener("ended", endSplash, { once: true });

    // safety timeout based on duration (prevents cut off / too-early hide)
    const safetyMs = Number.isFinite(video.duration) && video.duration > 0
      ? Math.ceil(video.duration * 1000) + 300
      : 4000;

    setTimeout(endSplash, safetyMs);
  };

  // Use pointerup for iPad Safari reliability
  splash.addEventListener("pointerup", start, { once: true });
});
