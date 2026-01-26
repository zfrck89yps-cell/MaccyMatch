// Improved startup flow: keep PNG until video is actually playing, robust fallbacks,
// remove duplicate menu headers (Menu-background contains the title),
// and use Animals.PNG as the Animals category card with 5 placeholders.
function renderMenu() {
  const app = document.getElementById("app");
  app.className = "menu";

  app.innerHTML = `
    <div class="menuWrap">
      <!-- Grid starts lower because the title is baked into Menu-background.png -->
      <div class="grid" style="margin-top:22vh;">
        
        <!-- Animals category uses your image card -->
        <button class="cardBtn catCard" id="catAnimals" aria-label="Animals">
          <img
            class="catImg"
            src="./Assets/Animals.PNG"
            alt="Animals"
          />
        </button>

        <!-- 5 placeholders (same size) -->
        <button class="cardBtn catCard placeholder" disabled aria-label="Vehicles (coming soon)">
          <span class="phText">Vehicles</span>
        </button>

        <button class="cardBtn catCard placeholder" disabled aria-label="Food (coming soon)">
          <span class="phText">Food</span>
        </button>

        <button class="cardBtn catCard placeholder" disabled aria-label="Numbers (coming soon)">
          <span class="phText">Numbers</span>
        </button>

        <button class="cardBtn catCard placeholder" disabled aria-label="Colours (coming soon)">
          <span class="phText">Colours</span>
        </button>

        <button class="cardBtn catCard placeholder" disabled aria-label="Shapes (coming soon)">
          <span class="phText">Shapes</span>
        </button>

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

  // Link Animals card to begin
  document.getElementById("catAnimals").addEventListener("click", () => {
    // For now: always start Animals Easy (6 cards / 3 pairs) as you requested
    if (typeof startAnimalsEasy === "function") {
      startAnimalsEasy();
    } else {
      alert("startAnimalsEasy() not found yet.");
    }
  });

  // Keep difficulty settings working exactly as before
  const saved = localStorage.getItem("mm_difficulty") || "easy";
  setDifficulty(saved);

  app.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      setDifficulty(dot.dataset.level);
    });
  });

  // Minimal extra styles for the image-card + placeholders (won’t affect your existing CSS)
  if (!document.getElementById("menuExtraStyle")) {
    const style = document.createElement("style");
    style.id = "menuExtraStyle";
    style.textContent = `
      .catCard { padding: 0; overflow: hidden; }
      .catImg { width: 100%; height: 100%; object-fit: cover; display:block; border-radius: 16px; }

      .placeholder{
        display:flex;
        align-items:center;
        justify-content:center;
        background: rgba(255,255,255,0.65);
        border: 2px solid rgba(255,255,255,0.65);
        border-radius: 16px;
        color: rgba(0,0,0,0.55);
        font-weight: 900;
        font-size: 22px;
      }
      .placeholder:disabled { opacity: 0.75; }
      .phText { padding: 10px 14px; }
    `;
    document.head.appendChild(style);
  }
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

// ==============================
// ANIMALS EASY GAME (6 cards / 3 pairs) — FACE UP
// Match = smash to centre + confetti
// Wrong pick = nothing happens
// Finish = WELL DONE + confetti, return to menu after 5s
// ==============================

const ANIMALS_EASY_POOL = [
  { key: "cat",  img: "./Assets/Cat.png" },
  { key: "dog",  img: "./Assets/Dog.png" },
  { key: "duck", img: "./Assets/Duck.png" },
  { key: "cow",  img: "./Assets/Cow.png" },
  { key: "bear", img: "./Assets/Bear.png" },
  { key: "elephant", img: "./Assets/Elephant.png" },
];

function startAnimalsEasy() {
  // Choose 3 random animals for 3 pairs
  const picks = pickRandom(ANIMALS_EASY_POOL, 3);

  // Build deck: duplicate -> shuffle
  const deck = shuffle([
    ...picks.map((c, i) => ({ ...c, id: `${c.key}-a-${i}`, matched: false })),
    ...picks.map((c, i) => ({ ...c, id: `${c.key}-b-${i}`, matched: false })),
  ]);

  renderAnimalsBoard(deck);
}

function renderAnimalsBoard(deck) {
  const app = document.getElementById("app");
  app.className = "game";

  // Inline CSS for the game (so you don’t have to edit index yet)
  ensureGameCSS();

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" id="gameGrid"></div>

      <div class="smashStage" id="smashStage"></div>

      <div class="winOverlay" id="winOverlay">
        <div class="winText">WELL DONE!</div>
      </div>
    </div>
  `;

  const grid = document.getElementById("gameGrid");

  // Render all cards face-up
  deck.forEach(card => {
    const btn = document.createElement("button");
    btn.className = "gameCard";
    btn.dataset.id = card.id;
    btn.dataset.key = card.key;
    btn.innerHTML = `<img src="${card.img}" alt="${card.key}" draggable="false">`;
    grid.appendChild(btn);
  });

  let first = null;
  let second = null;
  let lock = false;
  let matches = 0;

  grid.querySelectorAll(".gameCard").forEach(el => {
    el.addEventListener("click", async () => {
      if (lock) return;
      if (el.classList.contains("matched")) return;
      if (first && el === first.el) return;

      el.classList.add("selected");

      if (!first) {
        first = { el, key: el.dataset.key };
        return;
      }

      second = { el, key: el.dataset.key };
      lock = true;

      if (first.key === second.key) {
        // Mark matched
        first.el.classList.add("matched");
        second.el.classList.add("matched");

        // Smash animation + confetti
        await smashMatch(first.el, second.el);

        // Clear selection
        first.el.classList.remove("selected");
        second.el.classList.remove("selected");

        matches += 1;
        first = null;
        second = null;
        lock = false;

        // 3 pairs total
        if (matches === 3) {
          winAndReturn();
        }
      } else {
        // Wrong pick: nothing happens (just remove highlight quickly)
        setTimeout(() => {
          first.el.classList.remove("selected");
          second.el.classList.remove("selected");
          first = null;
          second = null;
          lock = false;
        }, 250);
      }
    });
  });

  function winAndReturn() {
    const win = document.getElementById("winOverlay");
    win.classList.add("show");
    fireConfetti(160);

    setTimeout(() => {
      renderMenu();
    }, 5000);
  }
}

// ---------- Smash animation ----------
async function smashMatch(cardElA, cardElB) {
  const stage = document.getElementById("smashStage");
  if (!stage) return;

  stage.innerHTML = "";

  const imgA = cardElA.querySelector("img").src;
  const imgB = cardElB.querySelector("img").src;

  const a = document.createElement("div");
  a.className = "smashCard left";
  a.innerHTML = `<img src="${imgA}" alt="">`;

  const b = document.createElement("div");
  b.className = "smashCard right";
  b.innerHTML = `<img src="${imgB}" alt="">`;

  stage.appendChild(a);
  stage.appendChild(b);
  stage.classList.add("show");

  // confetti burst right on impact
  fireConfetti(90);

  await wait(650);

  stage.classList.remove("show");
  stage.innerHTML = "";
}

// ---------- Confetti (simple DOM confetti, no libs) ----------
function fireConfetti(count = 80) {
  const wrap = document.querySelector(".gameWrap") || document.body;
  const layer = document.createElement("div");
  layer.className = "confettiLayer";
  wrap.appendChild(layer);

  const colors = ["#FFD84D","#FF5C7A","#57D9FF","#7CFF7A","#B88CFF","#FF9D3D"];

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "confetti";
    p.style.left = (Math.random() * 100) + "vw";
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = (900 + Math.random() * 900) + "ms";
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(p);
  }

  setTimeout(() => layer.remove(), 1800);
}

// ---------- Helpers ----------
function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

// ---------- Game CSS injected once ----------
function ensureGameCSS() {
  if (document.getElementById("gameStyle")) return;

  const style = document.createElement("style");
  style.id = "gameStyle";
  style.textContent = `
    /* Game background */
    #app.game{
      background-image: url("./Assets/Game-background.png");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    .gameWrap{
      position:absolute;
      inset:0;
    }

    /* 6 cards = 3x2 layout */
    .gameGrid{
      position:absolute;
      inset: 0;
      display:grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
      padding: 14vh 8vw 10vh 8vw;
      align-content: center;
    }

    .gameCard{
      border:none;
      background: transparent;
      padding:0;
      cursor:pointer;
      border-radius: 18px;
      transform: translateZ(0);
    }
    .gameCard img{
      width:100%;
      height:auto;
      display:block;
      border-radius: 18px;
      object-fit: cover;
      outline: 10px solid rgba(255,255,255,0.86);
      outline-offset: -10px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.25);
    }
    .gameCard.selected{ transform: scale(1.02); }
    .gameCard.matched{ pointer-events:none; opacity: 0.75; }

    /* Smash stage in centre */
    .smashStage{
      position:absolute;
      inset:0;
      pointer-events:none;
      display:none;
      align-items:center;
      justify-content:center;
    }
    .smashStage.show{ display:flex; }

    .smashCard{
      width: min(32vw, 420px);
      border-radius: 18px;
      overflow:hidden;
      outline: 10px solid rgba(255,255,255,0.9);
      outline-offset: -10px;
      box-shadow: 0 22px 45px rgba(0,0,0,0.30);
      position:absolute;
    }
    .smashCard img{ width:100%; height:auto; display:block; }

    .smashCard.left{ animation: smashLeft 650ms ease forwards; }
    .smashCard.right{ animation: smashRight 650ms ease forwards; }

    @keyframes smashLeft{
      0%{ transform: translateX(-60vw) scale(1); }
      70%{ transform: translateX(-2vw) scale(1.08); }
      100%{ transform: translateX(0) scale(1.03); }
    }
    @keyframes smashRight{
      0%{ transform: translateX(60vw) scale(1); }
      70%{ transform: translateX(2vw) scale(1.08); }
      100%{ transform: translateX(0) scale(1.03); }
    }

    /* Confetti */
    .confettiLayer{
      position:absolute;
      inset:0;
      pointer-events:none;
      overflow:hidden;
      z-index: 50;
    }
    .confetti{
      position:absolute;
      top:-5vh;
      width: 12px;
      height: 18px;
      border-radius: 3px;
      animation-name: confettiFall;
      animation-timing-function: ease-in;
      opacity: 0.95;
    }
    @keyframes confettiFall{
      0%{ transform: translateY(0) rotate(0deg); opacity:1; }
      100%{ transform: translateY(110vh) rotate(380deg); opacity:0; }
    }

    /* Win overlay */
    .winOverlay{
      position:absolute;
      inset:0;
      display:none;
      align-items:center;
      justify-content:center;
      background: rgba(0,0,0,0.25);
      z-index: 80;
    }
    .winOverlay.show{ display:flex; }
    .winText{
      font-size: 64px;
      font-weight: 1000;
      color: #FFD84D;
      text-shadow: 0 6px 0 #C97A00, 0 16px 30px rgba(0,0,0,0.45);
      padding: 18px 28px;
      border-radius: 22px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(2px);
    }
  `;
  document.head.appendChild(style);
}
