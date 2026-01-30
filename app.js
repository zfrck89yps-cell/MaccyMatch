
/* app.js
   - Match Menu + Memory Menu (toggle buttons)
   - Menus show 6 category cards at a time (3x2) with vertical scrolling
   - 8 cards (4 pairs) every round in both games
   - Random 4-pair selection each round from chosen category
   - Memory uses Cardback .PNG (face down)
   - Win: plays Welldone .MP4 for ~6s then returns
   - Match animation: fly together + dim + confetti (3s) + word flash
   - Back button ONLY on game screens -> previous menu
*/

(() => {
  const ASSETS = {
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
      animals: "./Assets/Animals/Animal-category.png",
      body: "./Assets/Body/Body-category .png",
      clothes: "./Assets/Clothes/Clothes-category .png",
      colours: "./Assets/Colours/Colour-category .png",
      everyday: "./Assets/Everyday/Everyday-category.png",
      food: "./Assets/Food/Food-category .png",
      numbers: "./Assets/Numbers/Numbers-category.png",
      shapes: "./Assets/Shapes/Shapes-category .png",
      transport: "./Assets/Transport/Transport-category .png",
    },

    pools: {
      animals: [
        { key: "bird", src: "./Assets/Animals/Bird.png" },
        { key: "cat", src: "./Assets/Animals/Cat.png" },
        { key: "cow", src: "./Assets/Animals/Cow.png" },
        { key: "crab", src: "./Assets/Animals/Crab.png" },
        { key: "dog", src: "./Assets/Animals/Dog.png" },
        { key: "duck", src: "./Assets/Animals/Duck.png" },
        { key: "elephant", src: "./Assets/Animals/Elephant.png" },
        { key: "fish", src: "./Assets/Animals/Fish.png" },
        { key: "frog", src: "./Assets/Animals/Frog.png" },
        { key: "lion", src: "./Assets/Animals/Lion.png" },
        { key: "monkey", src: "./Assets/Animals/Monkey.png" },
        { key: "panda", src: "./Assets/Animals/Panda.png" },
        { key: "pig", src: "./Assets/Animals/Pig.png" },
        { key: "rabbit", src: "./Assets/Animals/Rabbit.png" },
      ],

      body: [
        { key: "arm", src: "./Assets/Body/Arm.png" },
        { key: "ear", src: "./Assets/Body/Ear.png" },
        { key: "eyes", src: "./Assets/Body/Eyes.png" },
        { key: "feet", src: "./Assets/Body/Feet.png" },
        { key: "fingers", src: "./Assets/Body/Fingers.png" },
        { key: "hand", src: "./Assets/Body/Hand.png" },
        { key: "head", src: "./Assets/Body/Head.png" },
        { key: "leg", src: "./Assets/Body/Leg.png" },
        { key: "mouth", src: "./Assets/Body/Mouth.png" },
        { key: "nose", src: "./Assets/Body/Nose.png" },
        { key: "toes", src: "./Assets/Body/Toes.png" },
        { key: "tummy", src: "./Assets/Body/Tummy.png" },
      ],

      clothes: [
        { key: "coat", src: "./Assets/Clothes/Coat.png" },
        { key: "gloves", src: "./Assets/Clothes/Gloves.png" },
        { key: "hat", src: "./Assets/Clothes/Hat.png" },
        { key: "jumper", src: "./Assets/Clothes/Jumper.png" },
        { key: "pants", src: "./Assets/Clothes/Pants.png" },
        { key: "shoes", src: "./Assets/Clothes/Shoes.png" },
        { key: "socks", src: "./Assets/Clothes/Socks.png" },
        { key: "tshirt", src: "./Assets/Clothes/T-shirt.png" },
        { key: "trousers", src: "./Assets/Clothes/Trousers.png" },
        { key: "vest", src: "./Assets/Clothes/Vest.png" },
        { key: "wellies", src: "./Assets/Clothes/Wellies.png" },
      ],

      colours: [
        { key: "black", src: "./Assets/Colours/Black.png" },
        { key: "blue", src: "./Assets/Colours/Blue.png" },
        { key: "brown", src: "./Assets/Colours/Brown.png" },
        { key: "green", src: "./Assets/Colours/Green.png" },
        { key: "orange", src: "./Assets/Colours/Orange.png" },
        { key: "pink", src: "./Assets/Colours/Pink.png" },
        { key: "purple", src: "./Assets/Colours/Purple.png" },
        { key: "red", src: "./Assets/Colours/Red .png" },
        { key: "white", src: "./Assets/Colours/White.png" },
        { key: "yellow", src: "./Assets/Colours/Yellow.png" },
      ],

      everyday: [
        { key: "beach", src: "./Assets/Everyday/Beach.png" },
        { key: "bed", src: "./Assets/Everyday/Bed.png" },
        { key: "bowl", src: "./Assets/Everyday/Bowl.png" },
        { key: "bucketspade", src: "./Assets/Everyday/Bucket&spade.png" },
        { key: "chair", src: "./Assets/Everyday/Chair.png" },
        { key: "clock", src: "./Assets/Everyday/Clock.png" },
        { key: "cloud", src: "./Assets/Everyday/Cloud.png" },
        { key: "cup", src: "./Assets/Everyday/Cup.png" },
        { key: "door", src: "./Assets/Everyday/Door.png" },
        { key: "flower", src: "./Assets/Everyday/Flower.png" },
        { key: "fork", src: "./Assets/Everyday/Fork.png" },
        { key: "house", src: "./Assets/Everyday/House.png" },
        { key: "knife", src: "./Assets/Everyday/Knife.png" },
        { key: "moon", src: "./Assets/Everyday/Moon.png" },
        { key: "park", src: "./Assets/Everyday/Park.png" },
        { key: "plate", src: "./Assets/Everyday/Plate.png" },
        { key: "rainbow", src: "./Assets/Everyday/Rainbow.png" },
        { key: "road", src: "./Assets/Everyday/Road.png" },
        { key: "spoon", src: "./Assets/Everyday/Spoon .png" },
        { key: "sun", src: "./Assets/Everyday/Sun.png" },
        { key: "table", src: "./Assets/Everyday/Table.png" },
        { key: "telly", src: "./Assets/Everyday/Telly.png" },
        { key: "tree", src: "./Assets/Everyday/Tree.png" },
        { key: "window", src: "./Assets/Everyday/Window.png" },
      ],

      food: [
        { key: "apple", src: "./Assets/Food/Apple.png" },
        { key: "banana", src: "./Assets/Food/Banana.png" },
        { key: "biscuits", src: "./Assets/Food/Biscuits.png" },
        { key: "bread", src: "./Assets/Food/Bread.png" },
        { key: "burger", src: "./Assets/Food/Burger.png" },
        { key: "cake", src: "./Assets/Food/Cake.png" },
        { key: "chips", src: "./Assets/Food/Chips.png" },
        { key: "chocolate", src: "./Assets/Food/Chocolate.png" },
        { key: "crisp", src: "./Assets/Food/Crisp.png" },
        { key: "grapes", src: "./Assets/Food/Grapes.png" },
        { key: "melon", src: "./Assets/Food/Melon.png" },
        { key: "milk", src: "./Assets/Food/Milk.png" },
        { key: "orange", src: "./Assets/Food/Orange.png" },
        { key: "pear", src: "./Assets/Food/Pear.png" },
        { key: "pizza", src: "./Assets/Food/Pizza .png" },
        { key: "sandwich", src: "./Assets/Food/Sandwich.png" },
        { key: "strawberry", src: "./Assets/Food/Strawberry.png" },
        { key: "water", src: "./Assets/Food/Water.png" },
        { key: "watermelon", src: "./Assets/Food/Watermelon.png" },
      ],

      numbers: [
        { key: "1", src: "./Assets/Numbers/1.PNG" },
        { key: "2", src: "./Assets/Numbers/2.PNG" },
        { key: "3", src: "./Assets/Numbers/3.PNG" },
        { key: "4", src: "./Assets/Numbers/4.PNG" },
        { key: "5", src: "./Assets/Numbers/5.PNG" },
        { key: "6", src: "./Assets/Numbers/6.PNG" },
        { key: "7", src: "./Assets/Numbers/7.PNG" },
        { key: "8", src: "./Assets/Numbers/8.PNG" },
        { key: "9", src: "./Assets/Numbers/9.PNG" },
        { key: "10", src: "./Assets/Numbers/10.PNG" },
      ],

      shapes: [
        { key: "circle", src: "./Assets/Shapes/Circle.png" },
        { key: "diamond", src: "./Assets/Shapes/Diamond .png" },
        { key: "heart", src: "./Assets/Shapes/Heart.png" },
        { key: "hexagon", src: "./Assets/Shapes/Hexagon .png" },
        { key: "oval", src: "./Assets/Shapes/Oval.png" },
        { key: "rectangle", src: "./Assets/Shapes/Rectangle .png" },
        { key: "square", src: "./Assets/Shapes/Square.png" },
        { key: "star", src: "./Assets/Shapes/Star.png" },
        { key: "triangle", src: "./Assets/Shapes/Triangle.png" },
      ],

      transport: [
        { key: "ambulance", src: "./Assets/Transport/Ambulance.png" },
        { key: "bike", src: "./Assets/Transport/Bike.png" },
        { key: "boat", src: "./Assets/Transport/Boat.png" },
        { key: "bus", src: "./Assets/Transport/Bus.png" },
        { key: "car", src: "./Assets/Transport/Car.png" },
        { key: "fireengine", src: "./Assets/Transport/Fire engine.png" },
        { key: "helicopter", src: "./Assets/Transport/Heilcopter.png" },
        { key: "plane", src: "./Assets/Transport/Plane.png" },
        { key: "policecar", src: "./Assets/Transport/Policecar .png" },
        { key: "scooter", src: "./Assets/Transport/Scooter.png" },
        { key: "tractor", src: "./Assets/Transport/Tractor.png" },
        { key: "train", src: "./Assets/Transport/Train.png" },
        { key: "truck", src: "./Assets/Transport/Truck.png" },
        { key: "wheel", src: "./Assets/Transport/Wheel.png" },
      ],
    },
  };

  const CATEGORIES = [
    { id: "animals", label: "Animals" },
    { id: "body", label: "Body" },
    { id: "clothes", label: "Clothes" },
    { id: "colours", label: "Colours" },
    { id: "everyday", label: "Everyday" },
    { id: "food", label: "Food" },
    { id: "numbers", label: "Numbers" },
    { id: "shapes", label: "Shapes" },
    { id: "transport", label: "Transport" },
  ];

  const app = () => document.getElementById("app");
  const canvas = () => document.getElementById("confettiCanvas");

  let lastMenu = "matchMenu";

  // ---------------- MENUS ----------------
  function renderMenu(mode) {
    lastMenu = mode;

    // IMPORTANT: remove back button when on menus
    removeBackButton();

    const el = app();
    if (!el) return;

    el.className = mode;

    const cardsHtml = CATEGORIES.map(cat => {
      const thumb = ASSETS.categoryThumbs[cat.id];
      return `
        <button class="catCardBtn" data-cat="${cat.id}" aria-label="${cat.label}">
          <img class="catImg" src="${thumb}" alt="${cat.label}">
        </button>
      `;
    }).join("");

    el.innerHTML = `
      <div class="menuWrap">
        <div class="menuScroll" id="menuScroll">
          <div class="menuGrid" aria-label="Categories">
            ${cardsHtml}
          </div>
          <div class="menuScrollPad"></div>
        </div>
      </div>

      ${
        mode === "matchMenu"
          ? `<button class="toggleBtn memoryBtn" id="toMemory" aria-label="Go to Memory">
               <img src="${ASSETS.buttons.memory}" alt="Maccy Memory">
             </button>`
          : `<button class="toggleBtn matchBtn" id="toMatch" aria-label="Go to Match">
               <img src="${ASSETS.buttons.match}" alt="Maccy Match">
             </button>`
      }
    `;

    // click category -> start game with chosen mode
    el.querySelectorAll(".catCardBtn[data-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        const category = btn.getAttribute("data-cat");
        const gameMode = (mode === "matchMenu") ? "match" : "memory";
        startGame({ mode: gameMode, category });
      });
    });

    document.getElementById("toMemory")?.addEventListener("click", () => renderMenu("memoryMenu"));
    document.getElementById("toMatch")?.addEventListener("click", () => renderMenu("matchMenu"));
  }

  function renderBackButton() {
    document.querySelector(".backBtn")?.remove();
    const btn = document.createElement("button");
    btn.className = "backBtn";
    btn.textContent = "← Back";
    btn.addEventListener("click", () => {
      if (lastMenu === "memoryMenu") renderMenu("memoryMenu");
      else renderMenu("matchMenu");
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
    if (!pool || pool.length < 4) {
      el.innerHTML = `
        <div style="padding:24px;color:#fff;font-weight:800;">
          Missing/too-small category pool: <b>${category}</b><br>
          Add at least 4 images to ASSETS.pools["${category}"].
        </div>
      `;
      return;
    }

    const picks = sampleUnique(pool, 4);
    const cards = shuffle([...picks, ...picks].map((c, i) => ({ ...c, id: `${c.key}_${i}` })));

    const htmlCards = cards.map(c => {
      if (mode === "memory") {
        return `
          <button class="gameCard" data-key="${c.key}" data-word="${c.key}" data-id="${c.id}" aria-label="${c.key}">
            <div class="back"><img src="${ASSETS.cardback}" alt="Card back"></div>
            <div class="front"><img src="${c.src}" alt="${c.key}"></div>
          </button>
        `;
      }

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

    if (mode === "memory") {
      grid.querySelectorAll(".gameCard").forEach(btn => btn.classList.remove("flipped"));
    }

    grid.querySelectorAll(".gameCard").forEach(btn => {
      btn.addEventListener("click", () => {
        if (locked) return;
        if (btn.classList.contains("matched")) return;
        if (btn === first) return;

        // selection style
        if (mode === "memory") btn.classList.add("flipped");
        btn.classList.add("selected");

        // clear previous "selected" if first pick exists and you tap another first? (we don't)
        if (!first) {
          first = btn;
          return;
        }

        second = btn;
        locked = true;

        const k1 = first.dataset.key;
        const k2 = second.dataset.key;

        if (k1 === k2) {
          const word = String(first.dataset.word || k1).toUpperCase();

          flyTogetherAndBurst(first, second, word, () => {
            first.classList.add("matched");
            second.classList.add("matched");

            first.classList.remove("selected");
            second.classList.remove("selected");

            matchedCount += 2;
            first = null;
            second = null;
            locked = false;

            if (matchedCount === 8) winSequence();
          });

        } else {
          setTimeout(() => {
            if (mode === "memory") {
              first.classList.remove("flipped");
              second.classList.remove("flipped");
            }
            first.classList.remove("selected");
            second.classList.remove("selected");

            first = null;
            second = null;
            locked = false;
          }, 650);
        }
      });
    });

    function winSequence() {
      showWinVideo(() => {
        removeBackButton();
        renderMenu(lastMenu); // return to where you came from
      });
    }
  }

  function getPool(category) {
    return ASSETS.pools[category] || null;
  }

  // ---------------- MATCH ANIMATION HELPERS ----------------
  function makeClone(cardBtn, rect) {
    const clone = document.createElement("div");
    clone.className = "smashClone";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";

    const img = cardBtn.querySelector(".front img") || cardBtn.querySelector("img");
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

function flyTogetherAndBurst(cardA, cardB, word, onDone) {
  const HOLD_MS = 1200;
const FADE_MS = 250;
const CONFETTI_MS = 3000; // <-- 3 seconds

  let layer, dim, wf, cloneA, cloneB;

  const safeDone = () => {
    try { wf?.remove(); } catch (_) {}
    try { layer?.remove(); } catch (_) {}
    onDone && onDone();
  };

  try {
    // 1) Overlay
    layer = document.createElement("div");
    layer.className = "smashLayer";
    document.body.appendChild(layer);

    // 2) Dim (fade in AFTER transition exists)
    dim = document.createElement("div");
    dim.className = "smashDim";
    layer.appendChild(dim);

    // Force paint, then fade in
    requestAnimationFrame(() => {
      dim.style.opacity = "1";
    });

    // 3) Clone positions
    const rA = cardA.getBoundingClientRect();
    const rB = cardB.getBoundingClientRect();

    cloneA = makeClone(cardA, rA);
    cloneB = makeClone(cardB, rB);
    layer.appendChild(cloneA);
    layer.appendChild(cloneB);

    // 4) Word
    wf = document.createElement("div");
    wf.className = "wordFlash";
    wf.textContent = word;
    wf.style.animation = `popWord ${HOLD_MS + FADE_MS}ms ease-out forwards`;
    document.body.appendChild(wf);

    // 5) Calculate centre move
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

    // 6) Prep clone transitions
    const prep = (el) => {
      el.style.willChange = "transform, opacity";
      el.style.transition = `transform 320ms cubic-bezier(.2,.9,.2,1), opacity ${FADE_MS}ms ease`;
      el.style.transform = "translate(0px,0px) scale(1)";
      el.style.opacity = "1";
    };

    prep(cloneA);
    prep(cloneB);

    // Force layout (Safari reliability)
    cloneA.getBoundingClientRect();
    cloneB.getBoundingClientRect();

    // 7) Fly!
    requestAnimationFrame(() => {
      cloneA.style.transform = `translate(${toCenterA.x}px,${toCenterA.y}px) scale(1.08)`;
      cloneB.style.transform = `translate(${toCenterB.x}px,${toCenterB.y}px) scale(1.08)`;
    });

    // 8) Confetti for the full hold duration (3 sec if you want)
    setTimeout(() => burstConfettiAndStars(HOLD_MS + FADE_MS), 10);

    // 9) Fade out everything
    setTimeout(() => {
      try {
        cloneA.style.opacity = "0";
        cloneB.style.opacity = "0";
        dim.style.opacity = "0";
      } catch (_) {}
    }, HOLD_MS);

    // 10) Cleanup
    setTimeout(safeDone, HOLD_MS + FADE_MS);

  } catch (err) {
    console.error("flyTogetherAndBurst error:", err);
    safeDone();
  }
}

  // ---------------- CONFETTI + STARS ----------------
  let raf = null;

  function burstConfettiAndStars(durationMs = 3000) {
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
        p.vy += 0.10;
        p.rot += p.vrot;

        const fade = Math.max(0, 1 - elapsed / durationMs);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;

        if (p.isStar) drawStar(p.x, p.y, p.size * 0.5, p.rot);
        else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;

      if (elapsed < durationMs) raf = requestAnimationFrame(frame);
      else {
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
    vid.muted = true;
    vid.autoplay = true;

    overlay.appendChild(vid);
    document.body.appendChild(overlay);

    const cleanup = () => {
      overlay.remove();
      onDone && onDone();
    };

    vid.play().catch(() => {});
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
    renderMenu("matchMenu");
    showApp();

    const splash = document.getElementById("splash");
    const tapText = document.getElementById("tapText");
    const img = document.getElementById("splashImg");
    const video = document.getElementById("splashVideo");

    if (!splash || !video || !img || !tapText) return;

    img.style.display = "block";
    video.style.display = "none";
    tapText.style.display = "block";

    let started = false;

    const start = async (e) => {
      if (started) return;
      started = true;

      e?.preventDefault?.();
      e?.stopPropagation?.();

      tapText.textContent = "Loading…";
      tapText.style.display = "block";

      video.src = "./Assets/Splash.mp4?v=" + Date.now();
      video.currentTime = 0;

      video.muted = true;
      video.volume = 1.0;

      let endedAlready = false;
      const endSplash = () => {
        if (endedAlready) return;
        endedAlready = true;
        hideSplash();
      };

      video.addEventListener("ended", endSplash, { once: true });
      video.addEventListener("error", endSplash, { once: true });

      video.addEventListener("playing", () => {
        tapText.style.display = "none";
        video.style.display = "block";
        img.style.display = "none";

        try { video.muted = false; video.volume = 1.0; } catch (_) {}

        const ms = (Number.isFinite(video.duration) && video.duration > 0)
          ? Math.ceil(video.duration * 1000) + 250
          : 4500;

        setTimeout(endSplash, ms);
      }, { once: true });

      try {
        await video.play();
      } catch (_) {
        endSplash();
      }
    };

    splash.addEventListener("touchstart", start, { passive: false });
    splash.addEventListener("pointerdown", start);
    splash.addEventListener("click", start);
  });
})();