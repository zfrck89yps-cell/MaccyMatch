// Maccy Match - Menu + Animals Matching (face-up) + smash animation + confetti + win return

// ---------- Helpers ----------
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

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

// ---------- Confetti ----------
const confetti = (() => {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0;
  let particles = [];
  let animId = null;
  let running = false;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function burst(x = W / 2, y = H / 2, count = 120) {
    const cols = ["#FFD84D", "#FF4D4D", "#35D05A", "#4DA3FF", "#FFFFFF", "#FF77D4"];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 4 + Math.random() * 10;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - (6 + Math.random() * 6),
        g: 0.35 + Math.random() * 0.25,
        r: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        life: 70 + Math.random() * 40,
        c: cols[(Math.random() * cols.length) | 0],
      });
    }
    start();
  }

  function start() {
    if (running) return;
    running = true;
    tick();
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    particles = [];
    ctx.clearRect(0, 0, W, H);
  }

  function tick() {
    animId = requestAnimationFrame(tick);
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r * 2, -p.r, p.r * 4, p.r * 2);
      ctx.restore();
    });

    particles = particles.filter(p => p.life > 0 && p.y < H + 60);

    if (particles.length === 0) {
      running = false;
      cancelAnimationFrame(animId);
      animId = null;
      ctx.clearRect(0, 0, W, H);
    }
  }

  return { burst, stop };
})();

// ---------- Menu ----------
function setDifficulty(level) {
  localStorage.setItem("mm_difficulty", level);
  document.querySelectorAll(".dot").forEach(d => {
    d.classList.toggle("active", d.dataset.level === level);
  });
}

function renderMenu() {
  const app = document.getElementById("app");
  app.className = "menu";

  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid" aria-label="Categories">
        <button class="catCardBtn" id="catAnimals" aria-label="Animals">
          <img class="catImg" src="./Assets/Animals.PNG" alt="Animals" />
        </button>

        <button class="catCardBtn placeholder" disabled aria-label="Vehicles (coming soon)">Vehicles</button>
        <button class="catCardBtn placeholder" disabled aria-label="Food (coming soon)">Food</button>
        <button class="catCardBtn placeholder" disabled aria-label="Numbers (coming soon)">Numbers</button>
        <button class="catCardBtn placeholder" disabled aria-label="Colours (coming soon)">Colours</button>
        <button class="catCardBtn placeholder" disabled aria-label="Shapes (coming soon)">Shapes</button>
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

  // Difficulty (keeps working)
  const saved = localStorage.getItem("mm_difficulty") || "easy";
  setDifficulty(saved);

  $all(".dot", app).forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      setDifficulty(dot.dataset.level);
    });
  });

  // Animals click = start Animals with current difficulty
  $("#catAnimals").addEventListener("click", () => {
    startAnimals();
  });
}

// ---------- Animals Game ----------
const ANIMAL_ASSETS = [
  "Cat.png",
  "Dog.png",
  "Duck.png",
  "Cow.png",
  "Bear.png",
  "Elephant.png",
  "Frog.png",
  "Giraffe.png",
  "Horse.png",
  "Lion.png",
  "Monkey.png",
  "Panda.png",
  "Pig.png",
  "Rabbit.png",
  "Sheep.png",
  "Tiger.png",
  "Zebra.png",
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function difficultyToPairs(level) {
  if (level === "medium") return 6; // 12 cards
  if (level === "hard") return 8;   // 16 cards
  return 3;                         // easy = 6 cards (3 pairs)
}

function startAnimals() {
  const level = localStorage.getItem("mm_difficulty") || "easy";
  const pairs = difficultyToPairs(level);

  // pick N unique animals, duplicate for pairs, shuffle
  const picks = shuffle([...ANIMAL_ASSETS]).slice(0, pairs);
  const deck = shuffle([...picks, ...picks].map((file, idx) => ({
    id: idx,
    file,
    key: file.toLowerCase()
  })));

  renderAnimalsBoard(deck);
}

function renderAnimalsBoard(deck) {
  const app = document.getElementById("app");
  app.className = "game";

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" id="gameGrid" aria-label="Animal cards"></div>
    </div>
    <div class="smashLayer" id="smashLayer"></div>
  `;

  const grid = $("#gameGrid");
  const smashLayer = $("#smashLayer");

  // Build cards (FACE UP)
  grid.innerHTML = deck.map(card => `
    <button class="gameCard" data-key="${card.key}" data-id="${card.id}" aria-label="${card.key}">
      <img src="./Assets/${card.file}" alt="${card.key}">
    </button>
  `).join("");

  let locked = false;
  let first = null;
  let second = null;
  let matches = 0;
  const totalPairs = deck.length / 2;

  function resetSelection() {
    if (first) first.classList.remove("selected");
    if (second) second.classList.remove("selected");
    first = null;
    second = null;
    locked = false;
  }

  function centerPoint() {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  function cloneToLayer(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const clone = cardEl.cloneNode(true);
    clone.classList.add("smashClone");
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.transform = "translate(0,0) scale(1)";
    smashLayer.appendChild(clone);
    return { clone, rect };
  }

  function animateSmash(aEl, bEl) {
    const { x: cx, y: cy } = centerPoint();

    const a = cloneToLayer(aEl);
    const b = cloneToLayer(bEl);

    // Hide originals quickly
    aEl.classList.add("matched");
    bEl.classList.add("matched");

    // Animate both clones to center
    requestAnimationFrame(() => {
      const ax = cx - (a.rect.left + a.rect.width / 2);
      const ay = cy - (a.rect.top + a.rect.height / 2);

      const bx = cx - (b.rect.left + b.rect.width / 2);
      const by = cy - (b.rect.top + b.rect.height / 2);

      a.clone.style.transition = "transform 260ms cubic-bezier(.2,.9,.2,1)";
      b.clone.style.transition = "transform 260ms cubic-bezier(.2,.9,.2,1)";

      a.clone.style.transform = `translate(${ax}px, ${ay}px) scale(1.08)`;
      b.clone.style.transform = `translate(${bx}px, ${by}px) scale(1.08)`;

      setTimeout(() => {
        // little “smash” pop
        a.clone.style.transition = "transform 120ms ease";
        b.clone.style.transition = "transform 120ms ease";
        a.clone.style.transform = `translate(${ax}px, ${ay}px) scale(0.92)`;
        b.clone.style.transform = `translate(${bx}px, ${by}px) scale(0.92)`;

        // Confetti at center
        confetti.burst(cx, cy, 140);

        setTimeout(() => {
          a.clone.remove();
          b.clone.remove();
        }, 220);
      }, 270);
    });
  }

  function showWin() {
    const overlay = document.createElement("div");
    overlay.className = "winOverlay";
    overlay.innerHTML = `<div class="winText">WELL DONE!</div>`;
    document.body.appendChild(overlay);

    confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 220);

    setTimeout(() => {
      overlay.remove();
      renderMenu();
    }, 5000);
  }

  $all(".gameCard", grid).forEach(cardEl => {
    cardEl.addEventListener("click", () => {
      if (locked) return;
      if (cardEl.classList.contains("matched")) return;

      // select logic
      if (!first) {
        first = cardEl;
        first.classList.add("selected");
        return;
      }

      if (cardEl === first) return;

      second = cardEl;
      second.classList.add("selected");

      // evaluate
      locked = true;

      const match = first.dataset.key === second.dataset.key;

      if (match) {
        matches += 1;
        animateSmash(first, second);

        // clear selection state immediately (originals are now hidden)
        first.classList.remove("selected");
        second.classList.remove("selected");
        first = null;
        second = null;
        locked = false;

        if (matches === totalPairs) {
          setTimeout(showWin, 450);
        }
      } else {
        // WRONG: nothing happens (no flip), just unselect after a moment
        setTimeout(resetSelection, 200);
      }
    });
  });
}

// ---------- Splash startup ----------
window.addEventListener("load", () => {
  renderMenu();
  showApp();

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  if (!splash || !video || !img) return;

  img.style.display = "block";
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

    const onPlaying = () => {
      tapText.style.display = "none";
      video.style.display = "block";
      img.style.display = "none";

      const ms = (Number.isFinite(video.duration) && video.duration > 0)
        ? Math.ceil(video.duration * 1000) + 400
        : 4500;

      setTimeout(endSplash, ms);
    };

    const failToMenu = () => endSplash();

    video.addEventListener("playing", onPlaying, { once: true });
    video.addEventListener("ended", endSplash, { once: true });
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
