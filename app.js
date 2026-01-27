// app.js (Match + Memory)
// - Splash tap-to-start retained
// - Match menu background + Memory menu background
// - Mode buttons: Match menu shows Memory button (bottom-right)
//                Memory menu shows Match button (bottom-left)
// - Categories are the same on both menus
// - Match Animals: face-up match + smash + confetti
// - Memory Animals: 8 face-down cards, memory flip match

(function () {
  const app = document.getElementById("app")// app.js
// - Splash: tap to play video, then enter menu
// - Match Menu (Menu-background.png): categories + Memory button (bottom-right)
// - Memory Menu (Memory-menu.png): categories + Match button (bottom-left)
// - Match Game: 6 cards face-up (3 pairs) + smash/confetti
// - Memory Game: 8 cards face-down (4 pairs) flip/match
// - Back button on game returns to previous menu

let lastMenu = "menu"; // "menu" or "memoryMenu"

function categoriesHTML() {
  return `
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
  `;
}

/* ---------------- MENUS ---------------- */

function renderMatchMenu() {
  const app = document.getElementById("app");
  if (!app) return;

  lastMenu = "menu";
  app.className = "menu";

  app.innerHTML = `
    ${categoriesHTML()}

    <!-- Memory button (bottom-right) -->
    <button class="cornerBtn memoryBtn" id="goMemory" aria-label="Go to Maccy Memory">
      <img src="./Assets/Memory-button.PNG" alt="Maccy Memory">
    </button>
  `;

  const animalsBtn = document.getElementById("catAnimals");
  if (animalsBtn) animalsBtn.addEventListener("click", startMatchAnimals);

  const goMemory = document.getElementById("goMemory");
  if (goMemory) goMemory.addEventListener("click", renderMemoryMenu);
}

function renderMemoryMenu() {
  const app = document.getElementById("app");
  if (!app) return;

  lastMenu = "memoryMenu";
  app.className = "memoryMenu";

  app.innerHTML = `
    ${categoriesHTML()}

    <!-- Match button (bottom-left) -->
    <button class="cornerBtn matchBtn" id="goMatch" aria-label="Go to Maccy Match">
      <img src="./Assets/Match-button.PNG" alt="Maccy Match">
    </button>
  `;

  const animalsBtn = document.getElementById("catAnimals");
  if (animalsBtn) animalsBtn.addEventListener("click", startMemoryAnimals);

  const goMatch = document.getElementById("goMatch");
  if (goMatch) goMatch.addEventListener("click", renderMatchMenu);
}

/* ---------------- GAMES ---------------- */

function backToLastMenu() {
  if (lastMenu === "memoryMenu") renderMemoryMenu();
  else renderMatchMenu();
}

/* ----- MATCH GAME (face-up 6 cards) ----- */
function startMatchAnimals() {
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
    <button class="backBtn" id="backBtn" aria-label="Back">← Back</button>

    <div class="gameWrap">
      <div class="gameGrid matchGrid" id="gameGrid" aria-label="Match the cards">
        ${cards.map(c => `
          <button class="gameCard" data-key="${c.key}" data-id="${c.id}" aria-label="${c.key}">
            <img src="${c.src}" alt="${c.key}">
          </button>
        `).join("")}
      </div>
    </div>
  `;

  document.getElementById("backBtn")?.addEventListener("click", backToLastMenu);

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

      if (!first) { first = btn; return; }

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

          if (matchedCount === 6) winSequence();
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

  function winSequence() {
    burstConfetti(1800);
    const overlay = document.createElement("div");
    overlay.className = "winOverlay";
    overlay.innerHTML = `<div class="winText">Well done!</div>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      backToLastMenu();
    }, 2500);
  }
}

/* ----- MEMORY GAME (face-down 8 cards) ----- */
function startMemoryAnimals() {
  const app = document.getElementById("app");
  if (!app) return;

  app.className = "game";

  // 4 pairs = 8 cards
  const picks = [
    { key: "cat",  src: "./Assets/Cat.png"  },
    { key: "dog",  src: "./Assets/Dog.png"  },
    { key: "duck", src: "./Assets/Duck.png" },
    { key: "pig",  src: "./Assets/Pig.png"  },
  ];

  const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

  app.innerHTML = `
    <button class="backBtn" id="backBtn" aria-label="Back">← Back</button>

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

  document.getElementById("backBtn")?.addEventListener("click", backToLastMenu);

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
      if (card.classList.contains("flipped")) return;

      card.classList.add("flipped");

      if (!first) { first = card; return; }

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

        if (matchedCount === 8) winSequence();
      } else {
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
      backToLastMenu();
    }, 2500);
  }
}

/* ---------------- SMASH + CONFETTI ---------------- */

function playSmash(cardA, cardB, onDone) {
  const layer = document.createElement("div");
  layer.className = "smashLayer";
  layer.style.position = "fixed";
  layer.style.inset = "0";
  layer.style.zIndex = "9998";
  layer.style.pointerEvents = "none";
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
    if (onDone) onDone();
  }, 520);
}

function makeClone(cardBtn, rect) {
  const clone = document.createElement("div");
  clone.style.position = "absolute";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.style.borderRadius = "22px";
  clone.style.overflow = "hidden";
  clone.style.boxShadow = "0 18px 40px rgba(0,0,0,0.35)";

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

/* ---------------- UTIL + STARTUP ---------------- */

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
});;

  // ---------- MENU HTML ----------
  function menuHTML(mode) {
    // mode: "match" or "memory"
    const modeBtn =
      mode === "match"
        ? `<button class="modeBtn right" id="toMemory" aria-label="Maccy Memory">
             <img src="./Assets/Memory-button.PNG" alt="Maccy Memory">
           </button>`
        : `<button class="modeBtn left" id="toMatch" aria-label="Maccy Match">
             <img src="./Assets/Match-button.PNG" alt="Maccy Match">
           </button>`;

    return `
      <div class="menuWrap">
        <div class="menuGrid" aria-label="Categories">

          <button class="catCardBtn" id="${mode}Animals" aria-label="Animals">
            <img class="catImg" src="./Assets/Animals.PNG" alt="Animals">
          </button>

          <button class="catCardBtn placeholder" disabled>Vehicles</button>
          <button class="catCardBtn placeholder" disabled>Food</button>
          <button class="catCardBtn placeholder" disabled>Numbers</button>
          <button class="catCardBtn placeholder" disabled>Colours</button>
          <button class="catCardBtn placeholder" disabled>Shapes</button>

        </div>
      </div>

      ${modeBtn}
    `;
  }

  // ---------- MATCH MENU ----------
  function renderMatchMenu() {
    if (!app) return;
    app.className = "";
    app.classList.add("matchMenu");
    app.innerHTML = menuHTML("match");

    const animals = document.getElementById("matchAnimals");
    if (animals) animals.onclick = startMatchAnimals;

    const toMemory = document.getElementById("toMemory");
    if (toMemory) toMemory.onclick = renderMemoryMenu;
  }

  // ---------- MEMORY MENU ----------
  function renderMemoryMenu() {
    if (!app) return;
    app.className = "";
    app.classList.add("memoryMenu");
    app.innerHTML = menuHTML("memory");

    const animals = document.getElementById("memoryAnimals");
    if (animals) animals.onclick = startMemoryAnimals;

    const toMatch = document.getElementById("toMatch");
    if (toMatch) toMatch.onclick = renderMatchMenu;
  }

  // ---------- MATCH GAME (FACE UP) ----------
  function startMatchAnimals() {
    if (!app) return;
    app.className = "";
    app.classList.add("game");

    // 8 cards total = 4 pairs
    const picks = [
      { key: "cat", src: "./Assets/Cat.png" },
      { key: "dog", src: "./Assets/Dog.png" },
      { key: "duck", src: "./Assets/Duck.png" },
      { key: "lion", src: "./Assets/Lion.png" },
    ];

    const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

    app.innerHTML = `
      <div class="gameWrap">
        <div class="gameGrid" id="gameGrid" aria-label="Match">
          ${cards.map(c => `
            <button class="gameCard" data-key="${c.key}" data-id="${c.id}">
              <img src="${c.src}" alt="${c.key}">
            </button>
          `).join("")}
        </div>
      </div>
      <button class="modeBtn left" id="backToMatchMenu" aria-label="Back">
        <img src="./Assets/Match-button.PNG" alt="Back">
      </button>
    `;

    document.getElementById("backToMatchMenu").onclick = renderMatchMenu;

    const grid = document.getElementById("gameGrid");
    let first = null;
    let second = null;
    let locked = false;
    let matched = 0;

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

        if (first.dataset.key === second.dataset.key) {
          playSmash(first, second, () => {
            first.classList.remove("selected");
            second.classList.remove("selected");
            first.classList.add("matched");
            second.classList.add("matched");

            matched += 2;
            first = null; second = null;
            locked = false;

            if (matched === cards.length) winSequence(renderMatchMenu);
          });
        } else {
          setTimeout(() => {
            first.classList.remove("selected");
            second.classList.remove("selected");
            first = null; second = null;
            locked = false;
          }, 350);
        }
      });
    });
  }

  // ---------- MEMORY GAME (FACE DOWN) ----------
  function startMemoryAnimals() {
    if (!app) return;
    app.className = "";
    app.classList.add("game");

    // 8 cards total = 4 pairs (swap in your own animal files)
    const picks = [
      { key: "cat", src: "./Assets/Cat.png" },
      { key: "dog", src: "./Assets/Dog.png" },
      { key: "duck", src: "./Assets/Duck.png" },
      { key: "zebra", src: "./Assets/Zebra.png" },
    ];

    const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

    app.innerHTML = `
      <div class="gameWrap">
        <div class="gameGrid" id="memGrid" aria-label="Memory">
          ${cards.map(c => `
            <button class="gameCard" data-key="${c.key}" data-id="${c.id}">
              <img class="frontImg" src="${c.src}" alt="${c.key}">
              <div class="cardBack" aria-hidden="true"></div>
            </button>
          `).join("")}
        </div>
      </div>

      <button class="modeBtn right" id="backToMemoryMenu" aria-label="Back">
        <img src="./Assets/Memory-button.PNG" alt="Back">
      </button>
    `;

    document.getElementById("backToMemoryMenu").onclick = renderMemoryMenu;

    const grid = document.getElementById("memGrid");
    let first = null;
    let second = null;
    let locked = false;
    let matched = 0;

    grid.querySelectorAll(".gameCard").forEach(card => {
      card.addEventListener("click", () => {
        if (locked) return;
        if (card.classList.contains("matched")) return;
        if (card.classList.contains("flipped")) return;

        card.classList.add("flipped");

        if (!first) {
          first = card;
          return;
        }

        second = card;
        locked = true;

        if (first.dataset.key === second.dataset.key) {
          // match
          setTimeout(() => {
            first.classList.add("matched");
            second.classList.add("matched");
            matched += 2;
            first = null; second = null;
            locked = false;

            if (matched === cards.length) winSequence(renderMemoryMenu);
          }, 250);
        } else {
          // not match - flip back
          setTimeout(() => {
            first.classList.remove("flipped");
            second.classList.remove("flipped");
            first = null; second = null;
            locked = false;
          }, 650);
        }
      });
    });
  }

  // ---------- WIN ----------
  function winSequence(backFn) {
    burstConfetti(1800);

    const overlay = document.createElement("div");
    overlay.className = "winOverlay";
    overlay.innerHTML = `<div class="winText">Well done!</div>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      backFn();
    }, 2500);
  }

  // ---------- SMASH ----------
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
      [{ transform: `translate(0,0) scale(1)` },
       { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)` }],
      { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    );

    cloneB.animate(
      [{ transform: `translate(0,0) scale(1)` },
       { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)` }],
      { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    );

    setTimeout(() => {
      cloneA.animate(
        [{ transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)` },
         { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(0.96)` },
         { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.02)` }],
        { duration: 200, easing: "ease-out", fill: "forwards" }
      );
      cloneB.animate(
        [{ transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)` },
         { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(0.96)` },
         { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.02)` }],
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
    imgClone.style.width = "100%";
    imgClone.style.height = "100%";
    imgClone.style.objectFit = "cover";
    imgClone.style.display = "block";

    clone.appendChild(imgClone);
    return clone;
  }

  // ---------- CONFETTI ----------
  let confettiRAF = null;

  function burstConfetti(durationMs = 800) {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
        c: colors[(Math.random() * colors.length) | 0],
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

  // ---------- UTIL ----------
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function showApp() {
    if (app) app.style.display = "block";
  }

  function hideSplash() {
    const splash = document.getElementById("splash");
    if (!splash) return;
    splash.classList.add("hidden");
    setTimeout(() => splash.remove(), 400);
  }

  // ---------- STARTUP (Tap to Start flow) ----------
  window.addEventListener("load", () => {
    showApp();
    renderMatchMenu();

    const splash = document.getElementById("splash");
    const tapText = document.getElementById("tapText");
    const img = document.getElementById("splashImg");
    const video = document.getElementById("splashVideo");

    if (!splash || !video || !img || !tapText) return;

    img.style.display = "block";
    video.style.display = "none";
    tapText.style.display = "block";

    let started = false;

    const start = async () => {
      if (started) return;
      started = true;

      tapText.textContent = "Loading…";
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
      video.addEventListener("error", endSplash, { once: true });

      try {
        await video.play();
      } catch (e) {
        try {
          video.muted = true;
          await video.play();
        } catch (e2) {
          endSplash();
        }
      }
    };

    splash.addEventListener("pointerup", start);
    splash.addEventListener("touchend", start);
  });

  // expose if needed
  window.renderMatchMenu = renderMatchMenu;
  window.renderMemoryMenu = renderMemoryMenu;
})();
