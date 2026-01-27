// app.js
// - Match Menu: 6 category cards + Memory button (bottom-right)
// - Memory Menu: new background + same categories
// - Memory Game: 8 cards face-down (4 pairs). Tap to flip, match stays, wrong flips back.
// - Win: "Well done!" + confetti, then back to Memory Menu
// - Splash flow unchanged

function renderMatchMenu() {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "menu";

  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid" aria-label="Categories">

        <button class="catCardBtn" id="catAnimals" aria-label="Animals">
          <img class="catImg" src="./Assets/Animals.PNG" alt="Animals">
        </button>

        <button class="catCardBtn placeholder" disabled aria-label="Vehicles (coming soon)">Vehicles</button>
        <button class="catCardBtn placeholder" disabled aria-label="Food (coming soon)">Food</button>
        <button class="catCardBtn placeholder" disabled aria-label="Numbers (coming soon)">Numbers</button>
        <button class="catCardBtn placeholder" disabled aria-label="Colours (coming soon)">Colours</button>
        <button class="catCardBtn placeholder" disabled aria-label="Shapes (coming soon)">Shapes</button>

      </div>
    </div>

    <div class="scrollHint">‹ ›</div>

    <button class="memoryBtn" id="memoryBtn" aria-label="Maccy Memory">
      <img src="./Assets/Memory-button.PNG" alt="Maccy Memory">
    </button>
  `;

  // Animals (match) — keep your old match game if you want later.
  // For now this just goes to memory concept only if you want.
  const animalsBtn = document.getElementById("catAnimals");
  if (animalsBtn) {
    animalsBtn.addEventListener("click", () => {
      // If you still want your old match mode, wire it here.
      // For now, send to memory menu to avoid confusion:
      renderMemoryMenu();
    });
  }

  const memBtn = document.getElementById("memoryBtn");
  if (memBtn) memBtn.addEventListener("click", renderMemoryMenu);
}

function renderMemoryMenu() {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "memoryMenu";

  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid" aria-label="Memory Categories">

        <button class="catCardBtn" id="memAnimals" aria-label="Animals">
          <img class="catImg" src="./Assets/Animals.PNG" alt="Animals">
        </button>

        <button class="catCardBtn placeholder" disabled aria-label="Vehicles (coming soon)">Vehicles</button>
        <button class="catCardBtn placeholder" disabled aria-label="Food (coming soon)">Food</button>
        <button class="catCardBtn placeholder" disabled aria-label="Numbers (coming soon)">Numbers</button>
        <button class="catCardBtn placeholder" disabled aria-label="Colours (coming soon)">Colours</button>
        <button class="catCardBtn placeholder" disabled aria-label="Shapes (coming soon)">Shapes</button>

      </div>
    </div>

    <div class="scrollHint">‹ ›</div>
  `;

  const animals = document.getElementById("memAnimals");
  if (animals) animals.addEventListener("click", () => startMemoryGame("animals"));
}

function startMemoryGame(category) {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "game";

  // 4 pairs = 8 cards
  // (Uses files you showed in Assets list)
  const picks = [
    { key: "cat",    src: "./Assets/Cat.png" },
    { key: "dog",    src: "./Assets/Dog.png" },
    { key: "duck",   src: "./Assets/Duck.png" },
    { key: "pig",    src: "./Assets/Pig.png" },
  ];

  const cards = shuffle(
    [...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` }))
  );

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" id="gameGrid" aria-label="Maccy Memory">
        ${cards.map(c => `
          <button class="gameCard" data-key="${c.key}" data-id="${c.id}" aria-label="Card">
            <div class="cardInner">
              <div class="cardFace cardBack"></div>
              <div class="cardFace cardFront">
                <img src="${c.src}" alt="${c.key}">
              </div>
            </div>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  const grid = document.getElementById("gameGrid");
  if (!grid) return;

  let first = null;
  let second = null;
  let locked = false;
  let matchedCount = 0;

  grid.querySelectorAll(".gameCard").forEach(btn => {
    btn.addEventListener("click", () => {
      if (locked) return;
      if (btn.classList.contains("matched")) return;
      if (btn === first) return;

      btn.classList.add("flipped");

      if (!first) {
        first = btn;
        return;
      }

      second = btn;
      locked = true;

      const k1 = first.dataset.key;
      const k2 = second.dataset.key;

      if (k1 === k2) {
        // match
        first.classList.add("matched");
        second.classList.add("matched");
        matchedCount += 2;

        first = null;
        second = null;
        locked = false;

        if (matchedCount === 8) {
          winSequence();
        }
      } else {
        // wrong -> flip back
        setTimeout(() => {
          first.classList.remove("flipped");
          second.classList.remove("flipped");
          first = null;
          second = null;
          locked = false;
        }, 700);
      }
    });
  });

  function winSequence() {
    burstConfetti(1800);

    const overlay = document.createElement("div");
    overlay.className = "winOverlay";
    overlay.innerHTML = `<div class="winText">Well done!</div>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      renderMemoryMenu();
    }, 2500);
  }
}

/* ---------- CONFETTI ---------- */
let confettiRAF = null;

function burstConfetti(durationMs = 800) {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const start = performance.now();
  const pieces = [];
  const count = 120;
  const colors = ["#FFD84D", "#35D05A", "#4DA3FF", "#FF4D4D", "#FF7AD9", "#FFFFFF"];

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 6,
      vy: 3 + Math.random() * 6,
      r: 3 + Math.random() * 5,
      a: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.3,
      c: colors[(Math.random() * colors.length) | 0]
    });
  }

  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.a += p.va;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    }

    if (elapsed < durationMs) {
      confettiRAF = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiRAF = null;
    }
  }

  if (confettiRAF) cancelAnimationFrame(confettiRAF);
  confettiRAF = requestAnimationFrame(frame);
}

/* ---------- UTIL ---------- */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showApp() {
  const app = document.getElementById("app");
  if (app) app.style.display = "block";
}

function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 400);
}

/* ---------- STARTUP (same splash flow) ---------- */
window.addEventListener("load", () => {
  renderMatchMenu();
  showApp();

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  if (!splash || !video || !img) return;

  img.style.display = "block";
  img.style.opacity = "1";
  video.style.display = "none";
  tapText.style.display = "block";

  let started = false;

  const start = async () => {
    if (started) return;
    started = true;

    tapText.textContent = "Loading…";
    tapText.style.display = "block";

    video.src = "./Assets/Splash.mp4?v=" + Date.now();
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1.0;

    let ended = false;
    const endSplash = () => {
      if (ended) return;
      ended = true;
      hideSplash();
    };

    video.addEventListener("ended", endSplash, { once: true });

    const failToMenu = () => endSplash();

    const onPlaying = () => {
      tapText.style.display = "none";
      video.style.display = "block";
      img.style.display = "none";

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
      try {
        video.muted = true;
        await video.play();
      } catch (e2) {
        failToMenu();
      }
    }
  };

  splash.addEventListener("pointerup", start);
  splash.addEventListener("touchend", start);
});
