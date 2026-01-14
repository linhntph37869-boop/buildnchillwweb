import { useEffect } from 'react';

const TetEffect = () => {
  useEffect(() => {
    // 1. Setup Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'winter-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0', left: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '9999'
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const snowflakes = [];

    // --- 2. TUYẾT RƠI ---
    class Snowflake {
      constructor() { this.reset(); this.y = Math.random() * canvas.height; }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 4 + 2;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.velX = (Math.random() - 0.5) * 0.5;
        this.sway = Math.random() * Math.PI * 2;
      }
      update() {
        this.y += this.speed;
        this.x += Math.sin(this.sway) * 0.3 + this.velX;
        this.sway += 0.01;
        if (this.y > canvas.height + 20) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // --- 3. LOOP ---
    for(let i=0; i<150; i++) snowflakes.push(new Snowflake());

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      snowflakes.forEach(s => { s.update(); s.draw(); });
      requestAnimationFrame(loop);
    }
    loop();

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); canvas.remove(); };
  }, []);

  return null;
};

export default TetEffect;
