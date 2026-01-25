const $ = (s) => document.querySelector(s);

const main = $("#main");
const titleEl = $("#title");
const backBtn = $("#backBtn");

const overlayWord = $("#overlayWord");
const overlayWordText = $("#overlayWordText");
const overlayBig = $("#overlayBig");
const overlayBigImg = $("#overlayBigImg");
const overlayDone = $("#overlayDone");
const againBtn = $("#againBtn");
const nextBtn = $("#nextBtn");

const confettiCanvas = $("#confetti");
const ctx = confettiCanvas.getContext("2d");

// ---- Speech ----
function speak(text){
  if (!("speechSynthesis" in window)) return;
  try{
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices?.() || [];
    const v = voices.find(x=>/en-GB/i.test(x.lang)) || voices.find(x=>/en/i.test(x.lang));
    if (v) u.voice = v;
    u.rate = 0.9;
    u.pitch = 1.15;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }catch{}
}
if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = ()=>{};

// ---- Sounds ----
const audioPool = new Map();
function playSound(file){
  if (!file) return;
  const url = `sounds/${file}`;
  let a = audioPool.get(file);
  if (!a){ a = new Audio(url); a.preload="auto"; audioPool.set(file,a); }
  a.currentTime = 0;
  a.play().catch(()=>{});
}

// ---- Confetti ----
let confettiPieces = [];
function resizeConfetti(){
  const dpr = window.devicePixelRatio || 1;
  confettiCanvas.width = Math.floor(window.innerWidth * dpr);
  confettiCanvas.height = Math.floor(window.innerHeight * dpr);
  confettiCanvas.style.width = window.innerWidth + "px";
  confettiCanvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize", resizeConfetti);
resizeConfetti();

function burstConfetti(){
  const w = window.innerWidth;
  const colors = ["#ff4fa3","#ffd84d","#52f2c2","#3aa7ff","#ff9b2f","#ffffff"];
  for (let i=0;i<120;i++){
    confettiPieces.push({
      x: Math.random()*w,
      y: -10,
      vx:(Math.random()-0.5)*2,
      vy:3+Math.random()*5,
      size:6+Math.random()*7,
      rot:Math.random()*Math.PI,
      vr:(Math.random()-0.5)*0.3,
      color: colors[Math.floor(Math.random()*colors.length)],
      life:120+Math.floor(Math.random()*40)
    });
  }
}
function tickConfetti(){
  ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
  confettiPieces = confettiPieces.filter(p=>p.life>0);
  for (const p of confettiPieces){
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.vy+=0.03; p.life--;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
    ctx.fillStyle=p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
    ctx.restore();
  }
  requestAnimationFrame(tickConfetti);
}
tickConfetti();

// ---- Navigation ----
let library = null;
let nav = [];
let currentCategory = null;
let currentSubcategory = null;
let currentDifficulty = 4;

function setTitle(t){ titleEl.textContent = t; }
function showBack(on){ backBtn.hidden = !on; }
function clearMain(){ main.innerHTML = ""; }

backBtn.addEventListener("click", ()=>{ nav.pop(); render(); }, {passive:true});
backBtn.addEventListener("touchend", (e)=>{ e.preventDefault(); nav.pop(); render(); }, {passive:false});

function push(screen, data){ nav.push({screen,data}); render(); }

function mkBtn(html, onClick, className="big-btn"){
  const b = document.createElement("button");
  b.className = className;
  b.innerHTML = html;
  b.addEventListener("click", onClick, {passive:true});
  b.addEventListener("touchend", (e)=>{ e.preventDefault(); onClick(); }, {passive:false});
  return b;
}
function emoji(id){ return ({animals:"🦊",vehicles:"🚒",objects:"🧸",numbers:"🔢"}[id] || "⭐️"); }

function renderHome(){
  setTitle("Maccy Match");
  showBack(false);
  clearMain();
  const grid = document.createElement("div");
  grid.className="grid";
  for (const cat of library.categories){
    grid.appendChild(mkBtn(`<span class="emoji">${emoji(cat.id)}</span> ${cat.title}`, ()=>{
      currentCategory = cat;
      push("category",{});
    }));
  }
  main.appendChild(grid);
}

function renderCategory(){
  setTitle(currentCategory.title);
  showBack(true);
  clearMain();
  const list = document.createElement("div");
  list.className="list";
  for (const sub of currentCategory.subcategories){
    const card = document.createElement("div"); card.className="subcard";
    const h = document.createElement("div"); h.className="subcard-title"; h.textContent=sub.title;
    const row = document.createElement("div"); row.className="diff-row";
    const diffs = [{t:"Easy (4)",v:4},{t:"Medium (6)",v:6},{t:"Hard (8)",v:8}];
    for (const d of diffs){
      row.appendChild(mkBtn(d.t, ()=>{
        currentSubcategory=sub; currentDifficulty=d.v;
        push("game",{});
        startNewRound();
      }, "pill"));
    }
    card.appendChild(h); card.appendChild(row); list.appendChild(card);
  }
  main.appendChild(list);
}

// ---- Game ----
let deck = [];
let firstPick = null;
let secondPick = null;
let resolving = false;

function shuffle(arr){
  for (let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function buildDeck(){
  const pairsNeeded = Math.max(2, Math.floor(currentDifficulty/2));
  const items = shuffle([...currentSubcategory.items]).slice(0, pairsNeeded);
  deck = shuffle(items.flatMap(item => ([
    {uid: crypto.randomUUID(), item, matched:false},
    {uid: crypto.randomUUID(), item, matched:false}
  ])));
}

function renderGame(){
  setTitle(`${currentCategory.title} • ${currentSubcategory.title}`);
  showBack(true);
  clearMain();

  const grid = document.createElement("div");
  grid.className="game-grid";

  for (const c of deck){
    const el = document.createElement("div");
    el.className="card";
    if (firstPick?.uid===c.uid || secondPick?.uid===c.uid) el.classList.add("selected");
    const img = document.createElement("img");
    img.src = `assets/${c.item.image}`;
    img.alt = c.item.name;
    el.appendChild(img);

    if (c.matched){
      const t = document.createElement("div"); t.className="tick"; t.textContent="✓"; el.appendChild(t);
    }

    const handler = ()=>onCardTap(c.uid);
    el.addEventListener("click", handler, {passive:true});
    el.addEventListener("touchend", (e)=>{ e.preventDefault(); handler(); }, {passive:false});
    grid.appendChild(el);
  }
  main.appendChild(grid);

  const actions = document.createElement("div");
  actions.className="bottom-actions";
  actions.appendChild(mkBtn("New Round", ()=>{ startNewRound(); render(); }, "pill"));
  main.appendChild(actions);
}

function onCardTap(uid){
  if (resolving) return;
  const card = deck.find(x=>x.uid===uid);
  if (!card || card.matched) return;

  if (!firstPick){
    firstPick = card; render(); return;
  }
  if (firstPick.uid===uid) return;

  if (!secondPick){
    secondPick = card; resolving = true; render(); resolvePicks();
  }
}

function resolvePicks(){
  const same = firstPick.item.id === secondPick.item.id;
  if (same){
    deck = deck.map(c => (c.uid===firstPick.uid || c.uid===secondPick.uid) ? {...c, matched:true} : c);
    celebrate(firstPick.item).then(()=>{
      firstPick=null; secondPick=null; resolving=false; render();
      if (deck.every(c=>c.matched)) finishRound();
    });
  } else {
    setTimeout(()=>{ firstPick=null; secondPick=null; resolving=false; render(); }, 550);
  }
}

function showWord(text){
  return new Promise((resolve)=>{
    overlayWordText.textContent = text;
    overlayWord.hidden = false;
    speak(text);
    setTimeout(()=>{ overlayWord.hidden = true; resolve(); }, 850);
  });
}

function showBigPicture(item){
  return new Promise((resolve)=>{
    overlayBigImg.src = `assets/${item.image}`;
    overlayBig.hidden = false;
    playSound(item.sound);
    setTimeout(()=>{ overlayBig.hidden = true; resolve(); }, 1100);
  });
}

async function celebrate(item){
  burstConfetti();
  await showWord(item.name);
  await showBigPicture(item);
  burstConfetti();
}

function finishRound(){
  burstConfetti();
  overlayDone.hidden = false;
}

// Done overlay buttons (click + touch)
function wireBtn(btn, fn){
  btn.addEventListener("click", fn, {passive:true});
  btn.addEventListener("touchend", (e)=>{ e.preventDefault(); fn(); }, {passive:false});
}
wireBtn(againBtn, ()=>{ overlayDone.hidden=true; startNewRound(); render(); });
wireBtn(nextBtn, ()=>{ overlayDone.hidden=true; startNewRound(); render(); });

// tap overlay background to close
overlayDone.addEventListener("click", (e)=>{ if (e.target===overlayDone) overlayDone.hidden=true; }, {passive:true});
overlayDone.addEventListener("touchend", (e)=>{ if (e.target===overlayDone){ e.preventDefault(); overlayDone.hidden=true; } }, {passive:false});

function startNewRound(){
  overlayDone.hidden = true;
  firstPick=null; secondPick=null; resolving=false;
  buildDeck();
}

function render(){
  const top = nav[nav.length-1];
  if (!top) return renderHome();
  if (top.screen==="category") return renderCategory();
  if (top.screen==="game") return renderGame();
  return renderHome();
}

// SW (network-first app files)
async function initSW(){
  if (!("serviceWorker" in navigator)) return;
  try{ await navigator.serviceWorker.register("sw.js"); }catch{}
}

(async function boot(){
  await initSW();
  const res = await fetch("content/sets.json", {cache:"no-store"});
  library = await res.json();
  renderHome();
})();
