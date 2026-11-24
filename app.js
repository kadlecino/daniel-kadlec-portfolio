(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = (n) => Math.round(n).toLocaleString('cs-CZ');

  /* ---------- count-up ---------- */
  const countUp = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const set = (v) => { el.textContent = pre + fmt(v) + suf; };
    if (reduce) return set(to);
    const dur = 1300, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      set(to * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------- automation data ---------- */
  const FLOWS = {
    sales: { cols: [['Online sales call', 'Telefonát (verze s GDPR)'], ['AI vyhodnocení'], ['Report manažerovi', 'Report CEO']] },
    hypo: { cols: [['Stovky hypotečních leadů'], ['Automatické rozdělení'], ['Poradce', 'Poradce', 'Desítky dalších']] },
    outreach: {
      cols: [['Google Maps', 'LinkedIn'], ['AI filtr podle ICP'], ['E-mail', 'SMS', 'WhatsApp'], ['Export do Instantly']],
      links: { 2: [[0, 0]] }
    },
    letters: { cols: [['Kontakty'], ['Make: personalizace'], ['Skloňování jmen'], ['Dopis na míru']] },
    reporting: { cols: [['Data z Meta Ads'], ['Automatizace'], ['Živý report', 'Vyhodnocení']] },
    crm: { cols: [['Klienti a zakázky'], ['Vlastní CRM'], ['Faktury', 'Slack notifikace']] }
  };
  const AUTO = [
    { step: 'AI agent', demo: 'agent', h: 'AI agent, který staví kampaň', text: ['Zadám úkol jednou větou. Agent připraví texty, grafiku i video a nahraje vše do Meta jako koncept.', 'Zveřejnění vždy potvrzuje člověk. Spusťte si ukázku.'], tags: ['Claude Code', 'Meta Ads přes MCP'] },
    { step: 'Sales Team Analyzer', demo: 'sales', h: 'Sales Team Analyzer', text: ['AI vyhodnotí každý sales call a pošle report manažerovi a CEO.', 'Existuje i verze pro klasické telefonáty. Tam jsme řešili GDPR.', 'Proklikejte si ukázku aplikace. Data jsou vzorová.'], tags: ['AI analýza hovorů', 'Automatický report'] },
    { step: 'Hypoteční leady', demo: 'leads', h: 'Rozdělování hypotečních leadů', text: ['Aplikace pro Hypo Partners. Plně automatizovaný systém pro stovky leadů a desítky poradců.', 'Vše na jednom místě, bez ruční práce. Pošlete si pár leadů.'], tags: ['Hypo Partners', 'Vlastní aplikace'] },
    { step: 'Outreach', demo: 'icp', h: 'Outreach pipeline', text: ['Kontakty z Google Maps a LinkedIn. AI je profiltruje podle ICP.', 'Pak jde oslovení e-mailem, SMS a přes WhatsApp. E-maily míří do Instantly.'], tags: ['AI filtr podle ICP', 'Instantly'] },
    { step: 'Dopisová kampaň', demo: 'letter', h: 'Dopisová kampaň v Make', text: ['Personalizované dopisy pro realitní makléře na nábor nemovitostí.', 'Systém správně skloňuje jména. Napište příjmení a uvidíte.'], tags: ['Make', 'Personalizace'] },
    { step: 'Reporting dat', flow: 'reporting', h: 'Data pro velkou kampaň', text: ['Reporting, automatizace a vyhodnocování dat pro kampaň s denním spendem 170 000 Kč.'], tags: ['Reporting', 'Vyhodnocování dat'] },
    { step: 'CRM a fakturace', flow: 'crm', h: 'Vlastní CRM, fakturace a Slack', text: ['Klienti, zakázky a faktury na jednom místě. Důležité události přijdou jako Slack notifikace.'], tags: ['Vlastní CRM', 'Slack'] }
  ];

  const svgNS = 'http://www.w3.org/2000/svg';
  let flowId = 0;
  const buildFlow = (key) => {
    const { cols, links = {} } = FLOWS[key];
    const NH = 46, VG = 18, CG = 64, CW = 7.9, PAD = 30;
    const widths = cols.map((c) => Math.max(...c.map((t) => t.length * CW + PAD), 120));
    const W = widths.reduce((a, b) => a + b, 0) + CG * (cols.length - 1);
    const maxN = Math.max(...cols.map((c) => c.length));
    const H = maxN * NH + (maxN - 1) * VG + 20;
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', cols.map((c) => c.join(', ')).join(' → '));
    const pos = [];
    let x = 0;
    cols.forEach((c, ci) => {
      const h = c.length * NH + (c.length - 1) * VG, y0 = (H - h) / 2;
      pos.push(c.map((_, ni) => ({ x, y: y0 + ni * (NH + VG), w: widths[ci] })));
      x += widths[ci] + CG;
    });
    const edges = document.createElementNS(svgNS, 'g');
    const nodes = document.createElementNS(svgNS, 'g');
    svg.append(edges, nodes);
    let k = 0;
    for (let ci = 0; ci < cols.length - 1; ci++) {
      const pairs = links[ci] || pos[ci].flatMap((_, a) => pos[ci + 1].map((__, b) => [a, b]));
      pairs.forEach(([a, b]) => {
        const s = pos[ci][a], t = pos[ci + 1][b];
        const x1 = s.x + s.w, y1 = s.y + NH / 2, x2 = t.x, y2 = t.y + NH / 2, mx = (x1 + x2) / 2;
        const id = `fl${flowId}-${k}`;
        const p = document.createElementNS(svgNS, 'path');
        p.setAttribute('d', `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`);
        p.setAttribute('class', 'edge');
        p.id = id;
        edges.append(p);
        if (!reduce) {
          const dot = document.createElementNS(svgNS, 'circle');
          dot.setAttribute('r', '4.5');
          dot.setAttribute('class', 'pulse');
          const am = document.createElementNS(svgNS, 'animateMotion');
          am.setAttribute('dur', '2.4s');
          am.setAttribute('repeatCount', 'indefinite');
          am.setAttribute('begin', `${(ci * 0.8 + k * 0.23) % 2.4}s`);
          const mp = document.createElementNS(svgNS, 'mpath');
          mp.setAttribute('href', '#' + id);
          am.append(mp);
          dot.append(am);
          edges.append(dot);
        }
        k++;
      });
    }
    cols.forEach((c, ci) => c.forEach((label, ni) => {
      const { x, y, w } = pos[ci][ni];
      const g = document.createElementNS(svgNS, 'g');
      const kind = ci === 0 ? 'start' : ci === cols.length - 1 ? 'end' : 'mid';
      g.setAttribute('class', `node node--${kind}`);
      g.style.setProperty('--c', ci);
      const r = document.createElementNS(svgNS, 'rect');
      Object.entries({ x, y, width: w, height: NH, rx: 12 }).forEach(([a, v]) => r.setAttribute(a, v));
      const t = document.createElementNS(svgNS, 'text');
      Object.entries({ x: x + w / 2, y: y + NH / 2 + 5, 'text-anchor': 'middle' }).forEach(([a, v]) => t.setAttribute(a, v));
      t.textContent = label;
      g.append(r, t);
      nodes.append(g);
    }));
    flowId++;
    return svg;
  };

  // automation slides
  const autoBox = $('[data-auto-slides]');
  AUTO.forEach((a) => {
    const art = document.createElement('article');
    art.className = 'slide';
    art.dataset.step = a.step;
    art.innerHTML = `<div class="s-grid ${a.demo ? 's-grid--demo' : 's-grid--stack'}">
      <div class="s-text"><h3 class="s-h">${a.h}</h3>${a.text.map((t) => `<p class="s-lead">${t}</p>`).join('')}
      <ul class="auto-meta" role="list">${a.tags.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      <div class="s-vis">${a.demo ? `<div class="demo" data-demo="${a.demo}"></div>` : `<div class="flow" data-flow="${a.flow}"></div>`}</div></div>`;
    autoBox.append(art);
  });

  const renderFlow = (box, key) => {
    box.textContent = '';
    box.append(buildFlow(key));
  };
  $$('[data-flow-static]').forEach((b) => renderFlow(b, b.dataset.flowStatic));

  /* ---------- funnel ---------- */
  const FUNNEL = {
    vsl: { steps: ['Reklama', 'Stránka s videem', 'Poptávka z webu'], desc: 'Reklama vede na stránku s videem. Video ukáže, jak práce probíhá. Poptávku pak posílá člověk, který už ví, co chce.' },
    form: { steps: ['Reklama', 'Formulář v aplikaci', 'Poptávka'], desc: 'Formulář se otevře přímo v reklamě. Poptávka je rychlá a levná, ale člověk o firmě zatím ví méně.' }
  };
  const funnel = $('[data-funnel]');
  const renderFunnel = (src) => {
    const d = FUNNEL[src], box = $('[data-path]', funnel);
    funnel.dataset.src = src;
    box.innerHTML = d.steps.map((t, i) => `<li style="--i:${i}">${t}</li>`).join('');
    $('[data-desc]', funnel).textContent = d.desc;
    $$('.seg__btn', funnel).forEach((b) => {
      const on = b.dataset.src === src;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
  };
  $$('.seg__btn', funnel).forEach((b) => b.addEventListener('click', () => renderFunnel(b.dataset.src)));
  renderFunnel('vsl');

  /* ---------- chips filter ---------- */
  $$('[data-filter]').forEach((group) => {
    const list = $(`[data-ads="${group.dataset.filter}"]`);
    $$('.chip', group).forEach((c) => c.addEventListener('click', () => {
      $$('.chip', group).forEach((x) => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', x === c); });
      const f = c.dataset.f;
      $$('li', list).forEach((li) => li.classList.toggle('is-dim', f !== 'all' && !li.dataset.tags.split(' ').includes(f)));
    }));
  });

  /* ---------- lightbox ---------- */
  const lb = $('[data-lightbox]'), lbImg = $('[data-lb-img]', lb);
  let lbSet = [], lbI = 0;
  const lbShow = (i) => {
    lbI = (i + lbSet.length) % lbSet.length;
    const img = $('img', lbSet[lbI]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
  };
  $$('[data-ads]').forEach((list) => $$('button.ad', list).forEach((btn) => btn.addEventListener('click', () => {
    lbSet = $$('li:not(.is-dim) button.ad', list);
    lbShow(lbSet.indexOf(btn));
    lb.showModal();
  })));
  $('[data-lb-prev]').addEventListener('click', () => lbShow(lbI - 1));
  $('[data-lb-next]').addEventListener('click', () => lbShow(lbI + 1));
  $('[data-lb-close]').addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); lbShow(lbI + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbShow(lbI - 1); }
  });

  /* ---------- contact ---------- */
  const contact = $('[data-contact-dialog]');
  const openContact = () => contact.showModal();
  $$('[data-contact]').forEach((b) => b.addEventListener('click', openContact));
  $('[data-contact-close]').addEventListener('click', () => contact.close());
  contact.addEventListener('click', (e) => { if (e.target === contact) contact.close(); });

  /* ---------- compare sliders ---------- */
  $$('[data-compare]').forEach((cmp) => {
    const r = $('.compare__range', cmp);
    const set = (v) => { cmp.style.setProperty('--pos', v + '%'); r.value = v; };
    r.addEventListener('input', () => { cmp.classList.remove('is-hint'); set(+r.value); });
    r.addEventListener('pointerdown', () => cmp.classList.add('is-drag'));
    addEventListener('pointerup', () => cmp.classList.remove('is-drag'));
    cmp._hint = () => {
      if (reduce || cmp.dataset.hinted) return;
      cmp.dataset.hinted = '1';
      cmp.classList.add('is-hint');
      [[250, 28], [1150, 72], [2050, 50]].forEach(([t, v]) => setTimeout(() => cmp.classList.contains('is-hint') && set(v), t));
      setTimeout(() => cmp.classList.remove('is-hint'), 3000);
    };
  });

  /* ---------- videos ---------- */
  const vids = $$('[data-video]').map((box) => {
    const v = $('video', box), b = $('.vid__btn', box);
    const sync = () => {
      const on = !v.paused;
      box.classList.toggle('is-playing', on);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? 'Pozastavit video' : 'Přehrát video');
    };
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    b.addEventListener('click', () => { if (v.paused) { box.userPaused = false; v.play().catch(() => {}); } else { box.userPaused = true; v.pause(); } });
    return box;
  });
  const playIn = (scope) => {
    vids.forEach((box) => {
      const v = $('video', box);
      const inScope = scope && scope.contains(box);
      const stage = box.closest('[data-stage]');
      const shown = !stage || box.classList.contains('vid--' + stage.dataset.stage);
      if (inScope && shown && !reduce && !box.userPaused) { v.preload = 'auto'; v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    });
  };
  $$('[data-format]').forEach((group) => {
    const stage = $('[data-stage]', group.closest('.slide'));
    $$('.seg__btn', group).forEach((b) => b.addEventListener('click', () => {
      stage.dataset.stage = b.dataset.fmt;
      $$('.seg__btn', group).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
      playIn(group.closest('.slide'));
    }));
  });

  /* ---------- site viewer ---------- */
  const SITES = {
    kubinvsl: { desk: 'web_kubin_vsl', mob: 'mobil_kubin_vsl_mobil', url: 'zahradnicke-prace-kubin.cz/vsl', href: 'https://www.zahradnicke-prace-kubin.cz/vsl/' },
    dapeevsl: { desk: 'web_dapee', mob: 'mobil_dapee_vsl_mobil', url: 'vsl.dapee.cz', href: 'https://vsl.dapee.cz/' },
    machr: { desk: 'cela_stranka_machr', mob: 'mobil_machr', url: 'machr-reality.cz', href: 'https://www.machr-reality.cz/' },
    m2work: { desk: 'web_m2work', url: 'm2work.cz', href: 'https://m2work.cz/' },
    annies: { desk: 'web_annies', url: 'anniesprague.com', href: 'https://www.anniesprague.com/' }
  };
  const viewer = $('[data-viewer]');
  if (viewer) {
    const desk = $('[data-site-desk]', viewer), mob = $('[data-site-mob]', viewer), view = $('.browser__view', viewer);
    const devBtns = $$('[data-dev]', viewer), hint = $('[data-hint]', viewer);
    const setDev = (d) => {
      viewer.dataset.mode = d;
      devBtns.forEach((b) => { b.classList.toggle('is-on', b.dataset.dev === d); b.setAttribute('aria-pressed', b.dataset.dev === d); });
    };
    devBtns.forEach((b) => b.addEventListener('click', () => setDev(b.dataset.dev)));
    view.addEventListener('scroll', () => hint.classList.add('is-gone'), { once: true });
    $$('[data-site]').forEach((btn) => btn.addEventListener('click', () => {
      const s = SITES[btn.dataset.site];
      $$('[data-site]').forEach((x) => { x.classList.toggle('is-on', x === btn); x.setAttribute('aria-pressed', x === btn); });
      desk.animate?.([{ opacity: 0.2 }, { opacity: 1 }], { duration: reduce ? 1 : 450 });
      desk.src = `assets/img/${s.desk}.webp`;
      view.scrollTop = 0;
      $('[data-site-url]', viewer).textContent = s.url;
      const link = $('[data-site-link]', viewer);
      link.href = s.href;
      const mBtn = devBtns.find((b) => b.dataset.dev === 'mobile');
      if (s.mob) { mob.src = `assets/img/${s.mob}.webp`; mBtn.disabled = false; mBtn.title = ''; }
      else { mBtn.disabled = true; mBtn.title = 'Mobilní náhled pro tento web nemám'; setDev('desktop'); }
    }));
  }

  /* ---------- report hotspots ---------- */
  const report = $('[data-report]');
  if (report) {
    const note = $('[data-hotspot-text]');
    $$('.spot', report).forEach((s, i) => {
      s.style.setProperty('--d', i);
      s.setAttribute('aria-label', 'Bod ' + (i + 1) + ': ' + s.dataset.text);
      s.addEventListener('click', () => {
        $$('.spot', report).forEach((x) => x.classList.toggle('is-on', x === s));
        note.textContent = s.dataset.text;
        note.classList.remove('is-hot'); void note.offsetWidth; note.classList.add('is-hot');
      });
    });
  }

  /* ---------- chapters ---------- */
  const ORDER = ['marketing', 'weby', 'reporting', 'automatizace'];
  const NAMES = { marketing: 'Marketing a kreativa', weby: 'Weby', reporting: 'Reporting', automatizace: 'Automatizace' };
  const chapters = {};
  ORDER.forEach((key) => {
    const el = $(`[data-view="${key}"]`);
    const slides = $$('.slide', el);
    const steps = $('.steps', el);
    const tabs = slides.map((sl, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'step';
      b.setAttribute('role', 'tab');
      b.textContent = sl.dataset.step;
      b.addEventListener('click', () => go(key, i));
      steps.append(b);
      sl.setAttribute('role', 'tabpanel');
      sl.setAttribute('aria-label', sl.dataset.step);
      return b;
    });
    const prev = $('[data-prev]', el), next = $('[data-next]', el), count = $('[data-count-label]', el);
    prev.addEventListener('click', () => { const c = chapters[key]; c.i > 0 ? go(key, c.i - 1) : go('home'); });
    next.addEventListener('click', () => {
      const c = chapters[key];
      if (c.i < slides.length - 1) return go(key, c.i + 1);
      const n = ORDER[ORDER.indexOf(key) + 1];
      n ? go(n, 0) : openContact();
    });
    // swipe
    let sx = 0, sy = 0;
    const box = $('.slides', el);
    box.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (e.target.closest('.compare, .browser__view, .chips, .steps')) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) (dx < 0 ? next : prev).click();
    }, { passive: true });
    chapters[key] = { el, slides, tabs, prev, next, count, i: -1 };
  });

  const showSlide = (key, i) => {
    const c = chapters[key];
    i = Math.max(0, Math.min(i, c.slides.length - 1));
    c.slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.classList.toggle('is-past', k < i);
      s.inert = k !== i;
    });
    c.tabs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i); });
    const st = c.tabs[i].parentElement;
    if (st.scrollWidth > st.clientWidth) st.scrollTo({ left: c.tabs[i].offsetLeft - st.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
    c.i = i;
    const last = i === c.slides.length - 1, first = i === 0;
    const nk = ORDER[ORDER.indexOf(key) + 1];
    c.prev.textContent = first ? 'Rozcestník' : 'Zpět';
    c.next.innerHTML = !last ? `<span>Další<span class="next-label">: ${c.slides[i + 1].dataset.step}</span></span>`
      : nk ? `<span>Další kapitola<span class="next-label">: ${NAMES[nk]}</span></span>` : 'Kontakt';
    c.count.textContent = `${i + 1} / ${c.slides.length}`;
    const s = c.slides[i];
    s.scrollTop = 0;
    $$('[data-count]', s).forEach(countUp);
    $$('[data-flow]', s).forEach((b) => renderFlow(b, b.dataset.flow));
    if ($('[data-funnel]', s)) renderFunnel(funnel.dataset.src || 'vsl');
    $$('[data-compare]', s).forEach((cmp) => setTimeout(() => cmp._hint(), 500));
    playIn(s);
    s.dispatchEvent(new CustomEvent('slide:show'));
  };

  /* ---------- router ---------- */
  let current = null, origin = null;
  const views = $$('.view');
  const parse = () => {
    const [, key = '', step = '1'] = location.hash.split('/');
    return chapters[key] ? { key, i: Math.max(0, (parseInt(step, 10) || 1) - 1) } : { key: 'home', i: 0 };
  };
  function go(key, i = 0) {
    const h = key === 'home' ? '#/' : `#/${key}/${i + 1}`;
    if (location.hash !== h) location.hash = h; else route();
  }
  const route = () => {
    const { key, i } = parse();
    const el = $(`[data-view="${key}"]`);
    document.body.dataset.route = key;
    $$('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === key));
    if (current !== el) {
      const old = current;
      el.hidden = false;
      el.style.setProperty('--cx', origin ? origin.x + 'px' : '50%');
      el.style.setProperty('--cy', origin ? origin.y + 'px' : '50%');
      origin = null;
      if (old && !reduce) {
        el.classList.add('is-entering');
        old.classList.add('is-leaving');
        setTimeout(() => { old.hidden = true; old.classList.remove('is-leaving'); el.classList.remove('is-entering'); }, 760);
      } else if (old) old.hidden = true;
      else views.forEach((v) => { v.hidden = v !== el; });
      views.forEach((v) => v.classList.toggle('is-active', v === el));
      current = el;
      document.title = key === 'home' ? 'Daniel Kadlec, AI Growth & Performance Marketing' : `${NAMES[key]}: Daniel Kadlec`;
    }
    if (key === 'home') { playIn(null); $$('.eq [data-count]').forEach(countUp); }
    else showSlide(key, i);
  };
  // reveal from the clicked point
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#/"], [data-next], .stepper__btn--prev');
    if (a) origin = { x: e.clientX || innerWidth / 2, y: e.clientY || innerHeight / 2 };
  }, true);
  addEventListener('hashchange', route);

  /* ---------- keyboard ---------- */
  addEventListener('keydown', (e) => {
    if ($('dialog[open]')) return;
    if (e.target.closest('input, textarea, .browser__view')) return;
    const key = document.body.dataset.route;
    if (!chapters[key]) return;
    if (e.key === 'ArrowRight') chapters[key].next.click();
    if (e.key === 'ArrowLeft') chapters[key].prev.click();
    if (e.key === 'Escape') go('home');
  });

  /* ---------- pointer light ---------- */
  if (matchMedia('(pointer: fine)').matches && !reduce) {
    const glow = $('.home__glow');
    $('.home').addEventListener('pointermove', (e) => {
      glow.style.setProperty('--mx', e.clientX + 'px');
      glow.style.setProperty('--my', e.clientY + 'px');
    });
    $$('.tile').forEach((t) => t.addEventListener('pointermove', (e) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--spot-x', e.clientX - r.left + 'px');
      t.style.setProperty('--spot-y', e.clientY - r.top + 'px');
    }));
  }

  if (reduce) $$('svg').forEach((s) => s.pauseAnimations?.());
  route();
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')));
})();
