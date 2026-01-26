// -------------------------
// Helpers
// -------------------------
function $(id) { return document.getElementById(id); }

function hideSplashAndShowApp() {
  const splash = $("splash");
  if (!splash) return;

  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 450);

  // Ensure app is visible (menu will already be rendered)
  const app = $("app");
  if (app) app.style.display = "block";
}

// -------------------------
// MENU UI
// -------------------------
const STATE = {
  difficulty: "beginner", // beginner | intermediate | hard
  categories: [
    { id: "animals", label: "Animals", icon: "🐾" },
    { id: "vehicles", label: "Vehicles", icon: "🚗" },
    { id: "food", label: "Food", icon: "🍎" },
    { id: "numbers", label: "Numbers", icon: "🔢" },
    { id: "colours", label: "Colours", icon: "🎨" },
    { id: "shapes", label: "Shapes", icon: "🔷" },
  ],
};

function setDifficulty(next) {
  STATE.difficulty = next;
  renderMenu();
}

function renderMenu() {
  const app = $("app");
  if (!app) return;

  app.innerHTML = `
    <div class="menu">
      <div class="menu__bg"></div>
      <div class="menu__content">
        <header class="menu__header">
          <div class="menu__title">Maccy Match!</div>
          <div class="menu__subtitle">Pick a Category</div>
        </header>

        <main class="menu__grid" aria-label="Category list">
          ${STATE.categories.map(c => `
            <button class="catCard" data-cat="${c.id}" aria-label="${c.label}">
              <div class="catCard__icon">${c.icon}</div>
              <div class="catCard__label">${c.label}</div>
            </button>
          `).join("")}
        </main>

        <div class="menu__footer">
          <div class="scrollHint" aria-hidden="true">
            <span class="chev">‹</span>
            <span class="chev">›</span>
          </div>

          <div class="difficulty">
            <div class="difficulty__label">Difficulty</div>
            <div class="difficulty__dots" role="group" aria-label="Difficulty">
              <button class="dot ${STATE.difficulty==="beginner" ? "active" : ""}" data-diff="beginner" aria-label="Beginner (green)"></button>
              <button class="dot ${STATE.difficulty==="intermediate" ? "active" : ""}" data-diff="intermediate" aria-label="Intermediate (yellow)"></button>
              <button class="dot ${STATE.difficulty==="hard" ? "active" : ""}" data-diff="hard" aria-label="Hard (red)"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Menu styles injected once (keeps things simple)
  if (!document.getElementById("menuStyles")) {
    const style = document.createElement("style");
    style.id = "menuStyles";
    style.textContent = `
      .menu{
        position:relative;
        width:100%;
        height:100%;
        overflow:hidden;
      }
      .menu__bg{
        position:absolute;
        inset:0;
        background-image: url("./Assets/Menu-background.png?v=1");
        background-size: cover;
        background-position: center;
        filter: saturate(1.05);
      }
      .menu__content{
        position:relative;
        z-index:1;
        width:100%;
        height:100%;
        padding: 22px 22px 18px;
        display:flex;
        flex-direction:column;
      }
      .menu__header{
        text-align:center;
        margin-top: 6px;
        margin-bottom: 10px;
      }
      .menu__title{
        font-size: clamp(34px, 5vw, 64px);
        font-weight: 1000;
        color: #FFD84D;
        text-shadow: 0 5px 0 #C97A00, 0 14px 22px rgba(0,0,0,.25);
        letter-spacing: .5px;
      }
      .menu__subtitle{
        margin-top: 6px;
        font-size: clamp(18px, 2.3vw, 30px);
        font-weight: 900;
        color: rgba(255,255,255,.95);
        text-shadow: 0 3px 10px rgba(0,0,0,.25);
      }

      .menu__grid{
        flex:1;
        display:grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        padding: 12px;
        align-content: center;
      }

      .catCard{
        border: 2px solid rgba(255,255,255,.55);
        background: rgba(255,255,255,.78);
        border-radius: 18px;
        box-shadow: 0 12px 24px rgba(0,0,0,.18);
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        padding: 18px 10px;
        cursor:pointer;
        touch-action: manipulation;
      }
      .catCard:active{ transform: scale(.98); }
      .catCard__icon{
        font-size: clamp(34px, 4.2vw, 60px);
        line-height: 1;
        margin-bottom: 10px;
      }
      .catCard__label{
        font-size: clamp(16px, 2.2vw, 24px);
        font-weight: 1000;
        color: #1a1a1a;
      }

      .menu__footer{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        padding: 0 10px 8px;
      }
      .scrollHint{
        display:flex;
        gap: 10px;
        align-items:center;
        opacity: .9;
        color: rgba(255,255,255,.95);
        text-shadow: 0 4px 14px rgba(0,0,0,.35);
      }
      .chev{
        font-size: 28px;
        font-weight: 1000;
        animation: nudge 1.4s ease-in-out infinite;
      }
      .chev:last-child{ animation-delay: .2s; }
      @keyframes nudge{
        0%{ transform: translateX(0); opacity:.7; }
        50%{ transform: translateX(4px); opacity:1; }
        100%{ transform: translateX(0); opacity:.7; }
      }

      .difficulty{
        text-align:right;
        padding: 10px 14px;
        border-radius: 16px;
        background: rgba(0,0,0,.18);
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,.25);
      }
      .difficulty__label{
        font-size: 14px;
        font-weight: 900;
        color: rgba(255,255,255,.95);
        margin-bottom: 8px;
      }
      .difficulty__dots{
        display:flex;
        gap: 10px;
        justify-content:flex-end;
      }
      .dot{
        width: 16px; height: 16px;
        border-radius: 999px;
        border: 2px solid rgba(255,255,255,.9);
        box-shadow: 0 8px 14px rgba(0,0,0,.25);
        cursor:pointer;
      }
      .dot[data-diff="beginner"]{ background:#3BE36A; }
      .dot[data-diff="intermediate"]{ background:#FFD84D; }
      .dot[data-diff="hard"]{ background:#FF4D4D; }
      .dot.active{ outline: 4px solid rgba(255,255,255,.55); }
    `;
    document.head.appendChild(style);
  }

  // Wire clicks
  app.querySelectorAll(".catCard").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-cat");
      // For now just confirm it’s working
      alert(`Category: ${id}\nDifficulty: ${STATE.difficulty}`);
    });
  });

  app.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      const diff = dot.getAttribute("data-diff");
      setDifficulty(diff);
      e.stopPropagation();
    });
  });
}

// -------------------------
// Splash logic
// -------------------------
window.addEventListener("load", () => {
  // Always render the menu behind the splash
  renderMenu();

  const splash = $("splash");
  const tapText = $("tapText");
  const video = $("splashVideo");

  if (!splash || !tapText || !video) return;

  let started = false;
  let safetyTimer = null;

  const start = async () => {
    if (started) return;
    started = true;

    tapText.style.display = "none";

    // Show video and play with sound (user gesture from tap)
    video.style.display = "block";
    video.src = "./Assets/Splash.mp4?v=1";
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1.0;

    // Important on iOS: load then play
    video.load();

    // Clear any old listeners/timers
    if (safetyTimer) clearTimeout(safetyTimer);

    const endSplash = () => {
      video.pause();
      hideSplashAndShowApp();
    };

    video.addEventListener("ended", endSplash, { once: true });

    try {
      await video.play();
    } catch (err) {
      // If unmuted is blocked, try muted (iOS can be strict sometimes)
      try {
        video.muted = true;
        await video.play();

        // Optional: tell you sound was blocked
        tapText.textContent = "Tap to enable sound";
        tapText.style.display = "block";

        // Next tap unmutes
        const unmuteOnce = async () => {
          tapText.style.display = "none";
          try {
            video.muted = false;
            await video.play();
          } catch (_) {}
        };
        splash.addEventListener("pointerup", unmuteOnce, { once: true });
      } catch (err2) {
        // If even muted fails, just skip to menu
        endSplash();
        return;
      }
    }

    // Safety fallback: only if "ended" never fires (rare)
    safetyTimer = setTimeout(endSplash, 12000);
  };

  // Pointer events cover both mouse + touch reliably
  splash.addEventListener("pointerup", start, { once: true });

  // Keyboard (iPad with keyboard)
  splash.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") start();
  });
});
