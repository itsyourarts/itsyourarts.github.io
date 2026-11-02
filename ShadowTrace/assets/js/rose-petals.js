/**
 * ShadowTrace — Fresh Blooming 3D Velvet Rose Petals Engine (Zero-Dependency 60fps Canvas)
 * Crisp vibrant crimson, scarlet, hot-rose & sakura-blush petals (zero muddy brown stops!)
 * with organic ruffled rose-petal geometry, dewy highlights, 3D front/back flip,
 * and natural aerodynamic pendulum-glide random falling physics.
 */

function buildPetalSprites() {
  const sprites = [];
  // Vibrant, fresh rose-petal palettes — ZERO dark brown/muddy stops!
  const palettes = [
    {
      // Fresh Blooming Velvet Scarlet Rose
      front: ['#fff2f6', '#ff5c8a', '#ff1654', '#d9043d', '#a3002c'],
      back: ['#fff6f9', '#ff85a8', '#ff3b72', '#e0114f', '#b8063a'],
      curl: 'rgba(255, 240, 246, 0.72)',
      vein: 'rgba(160, 0, 42, 0.18)'
    },
    {
      // Vibrant Romantic Hot-Rose Petal
      front: ['#fff5fa', '#ff7eb6', '#ff2a85', '#e00b68', '#ad054e'],
      back: ['#fff8fc', '#ff9ec7', '#ff4d9a', '#eb1c78', '#bd0b5a'],
      curl: 'rgba(255, 245, 250, 0.75)',
      vein: 'rgba(175, 8, 82, 0.16)'
    },
    {
      // Soft Dewy Blush-Sakura Rose Petal
      front: ['#ffffff', '#ffb8d6', '#ff6ea8', '#f22e7b', '#c71259'],
      back: ['#ffffff', '#ffcce2', '#ff8ab8', '#f74a8d', '#d41d66'],
      curl: 'rgba(255, 255, 255, 0.82)',
      vein: 'rgba(195, 24, 90, 0.14)'
    },
    {
      // Rich Ruby-Crimson Rose Petal
      front: ['#ffe8ef', '#ff4778', '#f00a47', '#c80036', '#940028'],
      back: ['#fff0f5', '#ff7096', '#f72860', '#d60b43', '#a6002e'],
      curl: 'rgba(255, 230, 240, 0.65)',
      vein: 'rgba(135, 0, 35, 0.20)'
    }
  ];

  const drawOrganicPetalPath = (ctx, variant) => {
    ctx.beginPath();
    if (variant === 0) {
      // Classic ruffled heart-lip rose petal, wide rounded top, tapered stem base
      ctx.moveTo(0, 44);
      ctx.bezierCurveTo(-19, 38, -44, 18, -42, -10);
      ctx.bezierCurveTo(-41, -30, -24, -44, -8, -41);
      ctx.bezierCurveTo(-3, -39, 2, -38, 7, -42);
      ctx.bezierCurveTo(23, -46, 42, -31, 43, -9);
      ctx.bezierCurveTo(44, 19, 19, 38, 0, 44);
    } else if (variant === 1) {
      // Asymmetric wind-cupped rose petal
      ctx.moveTo(-2, 44);
      ctx.bezierCurveTo(-22, 36, -46, 14, -40, -14);
      ctx.bezierCurveTo(-35, -34, -15, -45, 4, -42);
      ctx.bezierCurveTo(14, -40, 26, -38, 35, -26);
      ctx.bezierCurveTo(45, -12, 39, 18, 16, 36);
      ctx.bezierCurveTo(8, 41, 2, 43, -2, 44);
    } else if (variant === 2) {
      // Broad outer rose petal with soft ruffled crown
      ctx.moveTo(0, 43);
      ctx.bezierCurveTo(-24, 36, -47, 15, -45, -11);
      ctx.bezierCurveTo(-43, -29, -29, -42, -14, -42);
      ctx.bezierCurveTo(-6, -42, -2, -37, 4, -39);
      ctx.bezierCurveTo(12, -42, 27, -43, 38, -30);
      ctx.bezierCurveTo(47, -18, 45, 14, 22, 35);
      ctx.bezierCurveTo(12, 41, 5, 43, 0, 43);
    } else {
      // Graceful inner bud rose petal
      ctx.moveTo(0, 45);
      ctx.bezierCurveTo(-15, 36, -35, 16, -34, -12);
      ctx.bezierCurveTo(-33, -31, -18, -44, -3, -42);
      ctx.bezierCurveTo(3, -41, 9, -43, 18, -39);
      ctx.bezierCurveTo(32, -33, 36, -12, 31, 12);
      ctx.bezierCurveTo(26, 29, 12, 40, 0, 45);
    }
    ctx.closePath();
  };

  const renderSide = (pal, variant, isBack) => {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    ctx.translate(size / 2, size / 2);

    const stops = isBack ? pal.back : pal.front;

    ctx.save();
    drawOrganicPetalPath(ctx, variant);
    ctx.clip();

    // Silky vibrant 3D velvet gradient
    const grad = ctx.createRadialGradient(-12, -12, 4, 4, 8, 58);
    grad.addColorStop(0.0, stops[1]);
    grad.addColorStop(0.38, stops[2]);
    grad.addColorStop(0.78, stops[3]);
    grad.addColorStop(1.0, stops[4]);
    ctx.fillStyle = grad;
    ctx.fillRect(-64, -64, 128, 128);

    // Dewy cream-pink rose base highlight at stem tip
    const baseGlow = ctx.createRadialGradient(0, 43, 1, 0, 39, 22);
    baseGlow.addColorStop(0, stops[0]);
    baseGlow.addColorStop(0.55, 'rgba(255, 220, 234, 0.45)');
    baseGlow.addColorStop(1, 'rgba(255, 220, 234, 0)');
    ctx.fillStyle = baseGlow;
    ctx.fillRect(-32, 16, 64, 38);

    // Subtle botanical veins
    ctx.strokeStyle = pal.vein;
    ctx.lineWidth = 0.85;
    ctx.lineCap = 'round';
    const veinAngles = [-0.48, -0.24, 0, 0.24, 0.48];
    for (const ang of veinAngles) {
      ctx.beginPath();
      ctx.moveTo(0, 40);
      const midX = Math.sin(ang) * 24;
      const midY = 12 - Math.cos(ang) * 14;
      const endX = Math.sin(ang * 1.15) * 35;
      const endY = -28 + Math.abs(ang) * 14;
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
    }

    // Dewy 3D rolled-lip specular highlight
    const lipGrad = ctx.createLinearGradient(-36, -44, 26, -18);
    lipGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    lipGrad.addColorStop(0.48, pal.curl);
    lipGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = lipGrad;
    ctx.lineWidth = 4.4;
    drawOrganicPetalPath(ctx, variant);
    ctx.stroke();

    ctx.restore();
    return c;
  };

  for (let i = 0; i < palettes.length; i++) {
    sprites.push({
      front: renderSide(palettes[i], i % 4, false),
      back: renderSide(palettes[i], i % 4, true)
    });
  }

  return sprites;
}

let sharedSprites = null;
function getSprites() {
  if (!sharedSprites) {
    sharedSprites = buildPetalSprites();
  }
  return sharedSprites;
}

export function createRosePetalField(canvas, options = {}) {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const sprites = getSprites();

  const {
    density = 28,
    minSize = 15,
    maxSize = 32,
    speedScale = 1,
    autoStart = true,
    fixedViewport = true
  } = options;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let running = false;
  let rafId = 0;
  let lastTime = 0;
  let windTime = Math.random() * 100;
  let initialized = false;
  const petals = [];

  const measureAndResize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (fixedViewport) {
      width = Math.max(window.innerWidth, 300);
      height = Math.max(window.innerHeight, 300);
    } else {
      const host = canvas.parentElement || canvas;
      const w = host.clientWidth || host.offsetWidth || 460;
      const h = host.clientHeight || host.offsetHeight || 380;
      width = Math.max(w, 260);
      height = Math.max(h, 240);
    }
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const makePetal = (scatterAnywhere = false, isBurst = false) => {
    const depth = Math.random();
    const size = minSize + depth * (maxSize - minSize);
    const sprite = sprites[Math.floor(Math.random() * sprites.length)];

    return {
      sprite,
      size,
      depth,
      x: Math.random() * (width + 60) - 30,
      y: scatterAnywhere
        ? Math.random() * height
        : isBurst
          ? -12 - Math.random() * 75
          : -26 - Math.random() * (height * 0.35),
      baseVy: (32 + depth * 34 + Math.random() * 16) * speedScale * (isBurst ? 1.18 : 1),
      swingPhase: Math.random() * Math.PI * 2,
      swingSpeed: 1.05 + Math.random() * 1.35,
      glideAmp: 24 + Math.random() * 42,
      yaw: (Math.random() - 0.5) * Math.PI * 2,
      yawSpeed: (Math.random() - 0.5) * 0.85,
      pitch: Math.random() * Math.PI * 2,
      pitchSpeed: (0.85 + Math.random() * 1.45) * (Math.random() > 0.5 ? 1 : -1),
      roll: Math.random() * Math.PI * 2,
      rollSpeed: 0.7 + Math.random() * 1.15,
      opacity: 0.74 + depth * 0.24,
      burstOnce: isBurst,
      spawnDelay: isBurst ? Math.random() * 0.4 : Math.random() * 1.6
    };
  };

  const ensurePopulated = () => {
    measureAndResize();
    if (!initialized) {
      initialized = true;
      petals.length = 0;
      for (let i = 0; i < density; i++) {
        const p = makePetal(true, false);
        p.spawnDelay = 0;
        petals.push(p);
      }
    }
  };

  const step = (now) => {
    if (!running) return;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
    lastTime = now;
    windTime += dt;

    const ambientWind = Math.sin(windTime * 0.38) * 13 + Math.cos(windTime * 0.81) * 7;

    ctx.clearRect(0, 0, width, height);

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      if (p.spawnDelay > 0) {
        p.spawnDelay -= dt;
        continue;
      }

      p.swingPhase += p.swingSpeed * dt;
      p.pitch += p.pitchSpeed * dt;
      p.roll += p.rollSpeed * dt;
      p.yaw += p.yawSpeed * dt * 0.35;

      const vx = Math.sin(p.swingPhase) * p.glideAmp + ambientWind * (0.55 + p.depth * 0.6);
      const liftFactor = 0.68 + 0.44 * Math.abs(Math.cos(p.swingPhase));
      const vy = p.baseVy * liftFactor;

      p.x += vx * dt;
      p.y += vy * dt;

      if (p.x > width + 48) p.x = -38;
      else if (p.x < -48) p.x = width + 38;

      if (p.y > height + 42) {
        if (p.burstOnce) {
          petals.splice(i, 1);
          continue;
        }
        const fresh = makePetal(false, false);
        fresh.y = -24 - Math.random() * 65;
        fresh.spawnDelay = Math.random() * 1.3;
        petals[i] = fresh;
        continue;
      }

      const cosPitch = Math.cos(p.pitch);
      const scaleY = Math.max(Math.abs(cosPitch), 0.18);
      const scaleX = 0.78 + 0.22 * Math.sin(p.roll);
      const bankTilt = p.yaw + Math.sin(p.swingPhase) * 0.4;
      const img = cosPitch >= 0 ? p.sprite.front : p.sprite.back;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(bankTilt);
      ctx.scale(scaleX, scaleY);
      ctx.shadowColor = 'rgba(225, 29, 98, 0.28)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    rafId = requestAnimationFrame(step);
  };

  const start = () => {
    ensurePopulated();
    if (running) return;
    running = true;
    lastTime = 0;
    rafId = requestAnimationFrame(step);
  };

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  };

  const burst = (count = 14) => {
    ensurePopulated();
    for (let i = 0; i < count; i++) {
      petals.push(makePetal(false, true));
    }
  };

  const resize = () => {
    measureAndResize();
  };

  window.addEventListener('resize', resize, { passive: true });
  if (autoStart) start();

  return { start, stop, burst, resize };
}
