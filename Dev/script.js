const quotes = [
  'Om Namah Shivaya — consciousness beyond storm and silence.',
  'त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।',
  'महादेवः शरणं मम।',
  'नमः शिवाय शान्ताय रुद्राय परमात्मने।',
  'From silence rises Rudra; from Rudra rises transformation.',
  'Hara Hara Mahadev — fear dissolves, faith remains.',
  'Trinetra burns illusion and reveals truth.',
  'Rudra protects dharma through divine fire.'
];

const heroQuote = document.getElementById('heroQuote');
const mainQuote = document.getElementById('mainQuote');
const autoType = document.getElementById('autoType');

// Uploaded MP3 was trimmed by the first 6 seconds and split into exact MP3-frame chunks.
// No re-encoding, normalization, or audio effects were applied.
const stormChunks = [
  'assets/user-thunder-chunk-1.mp3?v=1',
  'assets/user-thunder-chunk-2.mp3?v=1',
  'assets/user-thunder-chunk-3.mp3?v=1',
  'assets/user-thunder-chunk-4.mp3?v=1',
  'assets/user-thunder-chunk-5.mp3?v=1',
  'assets/user-thunder-chunk-6.mp3?v=1'
];

const stormAudio = new Audio();
stormAudio.preload = 'auto';
stormAudio.volume = 1;
let currentChunk = 0;
let audioStarted = false;
let quoteIndex = 0;

function setQuote(next = quoteIndex + 1){
  quoteIndex = (next + quotes.length) % quotes.length;
  heroQuote.style.opacity = '0';
  mainQuote.style.opacity = '0';
  setTimeout(() => {
    heroQuote.textContent = '“' + quotes[quoteIndex] + '”';
    mainQuote.textContent = quotes[quoteIndex];
    heroQuote.style.opacity = '1';
    mainQuote.style.opacity = '1';
  }, 170);
}
setInterval(() => setQuote(), 4700);

const typeText = 'Om Namah Shivaya • Rudra';
let typeIndex = 0;
let typeDeleting = false;

function runAutoType(){
  if(!autoType) return;
  autoType.textContent = typeText.slice(0, typeIndex);

  if(!typeDeleting && typeIndex < typeText.length){
    typeIndex++;
    setTimeout(runAutoType, 135);
    return;
  }

  if(!typeDeleting && typeIndex === typeText.length){
    typeDeleting = true;
    setTimeout(runAutoType, 1500);
    return;
  }

  if(typeDeleting && typeIndex > 0){
    typeIndex--;
    setTimeout(runAutoType, 95);
    return;
  }

  typeDeleting = false;
  setTimeout(runAutoType, 135);
}
runAutoType();

function playChunk(index){
  currentChunk = index % stormChunks.length;
  stormAudio.src = stormChunks[currentChunk];
  stormAudio.currentTime = 0;
  const playPromise = stormAudio.play();
  if(playPromise && typeof playPromise.catch === 'function'){
    playPromise.catch(() => {
      audioStarted = false;
    });
  }
}

stormAudio.addEventListener('ended', () => {
  playChunk(currentChunk + 1);
});

function startStormAudio(){
  if(!audioStarted){
    audioStarted = true;
    playChunk(0);
    return;
  }
  if(stormAudio.paused){
    const playPromise = stormAudio.play();
    if(playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
  }
}

function restartGif(){
  const bg = document.querySelector('.storm-gif-bg');
  if(!bg) return;
  bg.style.backgroundImage = 'none';
  requestAnimationFrame(() => {
    bg.style.backgroundImage = `url("assets/black-thunder-clear.gif?t=${Date.now()}")`;
  });
}

function stormBoost(){
  startStormAudio();
  restartGif();
  document.body.classList.add('rudra', 'shake');
  setTimeout(() => document.body.classList.remove('shake'), 420);
  setTimeout(() => document.body.classList.remove('rudra'), 2400);
}

// Browser audio policy: uploaded MP3 chunks start on the first click/tap.
document.addEventListener('click', startStormAudio, { passive: true });

// If the browser pauses audio for any reason, the interval attempts to resume playback.
setInterval(() => {
  if(audioStarted && stormAudio.paused){
    const playPromise = stormAudio.play();
    if(playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
  }
}, 3000);

document.getElementById('newQuote').addEventListener('click', () => {
  setQuote();
  stormBoost();
});

document.getElementById('copyQuote').addEventListener('click', async (e) => {
  try{
    await navigator.clipboard.writeText(mainQuote.textContent);
    e.currentTarget.textContent = 'Copied ✓';
    setTimeout(() => e.currentTarget.textContent = 'Copy', 1200);
  }catch{
    e.currentTarget.textContent = 'Copy failed';
    setTimeout(() => e.currentTarget.textContent = 'Copy', 1200);
  }
});

document.getElementById('rudraMode').addEventListener('click', stormBoost);
document.getElementById('quickStorm').addEventListener('click', stormBoost);
document.getElementById('finalStorm').addEventListener('click', stormBoost);

let mantra = 0;
const countEl = document.getElementById('mantraCount');
const terminal = document.getElementById('terminalText');
document.getElementById('mantraBtn').addEventListener('click', () => {
  mantra++;
  countEl.textContent = mantra;
  terminal.textContent += `\n[${String(mantra).padStart(3,'0')}] Om Namah Shivaya — mantra +1`;
  terminal.scrollTop = terminal.scrollHeight;
  if(mantra % 11 === 0) stormBoost();
});

const tiltCard = document.getElementById('tiltCard');
async function toggleFullPageView(){
  startStormAudio();

  try{
    if(!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
    }else{
      await document.exitFullscreen();
    }
  }catch{
    // If iframe/browser fullscreen is blocked, apply a fallback full-page class.
    document.body.classList.toggle('page-full-mode');
  }
}

tiltCard.addEventListener('click', toggleFullPageView);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('visible');
  });
},{ threshold:.14 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
