/* app.js
   - Menu: 6 equal category cards (Animals image + 5 placeholders)
   - Menu starts lower (your CSS .menuWrap padding handles this)
   - Game: Animals Easy = 6 cards (3 pairs), FACE UP always
   - Match: cards “smash” together in centre + confetti
   - Wrong: nothing happens (no flip, no shake)
   - Win: BIG “Well done!” + confetti, then auto return to menu after 5s
   - Difficulty dots still work & are saved (not used yet for Animals)
*/

// ---------- MENU ----------
function renderMenu() {
  const app = document.getElementById("app");
  app.className = "menu";

  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid" aria-label="Categories">
        <!-- Animals category uses your image card -->
        <button class="catCardBtn" id="catAnimals" aria-label="Animals">
          <img class="catImg" src="./Assets/Animals.PNG" alt="Animals">
        </button>

        <!-- 5 placeholders -->
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

  // Click Animals -> start game
  const animalsBtn = document.getElementById("catAnimals");
  animalsBtn.addEventListener("click", () => {
    startAnimalsEasy();
  });

  // Difficulty (kept for later)
  const saved = localStorage.getItem("mm_difficulty") || "easy";
  setDifficulty(saved);

  document.querySelectorAll(".dot").forEach(dot => {
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

// ---------- GAME (Animals Easy: 6 cards / 3 pairs) ----------
function startAnimalsEasy() {
  const app = document.getElementById("app");
  app.className = "game";

  // 3 animals -> duplicated to make 6 cards (3 pairs)
  const picks = [
    { key: "cat",  src: "./Assets/Cat.png"  },
    { key: "dog",  src: "./Assets/Dog.png"  },
    { key: "duck", src: "./Assets/Duck.png" },
  ];

  // duplicate + shuffle
  const deck = shuffle([...picks, ...picks].map((c, i) => ({
    id: `${c.key}_${i}`,
    key: c.key,
    src: c.src
  })));

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" id="gameGrid" aria-label="Match the cards">
        ${deck.map(card => `
          <button class="gameCard" data-key="${card.key}" data-id="${card.id}" aria-label="${card.key}">
            <img src="${card.src}" alt="${card.key}">
          </button>
        `).join("")}
      </div>
    </div>

    <div class="difficulty" id="difficultyBox">
      <div class="difficultyTitle">Difficulty</div>
      <div class="dots">
        <div class="dot g" data-level="easy" title="Beginner"></div>
        <div class="dot y" data-level="medium" title="Intermediate"></div>
        <div class="dot r" data-level="hard" title="Hard"></div>
      </div>
    </div>
  `;

  // Keep difficulty dots visible + stored (still not affecting Animals yet)
  const saved = localStorage.getItem("mm_difficulty") || "easy";
  setDifficulty(saved);
  document.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      setDifficulty(dot.dataset.level);
    });
  });

  const grid = document.getElementById("gameGrid");
  let first = null;
  let second = null;
  let locked = false;
  let matchedPairs = 0;

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
        // MATCH: smash + confetti then hide both
        playSmash(first, second, () => {
          first.classList.remove("selected");
          second.classList.remove("selected");
          first.classList.add("matched");
          second.classList.add("matched");
          matchedPairs += 1;

          first = null;
          second = null;
          locked = false;

          if (matchedPairs === 3) {
            winSequence();
          }
        });
      } else {
        // WRONG: nothing happens (just remove highlight after a moment)
        setTimeout(() => {
          if (first) first.classList.remove("selected");
          if (second) second.classList.remove("selected");
          first = null;
          second = null;
          locked = false;
        }, 350);
      }
    });
  });

  function winSequence() {
    burstConfetti(2200);

    const overlay = document.createElement("div");
    overlay.className = "winOverlay";
    overlay.innerHTML = `<div class="winText">Well done!</div>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      renderMenu();
    }, 5000);
  }
}

// ---------- SMASH ANIMATION ----------
function playSmash(cardA, cardB, onDone) {
  // Create layer
  const layer = document.createElement("div");
  layer.className = "smashLayer";
  document.body.appendChild(layer);

  const rectA = cardA.getBoundingClientRect();
  const rectB = cardB.getBoundingClientRect();

  const cloneA = makeClone(cardA, rectA);
  const cloneB = makeClone(cardB, rectB);
  layer.appendChild(cloneA);
  layer.appendChild(cloneB);

  // Confetti on match
  burstConfetti(900);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  const aCenter = { x: rectA.left + rectA.width / 2, y: rectA.top + rectA.height / 2 };
  const bCenter = { x: rectB.left + rectB.width / 2, y: rectB.top + rectB.height / 2 };

  const aTo = { x: cx - aCenter.x, y: cy - aCenter.y };
  const bTo = { x: cx - bCenter.x, y: cy - bCenter.y };

  // Move in
  cloneA.animate(
    [{ transform: `translate(${aTo.x}px, ${aTo.y}px) scale(1)` }],
    { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
  );
  cloneB.animate(
    [{ transform: `translate(${bTo.x}px, ${bTo.y}px) scale(1)` }],
    { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
  );

  // “Smash” bounce
  setTimeout(() => {
    cloneA.animate(
      [{ transform: `translate(${aTo.x}px, ${aTo.y}px) scale(1.10)` },
       { transform: `translate(${aTo.x}px, ${aTo.y}px) scale(0.95)` },
       { transform: `translate(${aTo.x}px, ${aTo.y}px) scale(1.02)` }],
      { duration: 320, easing: "ease-out", fill: "forwards" }
    );

    cloneB.animate(
      [{ transform: `translate(${bTo.x}px, ${bTo.y}px) scale(1.10)` },
       { transform: `translate(${bTo.x}px, ${bTo.y}px) scale(0.95)` },
       { transform: `translate(${bTo.x}px, ${bTo.y}px) scale(1.02)` }],
      { duration: 320, easing: "ease-out", fill: "forwards" }
    );
  }, 260);

  // Cleanup
  setTimeout(() => {
    layer.remove();
    if (typeof onDone === "function") onDone();
  }, 900);
}

function makeClone(cardBtn, rect) {
  const clone = document.createElement("div");
  clone.className = "smashClone";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";

  const img = cardBtn.querySelector("img");
  const cloneImg = document.createElement("img");
  cloneImg.src = img ? img.src : "";
  cloneImg.alt = "";
  cloneImg.style.width = "100%";
  cloneImg.style.height = "100%";
  cloneImg.style.objectFit = "cover";
  cloneImg.style.display = "block";

  clone.appendChild(cloneImg);
  return clone;
}

// ---------- CONFETTI (Canvas) ----------
let confettiRAF = null;

function burstConfetti(durationMs = 1200) {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;

  function resize() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();

  const pieces = [];
  const count = 140;

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 7,
      vy: 3 + Math.random() * 6,
      r: 3 + Math.random() * 4,
      a: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.35
    });
  }

  const colors = ["#FFD84D", "#35D05A", "#FF4D4D", "#FFFFFF"];
  const start = performance.now();

  if (confettiRAF) cancelAnimationFrame(confettiRAF);

  function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // gravity
      p.a += p.va;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    }

    if (t < durationMs) {
      confettiRAF = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiRAF = null;
    }
  }

  confettiRAF = requestAnimationFrame(frame);

  // keep canvas correct if they rotate / resize
  window.addEventListener("resize", resize, { once: true });
}

// ---------- UTIL ----------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

// ---------- STARTUP (your working splash flow) ----------
window.addEventListener("load", () => {
  // Render menu behind splash so removing splash never shows black
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

    let endedAlready = false;
    const endSplash = () => {
      if (endedAlready) return;
      endedAlready = true;
      hideSplash();
    };

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
