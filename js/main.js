(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- transisi halaman (fallback tanpa View Transitions) ---------- */
  const isJournalPage = document.body.classList.contains('journal');
  const arrive = sessionStorage.getItem('slide-in');
  if (arrive) {
    sessionStorage.removeItem('slide-in');
    document.documentElement.classList.add(arrive);
    setTimeout(() => document.documentElement.classList.remove(arrive), 700);
  }
  addEventListener('pageshow', e => {
    if (e.persisted) document.documentElement.classList.remove('slide-out-left', 'slide-out-right');
  });
  if (!window.CSSViewTransitionRule && !reduce) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      const forward = !isJournalPage; // beranda -> jurnal = maju
      document.documentElement.classList.add(forward ? 'slide-out-left' : 'slide-out-right');
      sessionStorage.setItem('slide-in', forward ? 'slide-in-right' : 'slide-in-left');
      setTimeout(() => (location.href = url.href), 420);
    });
  }

  // baris yang belum tersedia: jangan lompat ke atas, beri goyangan kecil
  document.querySelectorAll('.eq-row[aria-disabled="true"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      a.classList.remove('nope'); void a.offsetWidth; a.classList.add('nope');
    });
  });

  document.querySelectorAll('.year').forEach(y => (y.textContent = new Date().getFullYear()));

  /* ---------- reveal ---------- */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 6) * 0.07}s`);
    revealIO.observe(el);
  });

  /* ==========================================================
     HOME
     ========================================================== */
  const drift = document.querySelector('.drift');
  if (drift) {
    // ekspresi aljabar (serif miring) + huruf nama (mono), seperti coretan di papan
    const EXPR = ['x² + 2x + 1', '(a + b)²', 'ax + b = 0', '∑ xᵢ', '√x', 'f(x)', 'y = mx + c', 'A⁻¹', 'det(A)',
      'x ∈ ℝ', '∫ f dx', 'λ', 'π', '∞', 'Δx', 'n!', 'log₂ n', 'eⁱᵖ + 1 = 0', 'dy/dx', '∂f', 'θ', 'x̄', 'φ'];
    const LETTERS = 'iqbalarfy'.split('');
    const items = [];
    const n = innerWidth < 700 ? 16 : 30;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      const isLetter = i % 3 === 0;
      s.textContent = isLetter ? LETTERS[i % LETTERS.length] : EXPR[i % EXPR.length];
      if (isLetter) s.className = 'm';
      s.style.left = `${rand(-4, 94)}%`;
      s.style.top = `${rand(-2, 180)}vh`;
      s.style.setProperty('--fs', `${isLetter ? rand(60, 120) : rand(26, 70)}px`);
      s.style.setProperty('--rot', `${rand(-28, 28)}deg`);
      drift.appendChild(s);
      items.push({ el: s, speed: rand(0.05, 0.4) });
    }
    [['y', 8, 12, 160], ['b', 22, 86, 220], ['y', 64, 40, 140], ['b', 120, 6, 180]].forEach(([c, top, left, w]) => {
      const b = document.createElement('i');
      b.className = `bar ${c}`;
      b.style.cssText = `top:${top}vh;left:${left}%;width:${w}px`;
      drift.appendChild(b);
      items.push({ el: b, speed: 0.25, bar: true });
    });

    if (!reduce) {
      let mx = 0, my = 0, ticking = false;
      const update = () => {
        const y = scrollY;
        items.forEach(({ el, speed, bar }) => {
          const ty = -y * speed + my * speed * 30;
          const tx = mx * speed * 30;
          el.style.transform = bar
            ? `translate3d(${tx}px, ${ty}px, 0)`
            : `translate3d(${tx}px, ${ty}px, 0) rotate(${el.style.getPropertyValue('--rot')})`;
        });
        ticking = false;
      };
      const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      addEventListener('scroll', req, { passive: true });
      addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; req(); }, { passive: true });
      update();
    }
  }

  // kata menyala bertahap mengikuti scroll ("progressive")
  const words = document.querySelector('.words');
  if (words) {
    const frag = document.createDocumentFragment();
    words.childNodes.forEach(node => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) return frag.append(tok);
          const w = document.createElement('span');
          w.className = /^[+=−×]$/.test(tok) ? 'w op' : 'w';
          w.textContent = tok;
          frag.append(w);
        });
      } else {
        node.classList.add('w');
        frag.append(node.cloneNode(true));
      }
    });
    words.replaceChildren(frag);
    const ws = [...words.querySelectorAll('.w')];
    const lightUp = () => {
      const r = words.getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35));
      const k = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('lit', i < k));
    };
    if (reduce) ws.forEach(w => w.classList.add('lit'));
    else { addEventListener('scroll', lightUp, { passive: true }); lightUp(); }
  }

  // sistem persamaan "ditulis" baris demi baris
  const problem = document.querySelector('.problem');
  if (problem) {
    let t = 0;
    problem.querySelectorAll('.write').forEach((w, i) => {
      const n = Math.max(3, w.textContent.trim().length);
      const dur = Math.min(1.1, n * 0.045);
      w.style.setProperty('--n', n);
      w.style.setProperty('--wd', `${dur}s`);
      w.style.setProperty('--wdelay', `${t}s`);
      // kalimat pertama selesai, lalu kurung kurawal digambar dulu
      t += i === 0 ? dur + 0.9 : dur * 0.75;
    });
    problem.querySelector('.brace')?.style.setProperty('transition-delay', `${problem.querySelector('.write').style.getPropertyValue('--wd')}`);
    if (reduce) problem.classList.add('go');
    else {
      const pio = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { problem.classList.add('go'); pio.disconnect(); }
      }, { threshold: 0.35 });
      pio.observe(problem);
    }
  }

  // nama diketik saat terlihat, lalu nama lengkap ditulis dengan pensil
  const type = document.querySelector('.type');
  if (type) {
    const out = type.querySelector('.typed');
    const text = type.dataset.text;
    const pencil = document.querySelector('.pencil');
    const writePencil = () => {
      if (!pencil) return;
      const txt = pencil.querySelector('.pencil-text');
      const tool = pencil.querySelector('.pencil-tool');
      if (reduce) { txt.style.clipPath = 'none'; return; }
      // ditulis huruf demi huruf; pensil mengikuti ujung tulisan
      const steps = txt.textContent.length, dur = 2600;
      let start;
      const frame = now => {
        start ??= now;
        const p = Math.min(1, (now - start) / dur);
        const k = Math.floor(p * steps) / steps;
        txt.style.clipPath = `inset(-20% ${100 - k * 102}% -30% 0)`;
        tool.style.left = `${k * 100}%`;
        tool.style.opacity = 1;
        if (p < 1) requestAnimationFrame(frame);
        else setTimeout(() => tool.classList.add('lift'), 250);
      };
      requestAnimationFrame(frame);
    };
    if (reduce) { out.textContent = text; writePencil(); }
    else {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let i = 0;
        const t = setInterval(() => {
          out.textContent = text.slice(0, ++i);
          if (i >= text.length) { clearInterval(t); setTimeout(writePencil, 350); }
        }, 110);
      }, { threshold: 0.6 });
      io.observe(type);
    }
  }

  /* ==========================================================
     JURNAL
     ========================================================== */
  const themeBtn = document.querySelector('.theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const dark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('jurnal-theme', dark ? 'dark' : 'light');
    });
  }

  const sketches = document.querySelectorAll('.sketch');
  if (!sketches.length) return;

  const SHAPES = 'path,line,circle:not(.dot),ellipse,rect,polyline';
  const finish = svg => {
    svg.classList.add('labeled');
    svg.closest('.post')?.classList.add('seen');
  };

  if (reduce) { sketches.forEach(finish); return; }

  const stick = document.createElement('span');
  stick.className = 'chalk-stick';
  document.body.appendChild(stick);

  sketches.forEach(svg => {
    svg.querySelectorAll(SHAPES).forEach(el => {
      if (getComputedStyle(el).strokeDasharray !== 'none') {
        el.dataset.fade = '';
        el.style.opacity = 0;
        el.style.transition = 'opacity .5s';
        return;
      }
      const len = el.getTotalLength();
      el.style.setProperty('--len', len);
      el.dataset.len = len;
    });
  });

  const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const dust = (x, y, color) => {
    const d = document.createElement('i');
    d.className = 'chalk-dust';
    d.style.cssText = `left:${x}px;top:${y}px;background:${color};--dx:${rand(-10, 10)}px`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 950);
  };

  const drawEl = el => new Promise(resolve => {
    if (el.dataset.fade !== undefined) { el.style.opacity = ''; return setTimeout(resolve, 150); }
    const len = +el.dataset.len;
    const dur = Math.max(180, Math.min(700, len * 1.8));
    const color = getComputedStyle(el).stroke;
    stick.style.setProperty('--stick', color);
    let start, lastDust = 0;
    const step = now => {
      start ??= now;
      const p = Math.min(1, (now - start) / dur);
      const e = ease(p);
      el.style.strokeDashoffset = len * (1 - e);
      const pt = el.getPointAtLength(len * e).matrixTransform(el.getScreenCTM());
      stick.style.transform = `translate(${pt.x}px, ${pt.y}px) rotate(-38deg)`;
      if (now - lastDust > 80) { dust(pt.x, pt.y, color); lastDust = now; }
      p < 1 ? requestAnimationFrame(step) : resolve();
    };
    requestAnimationFrame(step);
  });

  const drawSketch = async svg => {
    stick.classList.add('on');
    for (const el of svg.querySelectorAll(SHAPES)) await drawEl(el);
    stick.classList.remove('on');
    finish(svg);
  };

  // satu batang kapur: gambar diantrikan berurutan
  let queue = Promise.resolve();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.closest('.post')?.classList.add('seen');
      queue = queue.then(() => drawSketch(e.target));
    });
  }, { threshold: 0.5 });
  sketches.forEach(s => io.observe(s));
})();
