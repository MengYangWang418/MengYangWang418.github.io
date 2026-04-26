/* =============================================================
   MYWang & ZBYin — counter, smooth nav, reveal-on-scroll
   ============================================================= */

(() => {
  const START_DATE = new Date('2023-07-26T00:00:00+08:00');

  /* ---------- Day counter (animated count-up) ---------- */
  const daysEl  = document.getElementById('days');
  const detail  = document.getElementById('time-detail');

  const computeDays = () => {
    const now  = new Date();
    const diff = now - START_DATE;
    const days = Math.floor(diff / 86400000);

    const totalHours   = Math.floor(diff / 3600000);
    const totalMinutes = Math.floor(diff / 60000);
    return { days, hours: totalHours, minutes: totalMinutes };
  };

  const animateCount = (el, target, duration = 1800) => {
    const start = performance.now();
    const ease  = (t) => 1 - Math.pow(1 - t, 3);
    const step  = (now) => {
      const p     = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * ease(p));
      el.textContent = value.toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en-US');
    };
    requestAnimationFrame(step);
  };

  const refreshCounter = () => {
    const { days, hours, minutes } = computeDays();
    animateCount(daysEl, days);
    if (detail) {
      detail.textContent =
        `合 ${hours.toLocaleString('en-US')} 小时 · ${minutes.toLocaleString('en-US')} 分钟，未完待续`;
    }
  };

  refreshCounter();
  // refresh every minute so the detail line stays accurate
  setInterval(() => {
    const { hours, minutes } = computeDays();
    if (detail) {
      detail.textContent =
        `合 ${hours.toLocaleString('en-US')} 小时 · ${minutes.toLocaleString('en-US')} 分钟，未完待续`;
    }
  }, 60_000);


  /* ---------- Smooth scroll between snap pages ---------- */
  const container = document.querySelector('.snap-container');
  const pages     = Array.from(document.querySelectorAll('.page'));
  const dots      = Array.from(document.querySelectorAll('.dot'));

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id     = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    });
  });


  /* ---------- Active dot + floating "next station" pill ---------- */
  const LIGHT_PAGES = new Set([
    'gallery', 'greatwall', 'universal', 'gugong', 'chengde', 'disney',
    'nanyang', 'jixi', 'cat',
  ]);

  // Each page → { href, label }. Last entry loops back to hero.
  const NEXT_STATION = {
    hero:        { href: '#gallery',     label: '下一站 · 798 艺术馆',     up: false },
    gallery:     { href: '#qinhuangdao', label: '下一站 · 秦皇岛',         up: false },
    qinhuangdao: { href: '#greatwall',   label: '下一站 · 长城',           up: false },
    greatwall:   { href: '#universal',   label: '下一站 · 北京环球影城',   up: false },
    universal:   { href: '#gugong',      label: '下一站 · 故宫',           up: false },
    gugong:      { href: '#chengde',     label: '下一站 · 承德',           up: false },
    chengde:     { href: '#shenzhen',    label: '下一站 · 深圳环海',       up: false },
    shenzhen:    { href: '#laojiu',      label: '下一站 · 老舅演唱会',     up: false },
    laojiu:      { href: '#disney',      label: '下一站 · 上海迪士尼',     up: false },
    disney:      { href: '#xusong',      label: '下一站 · 许嵩 · 呼吸之野', up: false },
    xusong:      { href: '#nanyang',     label: '下一站 · 你的老家南阳',   up: false },
    nanyang:     { href: '#jixi',        label: '下一站 · 我的老家鸡西',   up: false },
    jixi:        { href: '#cat',         label: '下一站 · 我们的小家伙',   up: false },
    cat:         { href: '#hero',        label: '未完待续 · 回到我们的开始', up: true  },
  };

  const nextPill   = document.getElementById('next-pill');
  const pillText   = nextPill && nextPill.querySelector('.next-pill-text');
  const pillArrow  = nextPill && nextPill.querySelector('.next-pill-arrow');
  const musicBtn   = document.getElementById('music-toggle');

  const setActive = (id) => {
    const isLight = LIGHT_PAGES.has(id);
    dots.forEach((d) => {
      const match = d.dataset.target === id;
      d.classList.toggle('active', match);
      d.classList.toggle('on-dark', isLight);
    });

    if (nextPill) {
      const cfg = NEXT_STATION[id];
      if (cfg) {
        nextPill.href            = cfg.href;
        pillText.textContent     = cfg.label;
        pillArrow.textContent    = cfg.up ? '↑' : '↓';
        nextPill.classList.toggle('is-up',     cfg.up);
        nextPill.classList.toggle('on-light',  isLight);
        // hide on hero — the hero already has its own scroll-down arrow
        nextPill.classList.toggle('is-visible', id !== 'hero');
      }
    }

    if (musicBtn) musicBtn.classList.toggle('on-light', isLight);

    // Cat slideshow: start on enter, stop on leave (defined further below)
    if (typeof onPageChange === 'function') onPageChange(id);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
          setActive(entry.target.id);
        }
      });
    },
    { root: container, threshold: [0.55, 0.9] }
  );
  pages.forEach((p) => io.observe(p));


  /* ---------- Reveal cards on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealIO  = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { root: container, threshold: 0.18 }
  );
  revealEls.forEach((el) => revealIO.observe(el));


  /* ---------- Wheel / key shortcuts (more "silky") ---------- */
  let scrollLock = false;
  const goTo = (idx) => {
    if (idx < 0 || idx >= pages.length) return;
    scrollLock = true;
    container.scrollTo({ top: pages[idx].offsetTop, behavior: 'smooth' });
    setTimeout(() => (scrollLock = false), 900);
  };

  const currentIndex = () => {
    const top = container.scrollTop;
    return pages.findIndex(
      (p) => Math.abs(p.offsetTop - top) < window.innerHeight / 2
    );
  };

  // arrow / page keys
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      goTo(currentIndex() + 1);
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      goTo(currentIndex() - 1);
    }
  });


  /* ---------- Cat page : auto slideshow + confetti finale ---------- */
  const catPage     = document.getElementById('cat');
  const slides      = catPage ? catPage.querySelectorAll('.slide') : [];
  const confettiEl  = document.getElementById('confetti-layer');

  const SLIDE_MS    = 420;       // per-frame duration (quick)
  const CONFETTI_GLYPHS = ['❤', '💖', '✨', '⭐', '🌸', '🐾', '❄', '💕', '🌟'];
  const CONFETTI_COLORS = ['#ff6fa3', '#ff8fbf', '#ffb6c1', '#f4c062',
                            '#ffd166', '#9ad9ff', '#a78bfa', '#fff'];

  let slideTimer    = null;
  let confettiTimer = null;
  let slideshowDone = false;

  const resetSlideshow = () => {
    if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
    slides.forEach((s) => s.classList.remove('is-active'));
    catPage && catPage.classList.remove('is-finale');
    slideshowDone = false;
  };

  const stopConfetti = () => {
    if (confettiTimer) { clearInterval(confettiTimer); confettiTimer = null; }
    if (confettiEl) confettiEl.innerHTML = '';
  };

  const spawnConfettiParticle = () => {
    if (!confettiEl) return;
    const el = document.createElement('span');
    el.className = 'confetti-particle';

    const glyph = CONFETTI_GLYPHS[Math.floor(Math.random() * CONFETTI_GLYPHS.length)];
    el.textContent = glyph;

    // Use color only for non-emoji glyphs (the heart/snow chars below)
    if (glyph === '❤' || glyph === '❄') {
      el.style.color =
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    }

    const size      = 14 + Math.random() * 24;       // 14–38px
    const dur       = 5 + Math.random() * 6;         // 5–11s
    const swayDur   = 1.6 + Math.random() * 2.6;     // 1.6–4.2s
    const swayAmp   = 16 + Math.random() * 38;       // 16–54px
    const startLeft = Math.random() * 100;           // 0–100% across width
    const delay     = Math.random() * 0.6;

    el.style.left          = startLeft + '%';
    el.style.fontSize      = size + 'px';
    el.style.setProperty('--dur',      dur + 's');
    el.style.setProperty('--sway-dur', swayDur + 's');
    el.style.setProperty('--sway-amp', swayAmp + 'px');
    el.style.animationDelay = delay + 's, ' + (delay * -0.5) + 's';

    confettiEl.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay) * 1000 + 200);
  };

  const startConfetti = () => {
    if (!confettiEl || confettiTimer) return;
    // burst at the start
    for (let i = 0; i < 28; i++) {
      setTimeout(spawnConfettiParticle, i * 40);
    }
    // continuous gentle rain
    confettiTimer = setInterval(spawnConfettiParticle, 180);
  };

  const startSlideshow = () => {
    if (!catPage || slides.length === 0) return;
    resetSlideshow();
    stopConfetti();

    let i = 0;
    slides[0].classList.add('is-active');

    slideTimer = setInterval(() => {
      slides[i].classList.remove('is-active');
      i++;
      if (i >= slides.length - 1) {
        // landed on the final frame
        clearInterval(slideTimer);
        slideTimer = null;
        slides[slides.length - 1].classList.add('is-active');
        slideshowDone = true;
        // small delay then trigger finale text + confetti
        setTimeout(() => {
          catPage.classList.add('is-finale');
          startConfetti();
        }, 350);
        return;
      }
      slides[i].classList.add('is-active');
    }, SLIDE_MS);
  };

  // hooked from setActive() above
  function onPageChange (id) {
    if (id === 'cat') {
      // restart the show every time the user scrolls onto this page
      startSlideshow();
    } else {
      // leaving the cat page — stop the show & particles to keep things light
      stopConfetti();
      if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
      if (catPage) catPage.classList.remove('is-finale');
    }
  }


  /* ---------- Background music control ----------
   * Strategy:
   *   1. The <audio> element is `autoplay muted` — every modern browser
   *      allows MUTED autoplay without a user gesture, so the track is
   *      already running silently the moment the page loads.
   *   2. On the user's first interaction (click / wheel / keydown /
   *      touch / pointer), we unmute and gently fade the volume up — so
   *      the music seamlessly comes in instead of popping.
   *   3. The ♫ button toggles audible / silent at any time, and we
   *      remember the choice in localStorage so we never force music on
   *      anyone who explicitly muted it.
   */
  const audio = document.getElementById('bgm');
  const STORAGE_KEY = 'mywang-zbyin-bgm';
  const TARGET_VOLUME = 0.45;

  if (audio && musicBtn) {
    audio.volume = 0;        // start at 0 so the unmute fade-in is smooth

    const isAudible = () => !audio.paused && !audio.muted && audio.volume > 0.02;

    const updateMusicUI = () => {
      const audible = isAudible();
      musicBtn.classList.toggle('is-playing', audible);
      musicBtn.classList.toggle('is-paused',  !audible);
      musicBtn.setAttribute(
        'aria-label',
        audible ? '暂停背景音乐' : '播放背景音乐'
      );
    };

    // Smooth volume fade — used when unmuting (in) and pausing (out)
    let fadeTimer = null;
    const fadeTo = (target, duration = 1200, onDone) => {
      if (fadeTimer) cancelAnimationFrame(fadeTimer);
      const start    = audio.volume;
      const startAt  = performance.now();
      const tick = (now) => {
        const t = Math.min((now - startAt) / duration, 1);
        audio.volume = start + (target - start) * t;
        if (t < 1) fadeTimer = requestAnimationFrame(tick);
        else { fadeTimer = null; if (onDone) onDone(); }
      };
      fadeTimer = requestAnimationFrame(tick);
    };

    const userPref = localStorage.getItem(STORAGE_KEY); // 'on' / 'off' / null

    // ----- Kick off muted autoplay (browser-allowed, no gesture needed) -----
    audio.muted = true;
    audio.play().catch(() => { /* even muted blocked? extremely rare */ });

    // ----- Unmute on first user gesture, unless user has muted before -----
    const events = ['click', 'keydown', 'wheel', 'touchstart', 'pointerdown'];
    const onFirstGesture = (e) => {
      events.forEach((ev) =>
        window.removeEventListener(ev, onFirstGesture, true)
      );
      // If the user's first action is clicking the music button itself,
      // let the button handler decide what to do.
      if (musicBtn.contains(e.target)) { updateMusicUI(); return; }
      if (userPref === 'off') { updateMusicUI(); return; }

      audio.muted = false;
      if (audio.paused) audio.play().catch(() => {});
      fadeTo(TARGET_VOLUME, 1400, updateMusicUI);
      localStorage.setItem(STORAGE_KEY, 'on');
    };
    if (userPref !== 'off') {
      events.forEach((ev) =>
        window.addEventListener(ev, onFirstGesture, true)
      );
    }

    // ----- Manual toggle via ♫ button -----
    musicBtn.addEventListener('click', () => {
      if (isAudible()) {
        // fade out → pause
        fadeTo(0, 600, () => { audio.pause(); updateMusicUI(); });
        localStorage.setItem(STORAGE_KEY, 'off');
      } else {
        // unmute, resume, fade in
        audio.muted = false;
        if (audio.paused) audio.play().catch(() => {});
        fadeTo(TARGET_VOLUME, 800, updateMusicUI);
        localStorage.setItem(STORAGE_KEY, 'on');
      }
    });

    audio.addEventListener('play',  updateMusicUI);
    audio.addEventListener('pause', updateMusicUI);

    // Hide the button if the audio source isn't playable
    audio.addEventListener('error', () => {
      console.info(
        '[bgm] no playable audio source — check that assets/music.m4a exists.'
      );
      musicBtn.style.display = 'none';
    });

    updateMusicUI();
  }
})();
