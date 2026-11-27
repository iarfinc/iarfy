(() => {
  // nav: shadow on scroll + mobile toggle
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav-toggle');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), { passive: true });
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // staggered reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 5) * 0.09}s`);
    io.observe(el);
  });

  // gallery filter
  const items = document.querySelectorAll('.g-item');
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filters .active').classList.remove('active');
      btn.classList.add('active');
      const f = btn.dataset.filter;
      items.forEach(it => it.classList.toggle('hide', f !== 'all' && it.dataset.cat !== f));
    });
  });

  // lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('p');
  items.forEach(it => {
    it.tabIndex = 0;
    const open = () => {
      const img = it.querySelector('img');
      lbImg.src = img.src; lbImg.alt = img.alt;
      lbCap.textContent = it.querySelector('figcaption').innerText.replace('\n', ' · ');
      lb.showModal();
    };
    it.addEventListener('click', open);
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  // subtle parallax on hero portrait
  const portrait = document.querySelector('.hero-portrait');
  if (portrait && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - 0.5) * 18;
      const y = (e.clientY / innerHeight - 0.5) * 18;
      portrait.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
