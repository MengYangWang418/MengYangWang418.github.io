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


  /* ---------- Active dot + dot color depending on page bg ---------- */
  const setActive = (id) => {
    dots.forEach((d) => {
      const match = d.dataset.target === id;
      d.classList.toggle('active', match);
      // dot color adapts to page background
      d.classList.toggle('on-dark', id === 'gallery');
    });
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
})();
