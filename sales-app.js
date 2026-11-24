/* Sales Team Analyzer: klikací ukázka aplikace. Všechna jména, čísla a texty jsou vzorové. */
(() => {
  const box = document.querySelector('[data-demo="sales"]');
  if (!box) return;
  const $ = (s, el = box) => el.querySelector(s);
  const $$ = (s, el = box) => [...el.querySelectorAll(s)];
  box.closest('.s-grid')?.classList.add('s-grid--app');

  const REPS = [
    ['Jana Horáková', 12, '7,8'], ['Petr Vlček', 15, '6,9'], ['Lucie Benešová', 9, '6,2'], ['Tomáš Kříž', 7, '5,6'], ['Eva Součková', 5, '4,9']
  ];
  const OBJ = [['Nemám peníze', 38, '#F5A524'], ['Už mám řešení', 14, '#3B82F6'], ['Potřebuji se poradit', 12, '#A855F7'], ['Cena', 9, '#22C55E'], ['Nedůvěra', 7, '#EF4444']];
  const CALLS = [
    { rep: 'Jana Horáková', status: 'Uzavřeno', st: 'ok', score: 8, obj: 'Nemám čas', date: '12. 3.',
      pros: ['V úvodu jsi navázala na předchozí hovor a rychle získala důvěru.', 'Closing byl přirozený a bez nátlaku. Klient sám potvrdil další krok.'],
      cons: ['Prezentaci jsi začala dřív, než byly zmapované všechny cíle klienta.'],
      phases: ['Ano', 'Částečně', 'Částečně', 'Ano', 'Ano'] },
    { rep: 'Petr Vlček', status: 'V jednání', st: 'wait', score: 6, obj: 'Potřebuji se poradit', date: '11. 3.',
      pros: ['Dobře jsi shrnul situaci klienta vlastními slovy.'],
      cons: ['Na námitku „poradím se“ jsi nedomluvil konkrétní termín dalšího hovoru.', 'Chyběla otázka, kdo o nákupu rozhoduje.'],
      phases: ['Ano', 'Ano', 'Částečně', 'Částečně', 'Ne'] },
    { rep: 'Lucie Benešová', status: 'V jednání', st: 'wait', score: 5, obj: 'Nemám peníze', date: '11. 3.',
      pros: ['Nabídla jsi splátky ve správný moment.'],
      cons: ['Cenu jsi řekla dřív, než klient pochopil hodnotu.', 'Dlouhý monolog o produktu, klient čtyři minuty nemluvil.'],
      phases: ['Částečně', 'Částečně', 'Ne', 'Ano', 'Částečně'] },
    { rep: 'Tomáš Kříž', status: 'Odmítnuto', st: 'no', score: 4, obj: 'Už mám řešení', date: '10. 3.',
      pros: ['Zdvořilý a klidný tón po celou dobu hovoru.'],
      cons: ['Nezjistil jsi, co klientovi na současném řešení nevyhovuje.', 'Hovor skončil bez dalšího kroku.'],
      phases: ['Ano', 'Ne', 'Ne', 'Částečně', 'Ne'] }
  ];
  const PH = ['Úvod', 'Diagnostika', 'Reality check', 'Řešení', 'Closing'];
  const TREND = [6.1, 5.4, 5.9, 6.6, 7.2];

  const kpi = (label, val, unit, c) => `<div class="sa-kpi" style="--c:${c}"><span>${label}</span><b>${val}<small>${unit}</small></b><i></i></div>`;
  const trend = () => {
    const W = 520, H = 150, min = 5, max = 7.6;
    const pts = TREND.map((v, i) => [20 + i * (W - 40) / 4, H - 24 - (v - min) / (max - min) * (H - 44)]);
    const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" class="sa-trend" role="img" aria-label="Trend skóre týmu po týdnech">
      <path d="${d} L ${W - 20} ${H - 20} L 20 ${H - 20} Z" class="sa-trend__fill"/><path d="${d}" class="sa-trend__line"/>
      ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4"/><text x="${x}" y="${H - 4}" text-anchor="middle">T${i + 1}</text>`).join('')}</svg>`;
  };
  const views = {
    dashboard: () => `<div class="sa-kpis">${kpi('Průměrné skóre týmu', '6,5', ' / 10', '#3B82F6')}${kpi('Hovory celkem', '48', '', '#F5A524')}${kpi('Míra uzavření', '21', ' %', '#22C55E')}${kpi('Aktivní obchodníci', '5', '', '#A855F7')}</div>
      <div class="sa-two"><div class="sa-panel"><p class="sa-h">Trend výkonu</p>${trend()}</div>
      <div class="sa-panel"><p class="sa-h">Top 5 námitek</p>${OBJ.map(([n, v, c]) => `<div class="sa-bar"><span>${n}</span><i style="--v:${v * 2.4}%;--c:${c}"></i><b>${v} %</b></div>`).join('')}</div></div>`,
    leaderboard: () => `<div class="sa-panel sa-table"><div class="sa-tr sa-tr--head"><span>#</span><span>Jméno</span><span>Hovory</span><span>Prům. skóre</span></div>
      ${REPS.map(([n, c, s], i) => `<div class="sa-tr${i ? '' : ' is-top'}"><span>${i + 1}</span><span><em>${n.split(' ').map((w) => w[0]).join('')}</em>${n}</span><span>${c}</span><span><b>${s}</b></span></div>`).join('')}</div>`,
    archiv: () => `<div class="sa-arch"><div class="sa-list">${CALLS.map((c, i) => `<button type="button" class="sa-call${i ? '' : ' is-on'}" data-call="${i}"><b>${c.rep}</b><em class="sa-st sa-st--${c.st}">${c.status}</em><span>Skóre ${c.score} · ${c.obj} · ${c.date}</span></button>`).join('')}</div>
      <div class="sa-detail" data-detail></div></div>`,
    namitky: () => `<div class="sa-kpis sa-kpis--3">${kpi('Zaznamenané námitky', '41', '', '#3B82F6')}${kpi('Nejčastější námitka', 'Nemám peníze', '', '#F5A524')}${kpi('Uzavřeno po námitce', '24', ' %', '#22C55E')}</div>
      <div class="sa-panel"><p class="sa-h">Týdenní shrnutí pro marketing</p>
      <p class="sa-note">Nejčastěji zaznívá „nemám peníze“. Klienti chtějí splátky a jasný příklad návratnosti. Doporučení: přidat do reklam a na web konkrétní cenu a možnost splátek.</p>
      <div class="sa-actions"><button type="button" class="sa-btn" data-copy>Kopírovat</button><button type="button" class="sa-btn sa-btn--main" data-send>Poslat marketingu</button></div></div>`
  };
  const detail = (i) => {
    const c = CALLS[i];
    return `<p class="sa-h">Detail hovoru: ${c.rep} <em class="sa-st sa-st--${c.st}">${c.status}</em></p>
      <div class="sa-sum"><div><p class="sa-pro">Co se povedlo</p>${c.pros.map((t) => `<p>${t}</p>`).join('')}</div><div><p class="sa-con">Co zlepšit</p>${c.cons.map((t) => `<p>${t}</p>`).join('')}</div></div>
      <p class="sa-h sa-h--sm">Fáze hovoru</p><div class="sa-phases">${PH.map((p, k) => `<span class="sa-ph sa-ph--${c.phases[k] === 'Ano' ? 'ok' : c.phases[k] === 'Ne' ? 'no' : 'wait'}"><b>${p}</b>${c.phases[k]}</span>`).join('')}</div>`;
  };

  const NAV = [['dashboard', 'Dashboard'], ['leaderboard', 'Leaderboard'], ['archiv', 'Archiv hovorů'], ['namitky', 'Námitky']];
  box.innerHTML = `<div class="sa" aria-label="Ukázka aplikace Sales Team Analyzer">
      <div class="sa-side"><p class="sa-logo"><i></i>Sales Analyzer</p>
        ${NAV.map(([k, n], i) => `<button type="button" class="sa-nav${i ? '' : ' is-on'}" data-view-btn="${k}">${n}</button>`).join('')}
        <p class="sa-demo">Vzorová data</p></div>
      <div class="sa-main" data-main></div>
    </div>`;
  const main = $('[data-main]');
  const show = (k) => {
    $$('[data-view-btn]').forEach((b) => b.classList.toggle('is-on', b.dataset.viewBtn === k));
    main.innerHTML = views[k]();
    main.classList.remove('is-in'); void main.offsetWidth; main.classList.add('is-in');
    if (k === 'archiv') $('[data-detail]').innerHTML = detail(0);
  };
  box.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-view-btn]');
    if (nav) return show(nav.dataset.viewBtn);
    const call = e.target.closest('[data-call]');
    if (call) {
      $$('[data-call]').forEach((b) => b.classList.toggle('is-on', b === call));
      const d = $('[data-detail]');
      d.innerHTML = detail(+call.dataset.call);
      d.classList.remove('is-in'); void d.offsetWidth; d.classList.add('is-in');
      return;
    }
    const act = e.target.closest('[data-copy], [data-send]');
    if (act) { const t = act.textContent; act.textContent = act.matches('[data-copy]') ? 'Zkopírováno' : 'Odesláno (ukázka)'; setTimeout(() => { act.textContent = t; }, 1600); }
  });
  show('dashboard');
})();
