const app = document.getElementById("app");

/* ---------- MENUS ---------- */
function renderMatchMenu(){
  app.className = "matchMenu";
  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid">
        <button class="catCardBtn" id="matchAnimals">
          <img src="./Assets/Animals.PNG" alt="Animals">
        </button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
      </div>
    </div>

    <button class="modeBtn right" id="toMemory" aria-label="Maccy Memory">
      <img src="./Assets/Memory-button.PNG" alt="Maccy Memory">
    </button>
  `;

  document.getElementById("matchAnimals").onclick = startMatchGame;
  document.getElementById("toMemory").onclick = renderMemoryMenu;
}

function renderMemoryMenu(){
  app.className = "memoryMenu";
  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid">
        <button class="catCardBtn" id="memoryAnimals">
          <img src="./Assets/Animals.PNG" alt="Animals">
        </button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
      </div>
    </div>

    <button class="modeBtn left" id="toMatch" aria-label="Maccy Match">
      <img src="./Assets/Match-button.PNG" alt="Maccy Match">
    </button>
  `;

  document.getElementById("memoryAnimals").onclick = startMemoryGame;
  document.getElementById("toMatch").onclick = renderMatchMenu;
}

/* ---------- MATCH GAME (face up, 6 cards) ---------- */
function startMatchGame(){
  app.className = "game";

  const cards = shuffle([
    "./Assets/Cat.png", "./Assets/Dog.png", "./Assets/Duck.png",
    "./Assets/Cat.png", "./Assets/Dog.png", "./Assets/Duck.png",
  ]);

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid" style="grid-template-columns:repeat(3,1fr);">
        ${cards.map(src => `
          <button class="gameCard">
            <img src="${src}" style="width:100%;height:100%;object-fit:cover" alt="">
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

/* ---------- MEMORY GAME (face down, 8 cards) ---------- */
function startMemoryGame(){
  app.className = "game";

  const cards = shuffle([
    "./Assets/Cat.png","./Assets/Dog.png","./Assets/Duck.png","./Assets/Pig.png",
    "./Assets/Cat.png","./Assets/Dog.png","./Assets/Duck.png","./Assets/Pig.png"
  ]);

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid">
        ${cards.map(src => `
          <button class="gameCard" data-src="${src}">
            <div class="cardBack"></div>
            <div class="cardFront"><img src="${src}" alt=""></div>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  let first = null;
  let locked = false;

  document.querySelectorAll(".gameCard").forEach(card => {
    card.onclick = () => {
      if (locked) return;
      if (card.classList.contains("matched")) return;
      if (card === first) return;

      card.classList.add("flipped");

      if (!first) { first = card; return; }

      locked = true;

      if (first.dataset.src === card.dataset.src) {
        first.classList.add("matched");
        card.classList.add("matched");
        first = null;
        locked = false;
      } else {
        setTimeout(() => {
          first.classList.remove("flipped");
          card.classList.remove("flipped");
          first = null;
          locked = false;
        }, 700);
      }
    };
  });
}

/* ---------- SPLASH FLOW ---------- */
function showApp(){
  app.style.display = "block";
}

function hideSplash(){
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.classList.add("hidden");
  setTimeout(() => splash.remove(), 400);
}

window.addEventListener("load", () => {
  // Prepare app behind splash
  showApp();
  renderMatchMenu();

  const splash = document.getElementById("splash");
  const tapText = document.getElementById("tapText");
  const img = document.getElementById("splashImg");
  const video = document.getElementById("splashVideo");

  if (!splash || !tapText || !img || !video) return;

  img.style.display = "block";
  video.style.display = "none";
  tapText.style.display = "block";

  let started = false;

  const start = async () => {
    if (started) return;
    started = true;

    tapText.textContent = "Loading…";
    tapText.style.display = "block";

    // force refresh video cache
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
    video.addEventListener("error", endSplash, { once: true });

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

    try {
      await video.play();
    } catch (e) {
      // iOS often blocks unmuted autoplay
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

/* ---------- UTIL ---------- */
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
