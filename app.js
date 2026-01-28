// app.js (Match + Memory)
// - Splash tap-to-start (iPad-safe listeners)
// - Match Menu uses Menu-background.png with Memory button (Memory-button.PNG)
// - Memory Menu uses Memory-menu.png with Match button (Match-button.PNG)
// - Both modes: 8 cards (4 pairs), random selection each round from available assets
// - Memory mode uses Cardback_.PNG
// - Win: play Welldone .MP4 full-screen, then return after 6s
// - Match animation: fly together -> confetti/stars -> show word longer -> disappear
// - Back button on game screens returns to previous menu

(() => {
  const ASSET = (p) => `./Assets/${p}`;

  // ✅ Your actual filenames (case + spaces matter)
  const FILES = {
    menuBg: ASSET("Menu-background.png"),
    memoryMenuBg: ASSET("Memory-menu.png"),
    gameBg: ASSET("Game-background.png"),
    memoryBtn: ASSET("Memory-button.PNG"),
    matchBtn: ASSET("Match-button.PNG"),
    cardBack: ASSET("Cardback_.PNG"),
    wellDoneMp4: "./Assets/Welldone%20.MP4", // file name has a space before .MP4
  };

  // ✅ Animals pool (add more later)
  const ANIMALS_POOL = [
    { key: "bear", src: ASSET("Bear.png") },
    { key: "cat", src: ASSET("Cat.png") },
    { key: "cow", src: ASSET("Cow.png") },
    { key: "dog", src: ASSET("Dog.png") },
    { key: "duck", src: ASSET("Duck.png") },
    { key: "elephant", src: ASSET("Elephant.png") },
    { key: "frog", src: ASSET("Frog.png") },
    { key: "giraffe", src: ASSET("Giraffe.png") },
    { key: "horse", src: ASSET("Horse.png") },
    { key: "lion", src: ASSET("Lion.png") },
    { key: "monkey", src: ASSET("Monkey.png") },
    { key: "panda", src: ASSET("Panda.png") },
    { key: "pig", src: ASSET("Pig.png") },
    { key: "rabbit", src: ASSET("Rabbit.png") },
    { key: "sheep", src: ASSET("Sheep.png") },
    { key: "tiger", src: ASSET("Tiger.png") },
    { key: "zebra", src: ASSET("Zebra.png") },
  ];

  const state = {
    currentMenu: "match", // "match" | "memory"
    currentCategory: "animals",
    lastUserGestureTs: 0,
  };

  // ---------- MENU RENDERERS ----------
  function renderMatchMenu() {
    const app = document.getElementById("app");
    if (!app) return;
    state.currentMenu = "match";
    app.className = "menu";

    app.innerHTML = `
      <div class="menuWrap">
        <div class="menuGrid" aria-label="Categories">
          <button class="catCardBtn" id="catAnimals" aria-label="Animals">
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

      <button class="modeBtn" id="toMemory" aria-label="Go to Maccy Memory">
        <img src="${FILES.memoryBtn}" alt="Maccy Memory">
      </button>
    `;

    document.getElementById("catAnimals")?.addEventListener("click", (e) => {
      markGesture(e);
      startMatchGame("animals");
    });

    document.getElementById("toMemory")?.addEventListener("click", (e) => {
      markGesture(e);
      renderMemoryMenu();
    });
  }

  function renderMemoryMenu() {
    const app = document.getElementById("app");
    if (!app) return;
    state.currentMenu = "memory";
    app.className = "memoryMenu";

    app.innerHTML = `
      <div class="menuWrap">
        <div class="menuGrid" aria-label="Categories">
          <button class="catCardBtn" id="catAnimals" aria-label="Animals">
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

      <button class="modeBtn" id="toMatch" aria-label="Go to Maccy Match">
        <img src="${FILES.matchBtn}" alt="Maccy Match">
      </button>
    `;

    document.getElementById("catAnimals")?.addEventListener("click", (e) => {
      markGesture(e);
      startMemoryGame("animals");
    });

    document.getElementById("toMatch")?.addEventListener("click", (e) => {
      markGesture(e);
      renderMatchMenu();
    });
  }

  // ---------- GAME BUILDERS ----------
  function startMatchGame(category) {
    const app = document.getElementById("app");
    if (!app) return;
    app.className = "game";
    state.currentCategory = category;

    const picks = pickRandomPairs(category, 4); // 4 unique => 8 cards
    const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

    app.innerHTML = `
      <button class="backBtn" id="backBtn" aria-label="Back">‹ Back</button>

      <div class="gameWrap">
        <div class="gameGrid" id="gameGrid" aria-label="Match the cards">
          ${cards.map(c => `
            <button class="gameCard" data-key="${c.key}" data-word="${labelWord(c.key)}" data-id="${c.id}" aria-label="${c.key}">
              <img src="${c.src}" alt="${c.key}">
            </button>
          `).join("")}
        </div>
      </div>
    `;

    document.getElementById("backBtn")?.addEventListener("click", (e) => {
      markGesture(e);
      goBackToMenu();
    });

    attachMatchLogic(cards.length);
  }

  function startMemoryGame(category) {
    const app = document.getElementById("app");
    if (!app) return;
    app.className = "game";
    state.currentCategory = category;

    const picks = pickRandomPairs(category, 4);
    const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

    app.innerHTML = `
      <button class="backBtn" id="backBtn" aria-label="Back">‹ Back</button>

      <div class="gameWrap">
        <div class="gameGrid" id="gameGrid" aria-label="Memory cards">
          ${cards.map(c => `
            <button class="gameCard" data-key="${c.key}" data-word="${labelWord(c.key)}" data-id="${c.id}" aria-label="${c.key}">
              <img class="back" src="${FILES.cardBack}" alt="Card back">
              <img class="front" src="${c.src}" alt="${c.key}">
            </button>
          `).join("")}
        </div>
      </div>
    `;

    document.getElementById("backBtn")?.addEventListener("click", (e) => {
      markGesture(e);
      goBackToMenu();
    });

    attachMemoryLogic(cards.length);
  }

  function goBackToMenu() {
    if (state.currentMenu === "memory") renderMemoryMenu();
    else renderMatchMenu();
  }

  // ---------- MATCH MODE LOGIC (FACE UP) ----------
  function attachMatchLogic(totalCards) {
    const grid = document.getElementById("gameGrid");
    if (!grid) return;

    let first = null;
    let second = null;
    let locked = false;
    let matchedCount = 0;

    grid.querySelectorAll(".gameCard").forEach(btn => {
      btn.addEventListener("click", (e) => {
        markGesture(e);
        if (locked) return;
        if (btn.classList.contains("matched")) return;
        if (btn === first) return;

        btn.style.outline = "6px solid rgba(255,255,255,0.85)";

        if (!first) { first = btn; return; }

        second = btn;
        locked = true;

        const k1 = first.dataset.key;
        const k2 = second.dataset.key;

        if (k1 === k2) {
          const word = first.dataset.word || k1;
          playMatchAnimation(first, second, word, () => {
            first.classList.add("matched");
            second.classList.add("matched");
            first.style.outline = "none";
            second.style.outline = "none";

            matchedCount += 2;
            first = null; second = null; locked = false;

            if (matchedCount === totalCards) {
              winSequence();
            }
          });
        } else {
          setTimeout(() => {
            first.style.outline = "none";
            second.style.outline = "none";
            first = null; second = null; locked = false;
          }, 450);
        }
      });
    });

    function winSequence() {
      playWellDoneVideo(() => {
        goBackToMenu();
      });
    }
  }

  // ---------- MEMORY MODE LOGIC (FACE DOWN) ----------
  function attachMemoryLogic(totalCards) {
    const grid = document.getElementById("gameGrid");
    if (!grid) return;

    let first = null;
    let second = null;
    let locked = false;
    let matchedCount = 0;

    // All start face-down (no .flipped)
    grid.querySelectorAll(".gameCard").forEach(btn => {
      btn.classList.remove("flipped", "matched");

      btn.addEventListener("click", (e) => {
        markGesture(e);
        if (locked) return;
        if (btn.classList.contains("matched")) return;
        if (btn === first) return;

        btn.classList.add("flipped");

        if (!first) { first = btn; return; }

        second = btn;
        locked = true;

        const k1 = first.dataset.key;
        const k2 = second.dataset.key;

        if (k1 === k2) {
          const word = first.dataset.word || k1;
          playMatchAnimation(first, second, word, () => {
            first.classList.add("matched");
            second.classList.add("matched");
            matchedCount += 2;

            first = null; second = null; locked = false;

            if (matchedCount === totalCards) {
              winSequence();
            }
          });
        } else {
          setTimeout(() => {
            first.classList.remove("flipped");
            second.classList.remove("flipped");
            first = null; second = null; locked = false;
          }, 750);
        }
      });
    });

    function winSequence() {
      playWellDoneVideo(() => {
        goBackToMenu();
      });
    }
  }

  // ---------- MATCH ANIMATION ----------
  // Fly together -> confetti + stars -> show word longer -> then callback (cards disappear via .matched)
  function playMatchAnimation(cardA, cardB, word, onDone) {
    const rA = cardA.getBoundingClientRect();
    const rB = cardB.getBoundingClientRect();

    // Word overlay (keep longer)
    const wordHoldMs = 1800; // ✅ longer on screen
    const wordOverlay = document.createElement("div");
    wordOverlay.className = "wordOverlay";
    wordOverlay.innerHTML = `<div class="word">${escapeHtml(word)}</div>`;
    document.body.appendChild(wordOverlay);

    // Clone layer
    const layer = document.createElement("div");
    layer.style.position = "fixed";
    layer.style.inset = "0";
    layer.style.zIndex = "9994";
    layer.style.pointerEvents = "none";
    document.body.appendChild(layer);

    const cloneA = makeCloneFromCard(cardA, rA);
    const cloneB = makeCloneFromCard(cardB, rB);
    layer.appendChild(cloneA);
    layer.appendChild(cloneB);

    // Confetti + stars burst near center
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const toCenterA = {
      x: cx - (rA.left + rA.width / 2),
      y: cy - (rA.top + rA.height / 2),
    };
    const toCenterB = {
      x: cx - (rB.left + rB.width / 2),
      y: cy - (rB.top + rB.height / 2),
    };

    cloneA.animate(
      [
        { transform: "translate(0px,0px) scale(1)" },
        { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)` },
      ],
      { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    );

    cloneB.animate(
      [
        { transform: "translate(0px,0px) scale(1)" },
        { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)` },
      ],
      { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    );

    setTimeout(() => {
      // burst effect right as they meet
      burstConfettiAndStars(1100);

      cloneA.animate(
        [
          { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)` },
          { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(0.92)` },
          { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.02)` },
        ],
        { duration: 220, easing: "ease-out", fill: "forwards" }
      );

      cloneB.animate(
        [
          { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)` },
          { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(0.92)` },
          { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.02)` },
        ],
        { duration: 220, easing: "ease-out", fill: "forwards" }
      );

      // fade clones out
      cloneA.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" });
      cloneB.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" });
    }, 260);

    setTimeout(() => {
      layer.remove();
      // keep word longer, then remove
      setTimeout(() => {
        wordOverlay.remove();
        onDone && onDone();
      }, Math.max(0, wordHoldMs - 520));
    }, 520);
  }

  function makeCloneFromCard(cardBtn, rect) {
    const clone = document.createElement("div");
    clone.style.position = "absolute";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.borderRadius = "22px";
    clone.style.overflow = "hidden";
    clone.style.boxShadow = "0 18px 40px rgba(0,0,0,0.35)";
    clone.style.willChange = "transform,opacity";

    // If memory card and flipped/unflipped, pick visible face
    let img = null;
    const front = cardBtn.querySelector("img.front");
    const back = cardBtn.querySelector("img.back");
    if (front && back) {
      img = cardBtn.classList.contains("flipped") ? front : back;
    } else {
      img = cardBtn.querySelector("img");
    }

    const imgClone = document.createElement("img");
    imgClone.src = img?.src || "";
    imgClone.alt = img?.alt || "";
    imgClone.style.width = "100%";
    imgClone.style.height = "100%";
    imgClone.style.objectFit = "cover";
    imgClone.style.display = "block";

    clone.appendChild(imgClone);
    return clone;
  }

  // ---------- CONFETTI + STARS ----------
  let confettiRAF = null;

  function burstConfettiAndStars(durationMs = 900) {
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
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const confettiColors = ["#FFD84D", "#35D05A", "#4DA3FF", "#FF4D4D", "#FF7AD9", "#FFFFFF"];

    // confetti rectangles
    for (let i = 0; i < 110; i++) {
      pieces.push({
        type: "rect",
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.9) * 10,
        r: 3 + Math.random() * 6,
        a: Math.random() * Math.PI * 2,
        va: (Math.random() - 0.5) * 0.35,
        c: confettiColors[(Math.random() * confettiColors.length) | 0],
      });
    }

    // stars
    for (let i = 0; i < 28; i++) {
      pieces.push({
        type: "star",
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.9) * 8,
        s: 6 + Math.random() * 10,
        a: Math.random() * Math.PI * 2,
        va: (Math.random() - 0.5) * 0.25,
        c: "#FFFFFF",
      });
    }

    function drawStar(x, y, r, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = r;
      const innerRadius = r * 0.45;
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 === 0 ? outerRadius : innerRadius;
        const ang = (Math.PI / spikes) * i;
        ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function frame(t) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.a += p.va;

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - elapsed / durationMs);

        if (p.type === "rect") {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.a);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        } else {
          ctx.fillStyle = p.c;
          drawStar(p.x, p.y, p.s, p.a);
        }

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

  // ---------- WELLDONE VIDEO ----------
  function playWellDoneVideo(onFinished) {
    // Remove any existing overlay
    document.querySelector(".wellDoneOverlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "wellDoneOverlay";

    const vid = document.createElement("video");
    vid.src = `${FILES.wellDoneMp4}?v=${Date.now()}`;
    vid.playsInline = true;
    vid.setAttribute("playsinline", "");
    vid.setAttribute("webkit-playsinline", "");
    vid.preload = "auto";
    vid.autoplay = true;
    vid.controls = false;

    // Try for sound (iOS only allows if user gesture happened recently)
    vid.muted = false;
    vid.volume = 1.0;

    overlay.appendChild(vid);
    document.body.appendChild(overlay);

    const end = () => {
      overlay.remove();
      onFinished && onFinished();
    };

    // Ensure return after 6s regardless
    const t = setTimeout(end, 6000);

    // Try play (if blocked, fallback to muted play)
    vid.play().catch(() => {
      vid.muted = true;
      vid.play().catch(() => { /* if even muted fails, just show overlay for 6s */ });
    });

    vid.addEventListener("ended", () => {
      clearTimeout(t);
      end();
    }, { once: true });
  }

  // ---------- RANDOM CARD PICKING ----------
  function pickRandomPairs(category, pairCount) {
    let pool = [];
    if (category === "animals") pool = ANIMALS_POOL.slice();
    else pool = ANIMALS_POOL.slice(); // fallback

    // pick unique
    shuffle(pool);
    return pool.slice(0, pairCount);
  }

  function labelWord(key) {
    // Title-case the key for display
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  // ---------- UTIL ----------
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
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

  function markGesture(e) {
    // record a user gesture time; helps sound attempts
    state.lastUserGestureTs = Date.now();
  }

  // ---------- STARTUP / SPLASH ----------
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

    const start = async (e) => {
      markGesture(e);
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

      const onPlaying = () => {
        tapText.style.display = "none";
        video.style.display = "block";
        img.style.display = "none";

        const ms = (Number.isFinite(video.duration) && video.duration > 0)
          ? Math.ceil(video.duration * 1000) + 300
          : 4500;

        setTimeout(endSplash, ms);
      };

      video.addEventListener("playing", onPlaying, { once: true });
      video.addEventListener("error", endSplash, { once: true });

      try {
        await video.play();
      } catch {
        // iOS sometimes blocks sound until user gesture; fallback muted
        try {
          video.muted = true;
          await video.play();
        } catch {
          endSplash();
        }
      }
    };

    // ✅ iPad reliable
    splash.addEventListener("click", start, { passive: true });
    splash.addEventListener("pointerdown", start, { passive: true });
  });

  // expose for debugging
  window.renderMatchMenu = renderMatchMenu;
  window.renderMemoryMenu = renderMemoryMenu;
  window.startMatchGame = startMatchGame;
  window.startMemoryGame = startMemoryGame;
})();
