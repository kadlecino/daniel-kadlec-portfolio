/* Reporting aplikace: klikací ukázka. Všechna čísla jsou vzorová, generovaná v prohlížeči. */
(() => {
  const box = document.querySelector('[data-rapp]');
  if (!box) return;
  const $ = (s, el = box) => el.querySelector(s);
  const $$ = (s, el = box) => [...el.querySelectorAll(s)];
  const fmt = (n, d = 0) => n.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // deterministic sample data: 60 days
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const DAYS = Array.from({ length: 60 }, (_, i) => {
    const wave = 0.55 + 0.45 * Math.sin(i / 6) + 0.25 * Math.sin(i / 2.3);
    const spend = Math.max(18000, Math.round((60000 + 70000 * wave + rnd() * 30000) / 100) * 100);
    const buys = Math.max(2, Math.round(spend / (5200 + rnd() * 2600)));
    const leads = Math.round(buys * (3.2 + rnd() * 1.6));
    const impr = Math.round(spend * (5.5 + rnd() * 2));
    const clicks = Math.round(impr * (0.011 + rnd() * 0.006));
    return { spend, buys, leads, impr, clicks, value: buys * (14500 + Math.round(rnd() * 3000)) };
  });
  const CAMPAIGNS = [['Prospecting: video', 'Aktivní', 0.38], ['Prospecting: statické', 'Aktivní', 0.27], ['Retargeting 30 dní', 'Aktivní', 0.19], ['Lookalike nákupy', 'Učí se', 0.11], ['Test nových kreativ', 'Pozastaveno', 0.05]];

  box.closest('.s-grid')?.classList.add('s-grid--app');
  box.innerHTML = `<div class="sa ra" aria-label="Ukázka reportingové aplikace">
      <div class="sa-side"><p class="sa-logo"><i></i>Řídicí centrum</p>
        <button type="button" class="sa-nav is-on" data-rv="prehled">Přehled</button>
        <button type="button" class="sa-nav" data-rv="kampane">Kampaně</button>
        <p class="sa-demo">Vzorová data</p></div>
      <div class="sa-main">
        <div class="ra-top"><p class="sa-h" data-title>Přehled</p>
          <div class="ra-seg" role="group" aria-label="Období">
            <button type="button" data-p="7">7 dní</button><button type="button" data-p="30" class="is-on">30 dní</button><button type="button" data-p="60">60 dní</button>
          </div></div>
        <div data-body></div>
      </div></div>`;
  let period = 30, view = 'prehled';
  const body = $('[data-body]');

  const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);
  const render = () => {
    const rows = DAYS.slice(-period);
    const spend = sum(rows, 'spend'), buys = sum(rows, 'buys'), leads = sum(rows, 'leads'), value = sum(rows, 'value'), impr = sum(rows, 'impr'), clicks = sum(rows, 'clicks');
    $('[data-title]').textContent = view === 'prehled' ? 'Přehled' : 'Kampaně';
    if (view === 'kampane') {
      body.innerHTML = `<div class="sa-panel sa-table ra-table"><div class="sa-tr sa-tr--head"><span>Kampaň</span><span>Stav</span><span>Útrata</span><span>Nákupy</span><span>CPA</span></div>
        ${CAMPAIGNS.map(([n, st, share], i) => { const s = spend * share, b = Math.max(1, Math.round(buys * share * (1.15 - i * 0.08)));
          return `<div class="sa-tr"><span>${n}</span><span><em class="sa-st sa-st--${st === 'Aktivní' ? 'ok' : st === 'Učí se' ? 'wait' : 'no'}">${st}</em></span><span>${fmt(s)} Kč</span><span>${b}</span><span><b>${fmt(s / b)} Kč</b></span></div>`; }).join('')}</div>`;
    } else {
      const k = (l, v) => `<div class="ra-kpi"><span>${l}</span><b>${v}</b></div>`;
      const maxS = Math.max(...rows.map((r) => r.spend)), maxB = Math.max(...rows.map((r) => r.buys));
      const W = 100 / rows.length;
      const line = rows.map((r, i) => `${(i + 0.5) * W},${100 - (r.spend / maxS) * 92}`).join(' ');
      body.innerHTML = `<div class="ra-kpis">${k('Útrata', fmt(spend) + ' Kč')}${k('Konverze', fmt(buys))}${k('Hodnota', fmt(value) + ' Kč')}${k('ROAS', fmt(value / spend, 2))}${k('CPA', fmt(spend / buys) + ' Kč')}${k('Leady', fmt(leads))}${k('CPL', fmt(spend / leads) + ' Kč')}</div>
        <div class="sa-panel ra-chart"><p class="sa-h">Útrata vs konverze <span class="ra-legend"><i class="ra-l1"></i>Útrata<i class="ra-l2"></i>Nákupy</span></p>
          <div class="ra-plot">
            <div class="ra-bars">${rows.map((r, i) => `<i style="--h:${(r.buys / maxB) * 100}%;--i:${i}" data-tip="Den ${i + 1}: ${fmt(r.spend)} Kč, ${r.buys} nákupů"></i>`).join('')}</div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${line}"/></svg>
            <p class="ra-tip" data-tip-box hidden></p>
          </div></div>
        <div class="sa-panel"><p class="sa-h sa-h--sm" style="margin-top:0">Meta Ads statistiky</p><div class="ra-stats">
          ${k('CTR', fmt(clicks / impr * 100, 2) + ' %')}${k('CPC', fmt(spend / clicks, 1) + ' Kč')}${k('CPM', fmt(spend / impr * 1000) + ' Kč')}${k('Imprese', fmt(impr))}${k('Kliky', fmt(clicks))}</div></div>`;
    }
    if (!reduce) { body.classList.remove('is-in'); void body.offsetWidth; body.classList.add('is-in'); }
  };
  box.addEventListener('click', (e) => {
    const p = e.target.closest('[data-p]');
    if (p) { period = +p.dataset.p; $$('[data-p]').forEach((b) => b.classList.toggle('is-on', b === p)); return render(); }
    const v = e.target.closest('[data-rv]');
    if (v) { view = v.dataset.rv; $$('[data-rv]').forEach((b) => b.classList.toggle('is-on', b === v)); render(); }
  });
  box.addEventListener('pointermove', (e) => {
    const bar = e.target.closest('.ra-bars i'), tip = $('[data-tip-box]');
    if (!tip) return;
    if (!bar) { tip.hidden = true; return; }
    const plot = $('.ra-plot').getBoundingClientRect(), b = bar.getBoundingClientRect();
    tip.textContent = bar.dataset.tip; tip.hidden = false;
    tip.style.left = Math.min(Math.max(b.left - plot.left, 70), plot.width - 70) + 'px';
  });
  box.addEventListener('pointerleave', () => { const t = $('[data-tip-box]'); if (t) t.hidden = true; });
  render();
})();
