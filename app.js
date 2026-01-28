/* app.js
   - Match Menu + Memory Menu (toggle buttons)
   - 8 cards (4 pairs) every round
   - Random 4-pair selection each round from ALL animals
   - Memory uses Cardback_.PNG (face down)
   - Win: plays Welldone .MP4 for ~6s then returns
   - Match animation: fly together + confetti + stars + word flash
   - Back button on game screens -> previous menu
*/

(() => {
  const ASSETS = {
    // NOTE: filenames MUST match your GitHub exactly (including spaces/case)
    backgrounds: {
      matchMenu: "./Assets/Menu-background.png",
      memoryMenu: "./Assets/Memory-menu.png",
      game: "./Assets/Game-background.png",
    },
    buttons: {
      memory: "./Assets/Memory-button.PNG",
      match: "./Assets/Match-button.PNG",
    },
    splash: {
      img: "./Assets/Splash.PNG?v=99",
      video: "./Assets/Splash.mp4?v=99",
    },
 cardback: "./Assets/Cardback .PNG",
welldoneVideo: "./Assets/Welldone .MP4",
    categoryThumbs: {
      animals: "./Assets/Animals.PNG",
    },
    // All animals available (used for random selection)
    animals: [
      { key: "bear", src: "./Assets/Bear.png" },
      { key: "cat", src: "./Assets/Cat.png" },
      { key: "cow", src: "./Assets/Cow.png" },
      { key: "dog", src: "./Assets/Dog.png" },
      { key: "duck", src: "./Assets/Duck.png" },
      { key: "elephant", src: "./Assets/Elephant.png" },
      { key: "frog", src: "./Assets/Frog.png" },
      { key: "giraffe", src: "./Assets/Giraffe.png" },
      { key: "horse", src: "./Assets/Horse.png" },
      { key: "lion", src: "./Assets/Lion.png" },
      { key: "monkey", src: "./Assets/Monkey.png" },
      { key: "panda", src: "./Assets/Panda.png" },
      { key: "pig", src: "./Assets/Pig.png" },
      { key: "rabbit", src: "./Assets/Rabbit.png" },
      { key: "sheep", src: "./Assets/Sheep.png" },
      { key: "tiger", src: "./Assets/Tiger.png" },
      { key: "zebra", src: "./Assets/Zebra.png" },
    ],
  };

  const app = () => document.getElementById("app");
  const canvas = () => document.getElementById("confettiCanvas");

  let lastMenu = "matchMenu"; // so back button knows where to go

  // ---------------- MENUS ----------------
  function renderMatchMenu() {
    lastMenu = "matchMenu";
    const el = app();
    if (!el) return;
    el.className = "matchMenu";

    el.innerHTML = `
      <div class="menuWrap">
        <div class="menuGrid" aria-label="Categories">

          <button class="catCardBtn" id="catAnimals" aria-label="Animals">
            <img class="catImg" src="${ASSETS.categoryThumbs.animals}" alt="Animals">
          </button>

          <button class="catCardBtn placeholder" disabled>Vehicles</button>
          <button class="catCardBtn placeholder" disabled>Food</button>
          <button class="catCardBtn placeholder" disabled>Numbers</button>
          <button class="catCardBtn placeholder" disabled>Colours</button>
          <button class="catCardBtn placeholder" disabled>Shapes</button>

        </div>
      </div>

      <div class="scrollHint">‹ ›</div>

      <button class="toggleBtn memoryBtn" id="toMemory" aria-label="Go to Memory">
        <img src="${ASSETS.buttons.memory}" alt="Maccy Memory">
      </button>
    `;

    document.getElementById("catAnimals")?.addEventListener("click", () => {
      startGame({ mode: "match", category: "animals" });
    });

    document.getElementById("toMemory")?.addEventListener("click", renderMemoryMenu);
  }

  function renderMemoryMenu() {
    lastMenu = "memoryMenu";
    const el = app();
    if (!el) return;
    el.className = "memoryMenu";

    el.innerHTML = `
      <div class="menuWrap">
        <div class="menuGrid" aria-label="Categories">

          <button class="catCardBtn" id="catAnimals" aria-label="Animals">
            <img class="catImg" src="${ASSETS.categoryThumbs.animals}" alt="Animals">
          </button>

          <button class="catCardBtn placeholder" disabled>Vehicles</button>
          <button class="catCardBtn placeholder" disabled>Food</button>
          <button class="catCardBtn placeholder" disabled>Numbers</button>
          <button class="catCardBtn placeholder" disabled>Colours</button>
          <button class="catCardBtn placeholder" disabled>Shapes</button>

        </div>
      </div>

      <div class="scrollHint">‹ ›</div>

      <button class="toggleBtn matchBtn" id="toMatch" aria-label="Go to Match">
        <img src="${ASSETS.buttons.match}" alt="Maccy Match">
      </button>
    `;

    document.getElementById("catAnimals")?.addEventListener("click", () => {
      startGame({ mode: "memory", category: "animals" });
    });

    document.getElementById("toMatch")?.addEventListener("click", renderMatchMenu);
  }

  function renderBackButton() {
    // remove existing back if any
    document.querySelector(".backBtn")?.remove();

    const btn = document.createElement("button");
    btn.className = "backBtn";
    btn.textContent = "← Back";
    btn.addEventListener("click", () => {
      if (lastMenu === "memoryMenu") renderMemoryMenu();
      else renderMatchMenu();
    });
    document.body.appendChild(btn);
  }

  function removeBackButton() {
    document.querySelector(".backBtn")?.remove();
  }

  // ---------------- GAME ----------------
  function startGame({ mode, category }) {
    const el = app();
    if (!el) return;
    el.className = "game";
    el.innerHTML = "";

    renderBackButton();

    const pool = getPool(category);
    const picks = sampleUnique(pool, 4); // 4 pairs = 8 cards
    const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

    const htmlCards = cards.map(c => {
      if (mode === "memory") {
        return `
          <button class="gameCard" data-key="${c.key}" data-word="${c.key}" data-id="${c.id}" aria-label="${c.key}">
            <div class="back">
              <img src="${ASSETS.cardback}" alt="Card back">
            </div>
            <div class="front">
              <img src="${c.src}" alt="${c.key}">
            </div>
          </button>
        `;
      }

      // match mode (face up)
      return `
        <button class="gameCard" data-key="${c.key}" data-word="${c.key}" data-id="${c.id}" aria-label="${c.key}">
          <img src="${c.src}" alt="${c.key}">
        </button>
      `;
    }).join("");

    el.innerHTML = `
      <div class="gameWrap">
        <div class="gameGrid" id="gameGrid" aria-label="Game">
          ${htmlCards}
        </div>
      </div>
    `;

    const grid = document.getElementById("gameGrid");
    if (!grid) return;

    let first = null;
    let second = null;
    let locked = false;
    let matchedCount = 0;

    // memory starts face-down
    if (mode === "memory") {
      grid.querySelectorAll(".gameCard").forEach(btn => btn.classList.remove("flipped"));
    }

    grid.querySelectorAll(".gameCard").forEach(btn => {
      btn.addEventListener("click", () => {
        if (locked) return;
        if (btn.classList.contains("matched")) return;
        if (btn === first) return;

        if (mode === "memory") {
          btn.classList.add("flipped");
        } else {
          btn.classList.add("selected");
        }

        if (!first) {
          first = btn;
          return;
        }

        second = btn;
        locked = true;

        const k1 = first.dataset.key;
        const k2 = second.dataset.key;

        if (k1 === k2) {
          const word = (first.dataset.word || k1).toUpperCase();

          flyTogetherAndBurst(first, second, word, () => {
            first.classList.add("matched");
            second.classList.add("matched");

            // tidy selection state
            first.classList.remove("selected");
            second.classList.remove("selected");

            matchedCount += 2;
            first = null;
            second = null;
            locked = false;

            if (matchedCount === 8) {
              winSequence();
            }
          });

        } else {
          // mismatch
          setTimeout(() => {
            if (mode === "memory") {
              first.classList.remove("flipped");
              second.classList.remove("flipped");
            } else {
              first.classList.remove("selected");
              second.classList.remove("selected");
            }
            first = null;
            second = null;
            locked = false;
          }, 650);
        }
      });
    });

    function winSequence() {
      // show welldone video (6 seconds) then go back to menu
      showWinVideo(() => {
        removeBackButton();
        if (lastMenu === "memoryMenu") renderMemoryMenu();
        else renderMatchMenu();
      });
    }
  }

  function getPool(category) {
    if (category === "animals") return ASSETS.animals;
    return ASSETS.animals;
  }

// ---------------- MATCH ANIMATION ----------------
function flyTogetherAndBurst(cardA, cardB, word, onDone) {
  const HOLD_MS = 7000;   // how long EVERYTHING stays
  const FADE_MS = 500;    // fade duration at the end

  // overlay layer
  const layer = document.createElement("div");
  layer.className = "smashLayer";
  document.body.appendChild(layer);

  // positions
  const rA = cardA.getBoundingClientRect();
  const rB = cardB.getBoundingClientRect();

  // clones
  const cloneA = makeClone(cardA, rA);
  const cloneB = makeClone(cardB, rB);
  layer.appendChild(cloneA);
  layer.appendChild(cloneB);

  // word overlay (FORCE duration to match HOLD_MS + FADE_MS)
  const wf = document.createElement("div");
  wf.className = "wordFlash";
  wf.textContent = word;
  wf.style.animation = `popWord ${HOLD_MS + FADE_MS}ms ease forwards`;
  document.body.appendChild(wf);

  // center point
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

  // fly-in
  const flyOpts = {
    duration: 320,
    easing: "cubic-bezier(.2,.9,.2,1)",
    fill: "forwards",
  };

  cloneA.animate(
    [
      { transform: "translate(0px,0px) scale(1)" },
      { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)` },
    ],
    flyOpts
  );

  cloneB.animate(
    [
      { transform: "translate(0px,0px) scale(1)" },
      { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)` },
    ],
    flyOpts
  );

  // tiny impact bounce
  setTimeout(() => {
    cloneA.animate(
      [
        { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)` },
        { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(0.98)` },
        { transform: `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.05)` },
      ],
      { duration: 220, easing: "ease-out", fill: "forwards" }
    );

    cloneB.animate(
      [
        { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)` },
        { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(0.98)` },
        { transform: `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.05)` },
      ],
      { duration: 220, easing: "ease-out", fill: "forwards" }
    );
  }, 320);

  // confetti + stars near impact
  setTimeout(() => {
    burstConfettiAndStars(850);
  }, 360);

  // HOLD (do nothing). Then fade BOTH clones at the same time as the word finishes
  setTimeout(() => {
    cloneA.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, fill: "forwards" });
    cloneB.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, fill: "forwards" });
  }, HOLD_MS);

  // cleanup AFTER fade finishes
  setTimeout(() => {
    wf.remove();
    layer.remove();
    onDone && onDone();
  }, HOLD_MS + FADE_MS);
}

function makeClone(cardBtn, rect) {
  const clone = document.createElement("div");
  clone.className = "smashClone";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";

  // if memory mode and flipped, prefer front image
  const img =
    cardBtn.querySelector(".front img") ||
    cardBtn.querySelector("img");

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

  // ---------------- CONFETTI + STARS ----------------
  let raf = null;

  function burstConfettiAndStars(durationMs = 2500) {
    const c = canvas();
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      c.width = Math.floor(window.innerWidth * dpr);
      c.height = Math.floor(window.innerHeight * dpr);
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const start = performance.now();

    const colors = ["#FFD84D", "#35D05A", "#4DA3FF", "#FF4D4D", "#FF7AD9", "#FFFFFF"];

    const particles = [];
    const count = 160;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const isStar = Math.random() < 0.35;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;

      particles.push({
        x: centerX + (Math.random() - 0.5) * 20,
        y: centerY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1 + Math.random() * 2),
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.3,
        size: isStar ? (6 + Math.random() * 10) : (4 + Math.random() * 6),
        isStar,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0.9 + Math.random() * 0.6
      });
    }

    function drawStar(x, y, r, rot) {
      const spikes = 5;
      const outerRadius = r;
      const innerRadius = r * 0.45;

      ctx.beginPath();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      let rotA = Math.PI / 2 * 3;
      let step = Math.PI / spikes;

      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(Math.cos(rotA) * outerRadius, Math.sin(rotA) * outerRadius);
        rotA += step;
        ctx.lineTo(Math.cos(rotA) * innerRadius, Math.sin(rotA) * innerRadius);
        rotA += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();

      ctx.restore();
      ctx.fill();
    }

    function frame(t) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.10; // gravity
        p.rot += p.vrot;

        const fade = Math.max(0, 1 - elapsed / durationMs);
        ctx.globalAlpha = fade;

        ctx.fillStyle = p.color;

        if (p.isStar) {
          drawStar(p.x, p.y, p.size * 0.5, p.rot);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;

      if (elapsed < durationMs) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        raf = null;
      }
    }

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  // ---------------- WIN VIDEO ----------------
  function showWinVideo(onDone) {
    const overlay = document.createElement("div");
    overlay.className = "winVideoOverlay";

    const vid = document.createElement("video");
    vid.src = ASSETS.welldoneVideo + "?v=" + Date.now();
    vid.playsInline = true;
    vid.setAttribute("webkit-playsinline", "");
    vid.muted = true; // safest for iPad autoplay
    vid.autoplay = true;

    overlay.appendChild(vid);
    document.body.appendChild(overlay);

    const cleanup = () => {
      overlay.remove();
      onDone && onDone();
    };

    // Try play; if blocked, still fallback after 6s
    vid.play().catch(() => { /* ignore */ });

    setTimeout(cleanup, 6000);
  }

  // ---------------- UTIL ----------------
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function sampleUnique(list, n) {
    const copy = [...list];
    shuffle(copy);
    return copy.slice(0, Math.min(n, copy.length));
  }

  function showApp() {
    const el = app();
    if (el) el.style.display = "block";
  }

  function hideSplash() {
    const splash = document.getElementById("splash");
    if (!splash) return;
    splash.classList.add("hidden");
    setTimeout(() => splash.remove(), 400);
  }

  // ---------------- STARTUP (splash flow) ----------------
  window.addEventListener("load", () => {
    renderMatchMenu();
    showApp();

    const splash = document.getElementById("splash");
    const tapText = document.getElementById("tapText");
    const img = document.getElementById("splashImg");
    const video = document.getElementById("splashVideo");

    if (!splash || !video || !img || !tapText) return;

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
})();
