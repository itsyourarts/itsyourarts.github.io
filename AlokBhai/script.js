// stars
  const sf=document.getElementById('stars');
  for(let i=0;i<90;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'vw';s.style.top=Math.random()*100+'vh';s.style.animationDelay=(Math.random()*3)+'s';sf.appendChild(s);}

  const colors=['#ff2fd0','#00f0ff','#8a2be2','#ffd60a','#00ff9d','#ffffff'];
  function makeConfetti(n){
    for(let i=0;i<n;i++){
      const c=document.createElement('div');c.className='confetti';
      c.style.left=Math.random()*100+'vw';
      c.style.background=colors[Math.floor(Math.random()*colors.length)];
      c.style.animationDuration=(2+Math.random()*3)+'s';
      c.style.animationDelay=(Math.random()*.6)+'s';
      c.style.borderRadius=Math.random()>.5?'50%':'2px';
      document.body.appendChild(c);
      setTimeout(()=>c.remove(),6000);
    }
  }
  /* ---------- Birthday song (external MP3) ---------- */
  const song=document.getElementById('song');
  song.volume=1.0;

  function startSong(){
    try{
      if(song.paused){
        const p=song.play();
        if(p && p.catch) p.catch(()=>{});
      }
    }catch(e){}
  }

  function party(){
    makeConfetti(130);
    startSong();                  // 🎵 MP3 song on click
  }

  // Play on click/tap ANYWHERE on the page (debounced so touch+click don't double-fire)
  let lastTrigger=0;
  function celebrateAnywhere(){
    const now=Date.now();
    if(now-lastTrigger<400) return;   // ignore rapid duplicate events
    lastTrigger=now;
    party();
  }
  document.addEventListener('click', celebrateAnywhere);
  document.addEventListener('touchend', celebrateAnywhere, {passive:true});

  window.addEventListener('load',()=>makeConfetti(130));   // confetti on load (song waits for tap)
  setInterval(()=>makeConfetti(25),2600);
