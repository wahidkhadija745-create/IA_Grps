/* ═══════════════════════════════════════════
   MBI — Mouhcine & Brahim Intelligence
   Interactive JavaScript
═══════════════════════════════════════════ */

'use strict';

/* ── Helpers ── */
const qs  = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

/* ═══════════ 1. THEME TOGGLE ═══════════ */
(function initTheme() {
  const root   = document.documentElement;
  const btn    = qs('#themeToggle');
  const saved  = localStorage.getItem('mbi-theme') || 'light';
  root.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('mbi-theme', next);
    // re-init particles so color matches new theme
    initParticles();
  });
})();

/* ═══════════ 2. NAVBAR ═══════════ */
(function initNavbar() {
  const navbar   = qs('#navbar');
  const burger   = qs('#burger');
  const navLinks = qs('#navLinks');
  const links    = qsa('.nav-link');

  // Scroll → add "scrolled" class
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);

    // Active link based on section in view
    const sections = qsa('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger toggle
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close on link click
  navLinks.addEventListener('click', e => {
    if (e.target.classList.contains('nav-link')) {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });
})();

/* ═══════════ 3. PARTICLE CANVAS ═══════════ */
let particleAnimId = null;

function initParticles() {
  const canvas = qs('#particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  if (particleAnimId) cancelAnimationFrame(particleAnimId);

  // Resize canvas
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Particle config
  const COUNT     = Math.min(60, Math.floor(window.innerWidth / 22));
  const COLOR_A   = isDark ? 'rgba(59,130,246,' : 'rgba(59,130,246,';
  const COLOR_B   = isDark ? 'rgba(124,58,237,' : 'rgba(124,58,237,';
  const LINE_CLR  = isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)';
  const CONNECT   = 130;
  const mouse     = { x: -9999, y: -9999 };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  // Create particles
  const particles = Array.from({ length: COUNT }, () => ({
    x:   Math.random() * canvas.width,
    y:   Math.random() * canvas.height,
    vx:  (Math.random() - 0.5) * 0.4,
    vy:  (Math.random() - 0.5) * 0.4,
    r:   Math.random() * 2 + 1.2,
    hue: Math.random() > 0.5 ? 0 : 1, // 0=blue, 1=violet
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update & draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < 0)              p.x = canvas.width;
      if (p.x > canvas.width)   p.x = 0;
      if (p.y < 0)              p.y = canvas.height;
      if (p.y > canvas.height)  p.y = 0;

      // Mouse repel
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const force = (80 - dist) / 80;
        p.x += (dx / dist) * force * 2;
        p.y += (dy / dist) * force * 2;
      }

      // Draw particle
      const alpha = isDark ? 0.55 : 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 0
        ? COLOR_A + alpha + ')'
        : COLOR_B + alpha + ')';
      ctx.fill();
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT) {
          ctx.beginPath();
          ctx.strokeStyle = LINE_CLR;
          ctx.lineWidth   = (1 - dist / CONNECT) * 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particleAnimId = requestAnimationFrame(draw);
  }

  draw();
}

initParticles();

/* ═══════════ 4. SCROLL REVEAL ═══════════ */
(function initReveal() {
  const els = qsa('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay by index within parent
        const siblings = qsa('.reveal-up, .reveal-left, .reveal-right',
          entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        const delay = (idx % 4) * 0.1;
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ═══════════ 5. ANIMATED COUNTERS ═══════════ */
(function initCounters() {
  const nums = qsa('[data-target]');

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
})();

/* ═══════════ 6. TYPING SIMULATION IN CHAT ═══════════ */
(function initChatReply() {
  const typingMsg = qs('.chat-msg.typing');
  if (!typingMsg) return;

  const replies = [
    "It lives right here in our <strong>Google Colab notebook</strong> — fully documented, reproducible, and ready to run in the cloud.",
    "The notebook file <strong>projectmath.ipynb</strong> and custom <strong>train.zip</strong> dataset are both available in our project folder.",
  ];
  let replyIdx = 0;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      startTypingLoop();
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  observer.observe(typingMsg);

  function startTypingLoop() {
    setTimeout(() => typeReply(), 1200);
  }

  function typeReply() {
    const bubble = typingMsg.querySelector('.chat-bubble');
    // Show typing dots first
    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>`;

    setTimeout(() => {
      // Replace with actual text
      const text = replies[replyIdx % replies.length];
      bubble.innerHTML = text;
      typingMsg.classList.remove('typing');
      replyIdx++;

      // Reset after a pause
      setTimeout(() => {
        typingMsg.classList.add('typing');
        bubble.innerHTML = `
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>`;
        setTimeout(() => typeReply(), 1400);
      }, 5000);
    }, 1800);
  }
})();

/* ═══════════ 7. CONTACT FORM ═══════════ */
(function initForm() {
  const form    = qs('#contactForm');
  const success = qs('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    // Loading state
    btn.disabled = true;
    btn.innerHTML = `<span>Sending…</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="animation:spin 0.8s linear infinite">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="10"/>
      </svg>`;

    // Simulate send
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled  = false;
      form.reset();
      success.style.display = 'block';
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }, 1600);
  });
})();

/* ═══════════ 8. SMOOTH ANCHOR SCROLL ═══════════ */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id  = link.getAttribute('href').slice(1);
  const sec = document.getElementById(id);
  if (!sec) return;
  e.preventDefault();
  const offset = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72',
    10
  );
  window.scrollTo({ top: sec.offsetTop - offset, behavior: 'smooth' });
});

/* ═══════════ 9. SERVICE CARDS — TILT ═══════════ */
(function initTilt() {
  const cards = qsa('.service-card, .why-card, .about-card, .vp-item');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `
        perspective(600px)
        rotateX(${-dy * 4}deg)
        rotateY(${dx * 4}deg)
        translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();

/* ═══════════ 10. PARALLAX GLOWS ═══════════ */
(function initParallax() {
  const glows = qsa('.hero-glow');
  if (!glows.length) return;

  window.addEventListener('mousemove', e => {
    const xPct = (e.clientX / window.innerWidth  - 0.5) * 2;
    const yPct = (e.clientY / window.innerHeight - 0.5) * 2;

    glows.forEach((g, i) => {
      const strength = (i + 1) * 12;
      g.style.transform = `translate(${xPct * strength}px, ${yPct * strength}px)`;
    });
  }, { passive: true });
})();

/* ═══════════ 11. CSS SPIN KEYFRAME (for form loader) ═══════════ */
(function injectSpinStyle() {
  const style = document.createElement('style');
  style.textContent = `@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`;
  document.head.appendChild(style);
})();

/* ═══════════ 12. ORBIT DOTS — radial positioning ═══════════ */
(function positionOrbitDots() {
  const wrapper = qs('.hero-card-float');
  if (!wrapper) return;

  const dots  = qsa('.orbit-dot', wrapper);
  const radii = [150, 110, 150];
  const startAngles = [30, 200, 310];

  dots.forEach((dot, i) => {
    const rad = (startAngles[i] * Math.PI) / 180;
    const r   = radii[i];
    dot.style.left = `calc(50% + ${Math.cos(rad) * r}px - 5px)`;
    dot.style.top  = `calc(50% + ${Math.sin(rad) * r}px - 5px)`;
    dot.style.position = 'absolute';
  });
})();

/* ═══════════ 13. HERO TEXT GRADIENT ANIMATION ═══════════ */
(function animateHeroGradient() {
  const title = qs('.hero-title .gradient-text');
  if (!title) return;

  let angle = 135;
  setInterval(() => {
    angle = (angle + 0.3) % 360;
    title.style.background = `linear-gradient(${angle}deg, #3B82F6, #7C3AED, #06B6D4)`;
    title.style.webkitBackgroundClip = 'text';
    title.style.webkitTextFillColor  = 'transparent';
    title.style.backgroundClip       = 'text';
  }, 30);
})();

/* ═══════════ 14. PAGE LOAD ENTRANCE ═══════════ */
(function pageEntrance() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
})();

/* ═══════════ 15. CURSOR GLOW (desktop only) ═══════════ */
(function initCursorGlow() {
  if (window.innerWidth < 1024) return;

  const cursor = document.createElement('div');
  cursor.id = 'cursorGlow';
  cursor.style.cssText = `
    position:fixed; width:300px; height:300px;
    border-radius:50%; pointer-events:none; z-index:0;
    background:radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
    transform:translate(-50%,-50%); transition:opacity 0.3s;
    top: -150px; left: -150px;`;
  document.body.appendChild(cursor);

  let cx = -300, cy = -300;
  let tx = -300, ty = -300;

  window.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  function animCursor() {
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
})();
