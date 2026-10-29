/* ===== Gallery lightbox (gallery.html) ===== */
let currentImageIndex = 0;
const images = document.querySelectorAll('.thumbnail');
function openLightbox(index) {
  if (typeof index === 'number') currentImageIndex = index;
  document.getElementById('lightbox').style.display = 'block';
  showImage(currentImageIndex);
}
function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }
function showImage(index) {
  currentImageIndex = index;
  document.getElementById('lightboxImage').src = images[currentImageIndex].src;
}
function changeImage(direction) {
  currentImageIndex += direction;
  if (currentImageIndex < 0) currentImageIndex = images.length - 1;
  else if (currentImageIndex >= images.length) currentImageIndex = 0;
  showImage(currentImageIndex);
}
images.forEach((img, index) => img.addEventListener('click', () => openLightbox(index)));
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.style.display !== 'block') return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') changeImage(-1);
  if (e.key === 'ArrowRight') changeImage(1);
});

/* ===== Powerpuff extras: theme toggle, music, sparkles, reveal, card flip ===== */
(function () {
  const root = document.documentElement;
  const st = document.createElement('style');
  st.textContent = '.fab{position:fixed;bottom:20px;width:54px!important;height:54px;border-radius:50%!important;border:3px solid #1d1b2b!important;background:#ff5fa8;font-size:24px!important;cursor:pointer;z-index:3000;box-shadow:3px 3px 0 #1d1b2b;padding:0!important;margin:0!important;transition:transform .2s,background .3s;color:#fff;line-height:1}.fab:hover{transform:scale(1.15) rotate(8deg);background:#4db8ff}.fab.on{animation:wob 1s ease-in-out infinite}@keyframes wob{50%{transform:scale(1.1) rotate(-8deg)}}.spark{position:fixed;pointer-events:none;z-index:4000;font-size:22px;animation:sp .9s ease-out forwards}@keyframes sp{to{transform:translate(var(--dx),var(--dy)) scale(.3) rotate(200deg);opacity:0}}';
  document.head.appendChild(st);

  // Theme
  const setTheme = t => { root.setAttribute('data-theme', t); try { localStorage.setItem('ppgTheme', t); } catch (e) {} tb.textContent = t === 'dark' ? '☀️' : '🌙'; };
  const tb = document.createElement('button');
  tb.className = 'fab'; tb.id = 'themeBtn'; tb.type = 'button'; tb.title = 'Light / Dark mode'; tb.style.right = '84px';
  tb.onclick = () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  document.body.appendChild(tb);
  let saved = null; try { saved = localStorage.getItem('ppgTheme'); } catch (e) {}
  setTheme(saved || 'light');

  // Music (synthesized, upbeat hero-theme style loop)
  const M = [76,76,79,76,72,74,76,0, 74,74,77,74,71,72,74,0, 72,76,79,84,83,79,81,79, 77,81,79,76,74,76,72,0];
  const B = [48,55,48,55, 43,50,43,50, 48,55,53,57, 53,57,43,50];
  let ctx, playing = false, timer, step = 0, nextT = 0;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function note(m, t, d, type, v) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = hz(m);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01);
    g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + .05);
  }
  function sched() {
    while (nextT < ctx.currentTime + .4) {
      const s = step % 32;
      if (M[s]) note(M[s], nextT, .17, 'square', .05);
      if (s % 2 === 0) note(B[s / 2], nextT, .32, 'triangle', .13);
      nextT += .2; step++;
    }
  }
  function startMusic() {
    if (playing) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    nextT = ctx.currentTime + .1; playing = true;
    timer = setInterval(sched, 100);
    mb.textContent = '🔊'; mb.classList.add('on');
    try { localStorage.setItem('ppgMusic', 'on'); } catch (e) {}
  }
  function stopMusic() {
    playing = false; clearInterval(timer);
    mb.textContent = '🔇'; mb.classList.remove('on');
    try { localStorage.setItem('ppgMusic', 'off'); } catch (e) {}
  }
  const mb = document.createElement('button');
  mb.className = 'fab'; mb.id = 'musicBtn'; mb.type = 'button'; mb.title = 'Music on / off'; mb.style.right = '20px'; mb.textContent = '🔇';
  mb.onclick = () => (playing ? stopMusic() : startMusic());
  document.body.appendChild(mb);
  let pref = null; try { pref = localStorage.getItem('ppgMusic'); } catch (e) {}
  if (pref === 'on') { // browsers need a click first, so resume on the first interaction
    const resume = e => { if (e.target.closest && e.target.closest('#musicBtn')) return; startMusic(); document.removeEventListener('pointerdown', resume, true); document.removeEventListener('keydown', resume, true); };
    document.addEventListener('pointerdown', resume, true); document.addEventListener('keydown', resume, true);
  }

  // Sparkle burst on click
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    const em = ['⭐', '💖', '⚡', '✨', '💥'];
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('span'); s.className = 'spark';
      s.textContent = em[Math.floor(Math.random() * em.length)];
      const a = Math.random() * 6.28, r = 40 + Math.random() * 60;
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', Math.cos(a) * r + 'px'); s.style.setProperty('--dy', Math.sin(a) * r + 'px');
      document.body.appendChild(s); setTimeout(() => s.remove(), 950);
    }
  });

  // Flip fun-fact cards on tap (mobile friendly)
  document.querySelectorAll('.funfact-card').forEach(c => c.addEventListener('click', () => c.classList.toggle('flipped')));

  // Smooth reveal on scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); } }), { threshold: .12 });
    document.querySelectorAll('#drop,#gallery,.container,.gallery-item').forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }
})();
