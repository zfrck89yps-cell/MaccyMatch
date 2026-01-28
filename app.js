/* app.js
   - Match Menu + Memory Menu
   - 8 cards (4 pairs)
   - Random selection
   - Memory card backs
   - Match animation with synced image + word
*/

(() => {

  /* ---------------- CONFIG ---------------- */
  const MATCH_HOLD_MS = 2000;   // 👈 MAIN CONTROL (ms image + word stay)
  const MATCH_FADE_MS = 400;    // fade-out duration

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
      animals: "./Assets/Animals.PNG",
    },
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
  let lastMenu = "matchMenu";

  /* ---------------- MENUS ---------------- */
  function renderMatchMenu() {
    lastMenu = "matchMenu";
    const el = app();
    el.className = "matchMenu";
    el.innerHTML = `
      <div class="menuWrap">
        <div class="menuGrid">
          <button class="catCardBtn" id="animalsBtn">
            <img class="catImg" src="${ASSETS.categoryThumbs.animals}">
          </button>
          <button class="catCardBtn placeholder" disabled>Vehicles</button>
          <button class="catCardBtn placeholder" disabled>Food</button>
          <button class="catCardBtn placeholder" disabled>Numbers</button>
          <button class="catCardBtn placeholder" disabled>Colours</button>
          <button class="catCardBtn placeholder" disabled>Shapes</button>
        </div>
      </div>
      <button class="toggleBtn memoryBtn" id="toMemory">
        <img src="${ASSETS.buttons.memory}">
      </button>
    `;
    animalsBtn.onclick = () => startGame("match");
    toMemory.onclick = renderMemoryMenu;
  }

  function renderMemoryMenu() {
    lastMenu = "memoryMenu";
    const el = app();
    el.className = "memoryMenu";
    el.innerHTML = `
      <div class="menuWrap">
        <div class="menuGrid">
          <button class="catCardBtn" id="animalsBtn">
            <img class="catImg" src="${ASSETS.categoryThumbs.animals}">
          </button>
        </div>
      </div>
      <button class="toggleBtn matchBtn" id="toMatch">
        <img src="${ASSETS.buttons.match}">
      </button>
    `;
    animalsBtn.onclick = () => startGame("memory");
    toMatch.onclick = renderMatchMenu;
  }

  /* ---------------- GAME ---------------- */
  function startGame(mode) {
    const el = app();
    el.className = "game";
    el.innerHTML = "";

    const picks = shuffle([...ASSETS.animals]).slice(0, 4);
    const cards = shuffle([...picks, ...picks]);

    el.innerHTML = `
      <div class="gameWrap">
        <div class="gameGrid" id="grid">
          ${cards.map(c => `
            <button class="gameCard" data-key="${c.key}">
              ${mode === "memory"
                ? `<div class="back"><img src="${ASSETS.cardback}"></div>
                   <div class="front"><img src="${c.src}"></div>`
                : `<img src="${c.src}">`
              }
            </button>
          `).join("")}
        </div>
      </div>
    `;

    let first = null, locked = false, matched = 0;

    document.querySelectorAll(".gameCard").forEach(card => {
      card.onclick = () => {
        if (locked || card === first || card.classList.contains("matched")) return;
        if (mode === "memory") card.classList.add("flipped");

        if (!first) { first = card; return; }

        locked = true;
        if (first.dataset.key === card.dataset.key) {
          animateMatch(first, card, first.dataset.key.toUpperCase(), () => {
            first.classList.add("matched");
            card.classList.add("matched");
            matched += 2;
            first = null;
            locked = false;
          });
        } else {
          setTimeout(() => {
            first.classList.remove("flipped");
            card.classList.remove("flipped");
            first = null;
            locked = false;
          }, 600);
        }
      };
    });
  }

  /* ---------------- MATCH ANIMATION ---------------- */
  function animateMatch(cardA, cardB, word, done) {
    const layer = document.createElement("div");
    layer.className = "smashLayer";
    document.body.appendChild(layer);

    const cloneA = cloneCard(cardA);
    const cloneB = cloneCard(cardB);
    layer.append(cloneA, cloneB);

    const wf = document.createElement("div");
    wf.className = "wordFlash";
    wf.textContent = word;
    wf.style.animation = `popWord ${MATCH_HOLD_MS + MATCH_FADE_MS}ms ease forwards`;
    document.body.appendChild(wf);

    burstConfettiAndStars(1200);

    setTimeout(() => {
      cloneA.style.opacity = 0;
      cloneB.style.opacity = 0;
    }, MATCH_HOLD_MS);

    setTimeout(() => {
      wf.remove();
      layer.remove();
      done();
    }, MATCH_HOLD_MS + MATCH_FADE_MS);
  }

  function cloneCard(card) {
    const r = card.getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "smashClone";
    Object.assign(d.style, {
      left: r.left + "px",
      top: r.top + "px",
      width: r.width + "px",
      height: r.height + "px",
      position: "fixed",
    });
    const img = card.querySelector("img");
    d.appendChild(img.cloneNode());
    return d;
  }

  /* ---------------- CONFETTI ---------------- */
  function burstConfettiAndStars(ms) {
    const c = canvas(), ctx = c.getContext("2d");
    c.width = innerWidth; c.height = innerHeight;
    const start = performance.now();
    const parts = [...Array(120)].map(() => ({
      x: innerWidth/2, y: innerHeight/2,
      vx: (Math.random()-0.5)*10,
      vy: (Math.random()-1)*10
    }));
    (function draw(t){
      ctx.clearRect(0,0,c.width,c.height);
      parts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.4;
        ctx.fillStyle="#FFD84D";
        ctx.fillRect(p.x,p.y,4,4);
      });
      if (t-start < ms) requestAnimationFrame(draw);
    })(start);
  }

  /* ---------------- UTILS ---------------- */
  function shuffle(a){ for(let i=a.length-1;i;i--){const j=Math.random()*i|0;[a[i],a[j]]=[a[j],a[i]]}return a }

  /* ---------------- SPLASH ---------------- */
  window.onload = () => {
    renderMatchMenu();
    app().style.display = "block";
    document.getElementById("splash").addEventListener("pointerup", () => {
      document.getElementById("splash").remove();
    }, { once:true });
  };

})();
