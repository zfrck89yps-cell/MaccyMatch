// Maccy Match - Menu + Animals Easy (6 cards / 3 pairs), face-up cards,
// match = smash animation + confetti, wrong = nothing,
// complete = Well done + confetti, return to menu after 5s.

// -------------------------
// Helpers
// -------------------------
function $(sel) { return document.querySelector(sel); }

function showApp() {
  const app = $("#app");
  app.style.display = "block";
}

function hideSplash() {
  const splash = $("#splash");
  if (!splash) return;
  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 400);
}

function setDifficulty(level) {
  localStorage.setItem("mm_difficulty", level);
  document.querySelectorAll(".dot").forEach(d => {
    d.classList.toggle("active", d.dataset.level === level);
  });
}

function getDifficulty() {
  return localStorage.getItem("mm_difficulty") || "easy";
}

// -------------------------
// MENU
// -------------------------
function renderMenu() {
  const app = $("#app");
  app.className = "menu";

  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid" aria-label="Categories">
        <button class="catCard" id="catAnimals" aria-label="Animals">
          <img class="catImg" src="./Assets/Animals.PNG" alt="Animals">
        </button>

        <button class="catCard" disabled aria-label="Vehicles (coming soon)">
          <div class="placeholderText">Vehicles</div>
        </button>

        <button class="catCard" disabled aria-label="Food (coming soon)">
          <div class="placeholderText">Food</div>
        </button>

        <button class="catCard" disabled aria-label="Numbers (coming soon)">
          <div class="placeholderText">Numbers</div>
        </button>

        <button class="catCard" disabled aria-label="Colours (coming soon)">
          <div class="placeholderText">Colours</div>
        </button>

        <button class="catCard" disabled aria-label="Shapes (coming soon)">
          <div class="placeholderText">Shapes</div>
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

  // restore difficulty UI
  setDifficulty(getDifficulty());
  document.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      setDifficulty(dot.dataset.level);
    });
  });

  // Animals starts game (for now ALWAYS easy as requested)
  $("#catAnimals").addEventListener("click", () => startAnimalsEasy());
}

// -------------------------
// ANIMALS EASY (6 cards / 3 pairs)
// -------------------------
const ANIMALS_EASY = ["Cat", "Dog", "Duck"]; // 3 pairs -> 6 cards

function startAnimalsEasy() {
  const app = $("#app");
  app.className = "game";

  // Build deck: 2 of each
  const deck = shuffle([...ANIMALS_EASY, ...ANIMALS_EASY]);

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" id="gameGrid" aria-label="Animal cards"></div>
    </div>

    <!-- keep difficulty UI visible in game too (optional but nice) -->
    <div class="difficulty" id="difficultyBox">
      <div class="difficultyTitle">Difficulty</div>
      <div class="dots">
        <div class="dot g" data-level="easy" title="Beginner"></div>
        <div class="dot y" data-level="medium" title="Intermediate"></div>
        <div class="dot r" data-level="hard" title="Hard"></div>
      </div>
    </div>
  `;

  // difficulty dots still work (even though animals always launches easy right now)
  setDifficulty(getDifficulty());
  document.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      setDifficulty(dot.dataset.level);
    });
  });

  const grid = $("#gameGrid");

  // Render FACE-UP cards
  deck.forEach((name, idx) => {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.type = "button";
    btn.dataset.name = name;
    btn.dataset.idx = String(idx);

    // IMPORTANT: your assets are Capitalised like Cat.png, Dog.png etc.
    btn.innerHTML = `<img src="./Assets/${name}.png" alt="${name}">`;
    grid.appendChild(btn);
  });

  runMatchLogic();
}

function runMatchLogic() {
  let first = null;
  let second = null;
  let lock = false;
  let matchedCount = 0;
  const totalPairs = ANIMALS_EASY.length;

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", async () => {
      if (lock) return;
      if (card.classList.contains("matched")) return;
      if (card === first) return;

      if (!first) {
        first = card;
        return;
      }

      second = card;
      lock = true;

      // Cards are face-up already, so no flip/turn animations.
      // If match -> smash + confetti, mark matched.
      if (first.dataset.name === second.dataset.name) {
        // mark disabled while we animate
        first.classList.add("disabled");
        second.classList.add("disabled");

        await smashMatch(first.dataset.name);

        first.classList.add("matched");
        second.classList.add("matched");

        matchedCount += 1;

        first.classList.remove("disabled");
        second.classList.remove("disabled");

        first = null;
        second = null;
        lock = false;

        if (matchedCount === totalPairs) {
          winSequence();
        }
        return;
      }

      // Wrong pair -> nothing happens (per your spec)
      first = null;
      second = null;
      lock = false;
    });
  });
}

// -------------------------
// Smash animation + confetti
// -------------------------
async function smashMatch(name) {
  const overlay = $("#smashOverlay");
  const pair = $("#smashPair");
  if (!overlay || !pair) return;

  pair.innerHTML = `
    <div class="smashImg"><img src="./Assets/${name}.png" alt="${name}"></div>
    <div class="smashImg"><img src="./Assets/${name}.png" alt="${name}"></div>
  `;

  overlay.classList.add("show");

  // quick confetti burst
  confettiBurst(180);

  // hold briefly then hide
  await wait(450);
  overlay.classList.remove("show");
  pair.innerHTML = "";
}

function winSequence() {
  // Big well done + confetti, then back to menu after 5s
  $("#winOverlay")?.classList.add("show");
  confettiBurst(420);

  setTimeout(() => {
    $("#winOverlay")?.classList.remove("show");
    renderMenu();
  }, 5000);
}

// -------------------------
// Confetti (simple canvas)
// -------------------------
let confettiRAF = null;

function confettiBurst(count = 200) {
  const canvas = $("#confetti");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const W = canvas.width;
  const H = canvas.height;

  // generate particles
  const parts = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: -20 - Math.random() * H * 0.2,
    vx: (Math.random() - 0.5) * 6,
    vy: 3 + Math.random() * 8,
    r: 4 + Math.random() * 7,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.2,
    life: 60 + Math.floor(Math.random() * 60)
  }));

  // stop any previous loop cleanly
  if (confettiRAF) cancelAnimationFrame(confettiRAF);

  let t = 0;
  function tick() {
    t++;
    ctx.clearRect(0, 0, W, H);

    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vy += 0.08; // gravity
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // random bright fill (no fixed palette)
      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 90%, 60%)`;
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.2);
      ctx.restore();
    }

    // keep only living particles
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].life <= 0 || parts[i].y > H + 60) parts.splice(i, 1);
    }

    if (parts.length > 0 && t < 180) {
      confettiRAF = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  tick();
}

// -------------------------
// Startup flow (your splash logic)
// -------------------------
window.addEventListener("load", () => {
  renderMenu();
  showApp();

  const splash = $("#splash");
  const tapText = $("#tapText");
  const img = $("#splashImg");
  const video = $("#splashVideo");

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

    let endedAlready = false;
    const endSplash = () => {
      if (endedAlready) return;
      endedAlready = true;
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

// -------------------------
// Utils
// -------------------------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}
