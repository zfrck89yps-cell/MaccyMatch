// app.js
// - Match menu (Menu-background.png) shows Memory-button.PNG bottom-right
// - Memory menu (Memory-menu.png) shows Match-button.PNG bottom-left
// - Match game (Animals): 6 cards face up, smash + confetti on match, win overlay
// - Memory game (Animals): 8 cards face down, flip 2, wrong flips back, win overlay
// - No difficulty settings

// ---------------- MENU: MATCH ----------------
function renderMenu() {
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

    <!-- MEMORY BUTTON (only on Match menu) -->
    <button class="modeBtn" id="toMemory" aria-label="Go to Memory">
      <img src="./Assets/Memory-button.PNG" alt="Maccy Memory">
    </button>
  `;

  document.getElementById("catAnimals")?.addEventListener("click", startAnimalsMatch);
  document.getElementById("toMemory")?.addEventListener("click", renderMemoryMenu);
}

// ---------------- MENU: MEMORY ----------------
function renderMemoryMenu() {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "memoryMenu";

  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid" aria-label="Categories">

        <button class="catCardBtn" id="memAnimals" aria-label="Animals Memory">
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

    <!-- MATCH BUTTON (only on Memory menu) -->
    <button class="modeBtn left" id="toMatch" aria-label="Go to Match">
      <img src="./Assets/Match-button.PNG" alt="Maccy Match">
    </button>
  `;

  document.getElementById("memAnimals")?.addEventListener("click", startAnimalsMemory);
  document.getElementById("toMatch")?.addEventListener("click", renderMenu);
}

// ---------------- MATCH GAME (Animals - face up) ----------------
function startAnimalsMatch() {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "game";

  const picks = [
    { key: "cat",  src: "./Assets/Cat.png"  },
    { key: "dog",  src: "./Assets/Dog.png"  },
    { key: "duck", src: "./Assets/Duck.png" },
  ];

  const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" id="gameGrid" aria-label="Match the cards">
        ${cards.map(c => `
          <button class="gameCard" data-key="${c.key}" data-id="${c.id}" aria-label="${c.key}">
            <img src="${c.src}" alt="${c.key}">
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

      btn.classList.add("selected");

      if (!first) {
        first = btn;
        return;
      }

      second = btn;
      locked = true;

      const k1 = first.dataset.key;
      const k2 = second.dataset.key;

      if (k1 === k2) {
        playSmash(first, second, () => {
          first.classList.remove("selected");
          second.classList.remove("selected");
          first.classList.add("matched");
          second.classList.add("matched");

          matchedCount += 2;
          first = null;
          second = null;
          locked = false;

          if (matchedCount === cards.length) winSequence(renderMenu);
        });
      } else {
        setTimeout(() => {
          first.classList.remove("selected");
          second.classList.remove("selected");
          first = null;
          second = null;
          locked = false;
        }, 350);
      }
    });
  });
}

// ---------------- MEMORY GAME (Animals - 8 cards face down) ----------------
function startAnimalsMemory() {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "game";

  // 4 pairs = 8 cards (use whatever animals you actually have as files)
  const picks = [
    { key: "cat",    src: "./Assets/Cat.png" },
    { key: "dog",    src: "./Assets/Dog.png" },
    { key: "duck",   src: "./Assets/Duck.png" },
    { key: "lion",   src: "./Assets/Lion.png" }, // make sure this exists
  ];

  const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" id="gameGrid" aria-label="Memory cards">
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

  const flip = (btn, on) => btn.classList.toggle("flipped", !!on);

  grid.querySelectorAll(".gameCard").forEach(btn => {
    btn.addEventListener("click", () => {
      if (locked) return;
      if (btn.classList.contains("matched")) return;
      if (btn === first) return;

      flip(btn, true);

      if (!first) {
        first = btn;
        return;
      }

      second = btn;
      locked = true;

      const k1 = first.dataset.key;
      const k2 = second.dataset.key;

      if (k1 === k2) {
        // match: keep them face up
        first.classList.add("matched");
        second.classList.add("matched");

        matchedCount += 2;
        first = null;
        second = null;
        locked = false;

        burstConfetti(700);

        if (matchedCount === cards.length) winSequence(renderMemoryMenu);
      } else {
        // wrong: flip back after a beat
        setTimeout(() => {
          flip(first, false);
          flip(second, false);
          first = null;
          second = null;
          locked = false;
        }, 650);
      }
    });
  });
}

// ---------------- WIN OVERLAY ----------------
function winSequence(onDone) {
  burstConfetti(1800);

  const overlay = document.createElement("div");
  overlay.className = "winOverlay";
  overlay.innerHTML = `<div class="winText">Well done!</div>`;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    onDone && onDone();
  }, 2200);
}

// ---------------- SMASH ANIMATION (Match mode) ----------------
function playSmash(cardA, cardB, onDone) {
  const layer = document.createElement("div");
  layer.className = "smashLayer";
  document.body.appendChild(layer);

  const rA = cardA.getBoundingClientRect();
  const rB = cardB.getBoundingClientRect();

  const cloneA = makeClone(cardA, rA);
  const cloneB = makeClone(cardB, rB);
  layer.appendChild(cloneA);
  layer.appendChild(cloneB);

  burstConfetti(900);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  const toCenterA = { x: cx - (rA.left + rA.width / 2), y: cy - (rA.top + rA.height / 2) };
  const toCenterB = { x: cx - (rB.left + rB.width / 2), y: cy - (rB.top + rB.height / 2) };

  cloneA.animate(
    [
      { transform: `translate(0px,0px) scale(1)` },
      { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)` },
    ],
    { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
  );

  cloneB.animate(
    [
      { transform: `translate(0px,0px) scale(1)` },
      { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)` },
    ],
    { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
  );

  setTimeout(() => {
    cloneA.animate(
      [
        { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)` },
        { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(0.96)` },
        { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.02)` },
      ],
      { duration: 200, easing: "ease-out", fill: "forwards" }
    );

    cloneB.animate(
      [
        { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)` },
        { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(0.96)` },
        { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.02)` },
      ],
      { duration: 200, easing: "ease-out", fill: "forwards" }
    );
  }, 260);

  setTimeout(() => {
    layer.remove();
    onDone && onDone();
  }, 520);
}

function makeClone(cardBtn, rect) {
  const clone = document.createElement("div");
  clone.className = "smashClone";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";

  const img = cardBtn.querySelector("img");
  const imgClone = document.createElement("img");
  imgClone.src = img ? img.src : "";
  imgClone.alt = img ? img.alt : "";
  imgClone.style.width = "100%";
  imgClone.style.height = "100%";
  imgClone.style.objectFit = "cover";
  imgClone.style.display = "block";

  clone.appendChild(imgClone);
  return clone;
}

// ---------------- CONFETTI ----------------
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

// ---------------- UTIL ----------------
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

// ---------------- STARTUP / SPLASH ----------------
window.addEventListener("load", () => {
  renderMenu();
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

// Expose (optional)
window.renderMenu = renderMenu;
window.renderMemoryMenu = renderMemoryMenu;
