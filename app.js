const app = document.getElementById("app");

/* ---------- MENU SCREENS ---------- */
function renderMatchMenu(){
  app.className = "matchMenu";
  app.innerHTML = `
    <div class="menuWrap">
      <div class="menuGrid">
        <button class="catCardBtn" id="matchAnimals">
          <img src="./Assets/Animals.PNG">
        </button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
      </div>
    </div>

    <button class="modeBtn right" id="toMemory">
      <img src="./Assets/Memory-button.PNG">
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
          <img src="./Assets/Animals.PNG">
        </button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
        <button class="catCardBtn" disabled></button>
      </div>
    </div>

    <button class="modeBtn left" id="toMatch">
      <img src="./Assets/Match-button.PNG">
    </button>
  `;

  document.getElementById("memoryAnimals").onclick = startMemoryGame;
  document.getElementById("toMatch").onclick = renderMatchMenu;
}

/* ---------- MATCH GAME (face up) ---------- */
function startMatchGame(){
  app.className = "game";

  const animals = [
    "./Assets/Cat.png",
    "./Assets/Dog.png",
    "./Assets/Duck.png",
    "./Assets/Cat.png",
    "./Assets/Dog.png",
    "./Assets/Duck.png",
  ].sort(()=>Math.random()-0.5);

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid">
        ${animals.map(src=>`
          <button class="gameCard"><img src="${src}" style="width:100%;height:100%;object-fit:cover"></button>
        `).join("")}
      </div>
    </div>
  `;
}

/* ---------- MEMORY GAME (face down, 8 cards) ---------- */
function startMemoryGame(){
  app.className = "game";

  const animals = [
    "./Assets/Cat.png","./Assets/Dog.png",
    "./Assets/Duck.png","./Assets/Pig.png",
    "./Assets/Cat.png","./Assets/Dog.png",
    "./Assets/Duck.png","./Assets/Pig.png"
  ].sort(()=>Math.random()-0.5);

  app.innerHTML = `
    <div class="gameWrap">
      <div class="gameGrid">
        ${animals.map(src=>`
          <button class="gameCard" data-src="${src}">
            <div class="cardBack"></div>
            <div class="cardFront"><img src="${src}"></div>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  let first=null,lock=false;

  document.querySelectorAll(".gameCard").forEach(card=>{
    card.onclick=()=>{
      if(lock||card.classList.contains("matched")||card===first) return;
      card.classList.add("flipped");

      if(!first){ first=card; return; }

      lock=true;
      if(first.dataset.src===card.dataset.src){
        first.classList.add("matched");
        card.classList.add("matched");
        reset();
      }else{
        setTimeout(()=>{
          first.classList.remove("flipped");
          card.classList.remove("flipped");
          reset();
        },700);
      }
    };
  });

  function reset(){ first=null; lock=false; }
}

/* ---------- START ---------- */
window.onload=()=>{
  app.style.display="block";
  renderMatchMenu();
};
