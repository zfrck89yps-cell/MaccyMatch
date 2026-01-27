// app.js (Match menu + Memory menu + Memory game 8 cards face-down)
// - NO difficulty UI
// - Memory button bottom-right opens memory menu
// - Memory menu uses Memory-menu.png background
// - Animals on memory menu -> 8-card memory game face-down

function renderMatchMenu() {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "menu";

  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid" aria-label="Categories">

        <button class="catCardBtn" id="matchAnimals" aria-label="Animals">
          <img class="catImg" src="./Assets/Animals.PNG" alt="Animals">
        </button>

        <button class="catCardBtn placeholder" disabled>Vehicles</button>
        <button class="catCardBtn placeholder" disabled>Food</button>
        <button class="catCardBtn placeholder" disabled>Numbers</button>
        <button class="catCardBtn placeholder" disabled>Colours</button>
        <button class="catCardBtn placeholder" disabled>Shapes</button>
      </div>
    </div>

    <div class="scrollHint">‹ ›</div>

    <button class="memoryBtn" id="memoryBtn" aria-label="Maccy Memory">
      <img src="./Assets/Memory-button.PNG" alt="Maccy Memory">
    </button>
  `;

  // Match menu Animals (keep it doing something simple for now)
  const matchAnimals = document.getElementById("matchAnimals");
  if (matchAnimals) {
    matchAnimals.addEventListener("click", () => {
      // If you want Match mode later, wire it here.
      // For now, send to memory menu to avoid confusion:
      renderMemoryMenu();
    });
  }

  // Go to Memory menu
  const memoryBtn = document.getElementById("memoryBtn");
  if (memoryBtn) memoryBtn.addEventListener("click", renderMemoryMenu);
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

        <button class="catCardBtn placeholder" disabled>Vehicles</button>
        <button class="catCardBtn placeholder" disabled>Food</button>
        <button class="catCardBtn placeholder" disabled>Numbers</button>
        <button class="catCardBtn placeholder" disabled>Colours</button>
        <button class="catCardBtn placeholder" disabled>Shapes</button>
      </div>
    </div>

    <div class="scrollHint">‹ ›</div>

    <!-- Optional: tap Memory button again returns to Match menu -->
    <button class="memoryBtn" id="backToMatch" aria-label="Back to Match menu">
      <img src="./Assets/Memory-button.PNG" alt="Back">
    </button>
  `;

  const memAnimals = document.getElementById("memAnimals");
  if (memAnimals) memAnimals.addEventListener("click", startMemoryAnimals);

  const backBtn = document.getElementById("backToMatch");
  if (backBtn) backBtn.addEventListener("click", renderMatchMenu);
}

function startMemoryAnimals() {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "game";

  // 4 pairs = 8 cards (change these filenames to match your Assets exactly)
  const picks = [
    { key: "cat",     src: "./Assets/Cat.png" },
    { key: "dog",     src: "./Assets/Dog.png" },
    { key: "duck",    src: "./Assets/Duck.png" },
    { key: "lion",    src: "./Assets/Lion.png" }, // you have Lion.png in your list
  ];

  const deck = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" id="gameGrid" aria-label="Maccy Memory">
        ${deck.map(c => `
          <button class="gameCard" data-key="${c.key}" data-id="${c.id}" aria-label="card">
            <div class="cardFace cardBack"></div>
            <div class="cardFace cardFront">
              <img src="${c.src}" alt="${c.key}">
            </div>
          </button>
        `).join("")}
      </div>
    </div>

    <button class="memoryBtn" id="backToMenu" aria-label="Back to Memory menu">
      <img src="./Assets/Memory-button.PNG" alt="Back to menu">
    </button>
  `;

  const backToMenu = document.getElementById("backToMenu");
  if (backToMenu) backToMenu.addEventListener("click", renderMemoryMenu);

  const grid = document.getElementById("gameGrid");
  if (!grid) return;

  let first = null;
  let second = null;
  let locked = false;
  let matchedCount = 0;

  grid.querySelectorAll(".gameCard").forEach(card => {
    card.addEventListener("click", () => {
      if (locked) return;
      if (card.classList.contains("matched")) return;
      if (card === first) return;

      card.classList.add("flipped");

      if (!first) {
        first = card;
        return;
      }

      second = card;
      locked = true;

      const k1 = first.dataset.key;
      const k2 = second.dataset.key;

      if (k1 === k2) {
        first.classList.add("matched");
        second.classList.add("matched");
        matchedCount += 2;

        first = null;
        second = null;
        locked = false;

        burstConfetti(700);

        if (matchedCount === 8) {
          winSequence();
        }
      } else {
        setTimeout(() => {
          first.classList.remove("flipped");
          second.classList.remove("flipped");
          first = null;
          second = null;
          locked = false;
        }, 650);
      }
    });
  });

  function winSequence() {
    burstConfetti(1600);

    const overlay = document.createElement("div");
    overlay.className = "winOverlay";
    overlay.innerHTML = `<div class="winText">Well done!</div>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      renderMemoryMenu();
    }, 3500);
  }
}

/* ---------- CONFETTI (CANVAS) ---------- */
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

/* ---------- STARTUP (keeps your working splash flow) ---------- */
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
