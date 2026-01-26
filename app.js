// ====== MENU CONFIG ======
const CATEGORIES = [
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "vehicles", label: "Vehicles", emoji: "🚗" },
  { id: "objects", label: "Objects", emoji: "🧸" },
  { id: "numbers", label: "Numbers", emoji: "🔢" },
  { id: "food", label: "Food", emoji: "🍎" },
  { id: "colours", label: "Colours", emoji: "🎨" },
];

// difficulty: 0=beginner, 1=intermediate, 2=hard
const DIFF_KEY = "maccy_difficulty";
function getDifficulty() {
  const v = Number(localStorage.getItem(DIFF_KEY));
  return Number.isFinite(v) ? Math.max(0, Math.min(2, v)) : 0;
}
function setDifficulty(v) {
  localStorage.setItem(DIFF_KEY, String(v));
}

// ====== SPLASH HELPERS ======
function hideSplashAndShowMenu() {
  const splash = document.getElementById("splash");
  const app = document.getElementById("app");

  // show menu content
  renderMenu();

  // fade out splash and remove
  if (splash) {
    splash.classList.add("hidden");
    setTimeout(() => splash.remove(), 450);
  }

  // just in case
  if (app) app.style.display = "block";
}

// ====== MENU RENDER ======
function confettiBackgroundCSS() {
  // Pure CSS confetti-ish background (no extra file needed)
  // Gives you the same "colour + confetti" vibe.
  return `
    radial-gradient(circle at 20% 20%, rgba(255,255,255,.25), transparent 40%),
    radial-gradient(circle at 80% 15%, rgba(255,255,255,.22), transparent 45%),
    radial-gradient(circle at 30% 85%, rgba(255,255,255,.18), transparent 40%),
    linear-gradient(135deg, #4aa3ff 0%, #65e7ff 20%, #ffee66 45%, #ff8a5b 70%, #b56bff 100%),
    repeating-radial-gradient(circle at 10% 30%, rgba(255,255,255,.0) 0 10px, rgba(255,255,255,.08) 10px 11px),
    repeating-radial-gradient(circle at 70% 60%, rgba(0,0,0,.0) 0 13px, rgba(255,255,255,.06) 13px 14px)
  `;
}

function renderMenu() {
  const app = document.getElementById("app");
  if (!app) return;

  const diff = getDifficulty();

  app.innerHTML = `
    <div class="menuRoot">
      <div class="menuBg"></div>

      <header class="menuHeader">
        <div class="menuTitle">Maccy Match!</div>
        <div class="menuSubtitle">Choose a category</div>
      </header>

      <main class="menuMain">
        <div class="cardsWrap" id="cardsWrap">
          ${CATEGORIES.map(c => `
            <button class="catCard" data-cat="${c.id}">
              <div class="catEmoji">${c.emoji}</div>
              <div class="catLabel">${c.label}</div>
            </button>
          `).join("")}
        </div>

        <div class="scrollHint" aria-hidden="true">
          <span class="hintArrow">‹</span>
          <span class="hintDots">•••</span>
          <span class="hintArrow">›</span>
        </div>
      </main>

      <div class="difficultyBox" id="difficultyBox" role="button" tabindex="0" aria-label="Change difficulty">
        <div class="difficultyLabel">Difficulty</div>
        <div class="difficultyDots">
          <span class="dot dotGreen ${diff===0 ? "on" : ""}"></span>
          <span class="dot dotYellow ${diff===1 ? "on" : ""}"></span>
          <span class="dot dotRed ${diff===2 ? "on" : ""}"></span>
        </div>
      </div>
    </div>
  `;

  injectMenuStylesOnce();
  wireMenuEvents();
}

let menuStylesInjected = false;
function injectMenuStylesOnce() {
  if (menuStylesInjected) return;
  menuStylesInjected = true;

  const style = document.createElement("style");
  style.textContent = `
    .menuRoot{
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .menuBg{
      position: absolute;
      inset: 0;
      background-image: ${confettiBackgroundCSS()};
      background-size: cover;
      filter: saturate(1.05);
      transform: scale(1.02);
    }

    .menuHeader{
      position: relative;
      z-index: 1;
      padding: 28px 24px 10px;
      text-align: center;
      color: #1b1b1b;
    }

    .menuTitle{
      font-size: clamp(42px, 6vw, 78px);
      font-weight: 1000;
      letter-spacing: 0.5px;
      color: #ffd24d;
      text-shadow:
        0 4px 0 #c97a00,
        0 12px 22px rgba(0,0,0,.30);
      transform: rotate(-2deg);
      display: inline-block;
    }

    .menuSubtitle{
      margin-top: 8px;
      font-size: clamp(18px, 2.3vw, 30px);
      font-weight: 900;
      color: rgba(20,20,20,.85);
      text-shadow: 0 2px 10px rgba(255,255,255,.35);
    }

    .menuMain{
      position: relative;
      z-index: 1;
      height: calc(100% - 160px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 14px 24px 74px;
      gap: 14px;
    }

    .cardsWrap{
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      max-width: 980px;
      margin: 0 auto;
      width: 100%;
    }

    .catCard{
      border: none;
      border-radius: 26px;
      padding: 18px 14px;
      background: rgba(255,255,255,.88);
      box-shadow:
        0 10px 0 rgba(0,0,0,.10),
        0 18px 30px rgba(0,0,0,.20);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;
      min-height: 120px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 120ms ease;
    }

    .catCard:active{ transform: scale(0.98); }
    .catEmoji{ font-size: 44px; }
    .catLabel{ font-size: 24px; font-weight: 1000; color:#1b1b1b; }

    .scrollHint{
      text-align: center;
      font-weight: 1000;
      color: rgba(0,0,0,.55);
      text-shadow: 0 2px 10px rgba(255,255,255,.25);
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      font-size: 22px;
      margin-top: 4px;
      opacity: .9;
    }

    .hintArrow{ font-size: 28px; }
    .hintDots{ letter-spacing: 6px; }

    .difficultyBox{
      position: absolute;
      z-index: 2;
      right: 22px;
      bottom: 18px;
      background: rgba(255,255,255,.80);
      border-radius: 18px;
      padding: 12px 14px;
      box-shadow: 0 14px 24px rgba(0,0,0,.22);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .difficultyLabel{
      font-size: 16px;
      font-weight: 1000;
      color: rgba(0,0,0,.75);
    }

    .difficultyDots{
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: center;
    }

    .dot{
      width: 14px;
      height: 14px;
      border-radius: 999px;
      opacity: .25;
      transform: scale(0.95);
      transition: opacity 120ms ease, transform 120ms ease;
      box-shadow: 0 3px 8px rgba(0,0,0,.25);
    }

    .dot.on{
      opacity: 1;
      transform: scale(1.15);
    }

    .dotGreen{ background: #2ecc71; }
    .dotYellow{ background: #f1c40f; }
    .dotRed{ background: #e74c3c; }

    /* iPad landscape friendliness */
    @media (max-height: 520px){
      .menuHeader{ padding-top: 16px; }
      .menuMain{ padding-bottom: 52px; }
      .catCard{ min-height: 96px; }
      .catEmoji{ font-size: 38px; }
      .catLabel{ font-size: 20px; }
    }
  `;
  document.head.appendChild(style);
}

function wireMenuEvents() {
  // Category click (placeholder)
  document.querySelectorAll(".catCard").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-cat");
      console.log("Category selected:", cat, "difficulty:", getDifficulty());
      // TODO: start game with cat + difficulty
      alert(`Category: ${cat}\nDifficulty: ${["Beginner","Intermediate","Hard"][getDifficulty()]}`);
    });
  });

  // Difficulty click to cycle
  const box = document.getElementById("difficultyBox");
  if (!box) return;

  const cycle = () => {
    const next = (getDifficulty() + 1) % 3;
    setDifficulty(next);
    renderMenu(); // re-render to update dots
  };

  box.addEventListener("click", cycle);
  box.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") cycle();
  });
}

// ====== SPLASH STARTUP ======
window.addEventListener("load", () => {
  // render menu behind the splash so it's ready when splash disappears
  renderMenu();

  const splash = document.getElementById("splash");
  const img = document.getElementById("splashImg");
  const tapText = document.getElementById("tapText");
  const video = document.getElementById("splashVideo");

  if (!splash || !img || !tapText || !video) return;

  let started = false;
  let safetyTimer = null;

  const clearSafety = () => {
    if (safetyTimer) clearTimeout(safetyTimer);
    safetyTimer = null;
  };

  const setSafetyFromDuration = () => {
    const dur = Number(video.duration);
    const ms = (Number.isFinite(dur) && dur > 0 ? dur * 1000 : 3500) + 800; // generous buffer
    clearSafety();
    safetyTimer = setTimeout(() => {
      hideSplashAndShowMenu();
    }, ms);
  };

  const start = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (started) return;
    started = true;

    tapText.style.display = "none";

    // Use exact, known-good path
    const videoSrc = "./Assets/Splash.mp4?v=12";

    video.style.display = "block";
    video.currentTime = 0;
    video.pause();

    clearSafety();

    // Set src last, then load
    video.src = videoSrc;
    video.load();

    // Set safety once metadata is known
    video.onloadedmetadata = setSafetyFromDuration;

    video.onended = () => {
      clearSafety();
      hideSplashAndShowMenu();
    };

    try {
      video.muted = false;
      video.volume = 1.0;
      await video.play();
      // if metadata already loaded, start safety now
      if (video.readyState >= 1) setSafetyFromDuration();
    } catch (err) {
      // if unmuted is blocked, try muted (iOS edge cases)
      try {
        video.muted = true;
        await video.play();

        // allow tap to enable sound
        tapText.textContent = "Tap to enable sound";
        tapText.style.display = "block";

        const enableSoundOnce = async () => {
          try {
            video.muted = false;
            await video.play();
            tapText.style.display = "none";
          } catch (e2) {
            tapText.textContent = "Sound blocked";
            tapText.style.display = "block";
          }
        };
        splash.addEventListener("pointerup", enableSoundOnce, { once: true });

        if (video.readyState >= 1) setSafetyFromDuration();
      } catch (err2) {
        // fully failed: let them try again
        started = false;
        tapText.textContent = "Tap again";
        tapText.style.display = "block";
        video.pause();
        video.style.display = "none";
        clearSafety();
      }
    }
  };

  // IMPORTANT: use one event only
  splash.addEventListener("pointerup", start, { passive: false });
});
