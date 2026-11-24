/* Živé ukázky. Všechna data v ukázkách jsou vzorová, ne klientská. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const fmt = (n) => Math.round(n).toLocaleString('cs-CZ');
  const NOTE = '<p class="demo__note">Ukázka na vzorových datech.</p>';

  /* ---------- 1. AI agent ---------- */
  const agent = (box) => {
    const LINES = [
      ['cmd', 'Připrav reklamy na kácení stromů pro Děčín, Teplice a Ústí.'],
      ['run', 'Čtu brief a výsledky minulých reklam'],
      ['ok', 'Texty: nadpis, popisek a tlačítko pro každé město'],
      ['ok', 'Grafika: varianty pro feed 4:5'],
      ['ok', 'Video před a po: formát 4:5 a 9:16'],
      ['ok', 'Nahráno do Meta Ads jako koncept'],
      ['wait', 'Čekám na schválení. Zveřejňuje člověk.']
    ];
    box.innerHTML = `<div class="term" role="log" aria-live="polite"><div class="term__bar"><i></i><i></i><i></i><b>AI agent</b></div><div class="term__body"></div></div>
      <button type="button" class="btn demo__btn">Spustit ukázku</button>`;
    const body = $('.term__body', box), btn = $('.demo__btn', box);
    let run = 0;
    const play = async () => {
      const me = ++run;
      body.textContent = '';
      btn.disabled = true;
      for (const [kind, text] of LINES) {
        if (me !== run) return;
        const p = document.createElement('p');
        p.className = 'term__line term__line--' + kind;
        body.append(p);
        if (kind === 'cmd' && !reduce) {
          for (const ch of text) { if (me !== run) return; p.textContent += ch; await wait(22); }
          await wait(400);
        } else {
          p.textContent = text;
          if (kind === 'run') { p.classList.add('is-busy'); await wait(1100); p.classList.remove('is-busy'); }
          else await wait(650);
        }
      }
      btn.disabled = false;
      btn.textContent = 'Spustit znovu';
    };
    btn.addEventListener('click', play);
    return { show: () => { if (!body.childElementCount) play(); } };
  };

  /* ---------- 2. Sales Team Analyzer ---------- */
  const sales = (box) => {
    const SCORES = [['Otevření hovoru', 8], ['Zjištění potřeb', 6], ['Práce s námitkami', 5], ['Domluvený další krok', 9]];
    box.innerHTML = `<div class="card">
        <p class="card__h">Přepis hovoru</p>
        <div class="chat">
          <p class="chat__a"><b>Obchodník</b> Dobrý den, volám kvůli vaší poptávce. Co teď řešíte nejvíc?</p>
          <p class="chat__b"><b>Klient</b> Máme málo zakázek mimo sezónu. A nevím, kolik by to stálo.</p>
          <p class="chat__a"><b>Obchodník</b> Rozumím. Pošlu vám nabídku a ve čtvrtek si zavoláme?</p>
        </div>
        <button type="button" class="btn demo__btn">Vyhodnotit hovor</button>
        <div class="scores" hidden>
          ${SCORES.map(([n, v]) => `<div class="score"><span>${n}</span><span class="score__bar"><i style="--v:${v * 10}%"></i></span><b>${v}/10</b></div>`).join('')}
          <p class="scores__tip"><b>Doporučení:</b> na otázku ceny odpovědět hned, ne až v nabídce.</p>
          <p class="scores__sent">Report odeslán manažerovi a CEO</p>
        </div>
      </div>${NOTE}`;
    const btn = $('.demo__btn', box), out = $('.scores', box);
    btn.addEventListener('click', async () => {
      btn.disabled = true; btn.textContent = 'AI vyhodnocuje…';
      out.hidden = true; out.classList.remove('is-on');
      await wait(1200);
      out.hidden = false;
      requestAnimationFrame(() => out.classList.add('is-on'));
      btn.disabled = false; btn.textContent = 'Vyhodnotit znovu';
    });
    return {};
  };

  /* ---------- 3. Rozdělování leadů ---------- */
  const leads = (box) => {
    const N = 6;
    box.innerHTML = `<div class="card">
        <div class="lead-top"><span class="lead-in">Nový lead</span><span class="lead-total">Rozděleno: <b data-total>0</b></span></div>
        <div class="advisors">${Array.from({ length: N }, (_, i) => `<div class="adv"><span class="adv__bar"><i></i></span><b data-n>0</b><span>Poradce ${String.fromCharCode(65 + i)}</span></div>`).join('')}</div>
        <div class="demo__row">
          <button type="button" class="btn demo__btn" data-add="1">Poslat lead</button>
          <button type="button" class="btn btn--ghost demo__btn" data-add="25">Poslat 25 leadů</button>
        </div>
      </div>${NOTE}`;
    const counts = Array(N).fill(0), advs = $$('.adv', box), total = $('[data-total]', box), src = $('.lead-in', box);
    let next = 0, sum = 0;
    const paint = () => {
      const max = Math.max(...counts, 8);
      advs.forEach((a, i) => { $('[data-n]', a).textContent = counts[i]; $('i', a).style.height = (counts[i] / max) * 100 + '%'; });
      total.textContent = sum;
    };
    const send = async (n) => {
      for (let k = 0; k < n; k++) {
        const i = next; next = (next + 1) % N;
        counts[i]++; sum++;
        advs[i].classList.remove('is-hit'); void advs[i].offsetWidth; advs[i].classList.add('is-hit');
        src.classList.remove('is-ping'); void src.offsetWidth; src.classList.add('is-ping');
        paint();
        await wait(n > 1 ? 70 : 0);
      }
    };
    $$('[data-add]', box).forEach((b) => b.addEventListener('click', () => send(+b.dataset.add)));
    paint();
    return {};
  };

  /* ---------- 4. ICP filtr ---------- */
  const icp = (box) => {
    const FIRMS = [
      ['Zahradnictví Novák', 'Zahradník, 4,8 na Googlu', 1], ['Bistro U Mostu', 'Restaurace', 0],
      ['Stavby Dvořák', 'Zedník, bez webu', 1], ['Kadeřnictví Lenka', 'Kadeřnictví', 0],
      ['Elektro Procházka', 'Elektrikář, 12 recenzí', 1], ['Autoservis Jih', 'Autoservis', 0],
      ['Střechy Kučera', 'Pokrývač, starý web', 1], ['Podlahy Malý', 'Podlahář, 4,9 na Googlu', 1]
    ];
    const CH = ['E-mail', 'SMS', 'WhatsApp'];
    box.innerHTML = `<div class="card">
        <p class="card__h">Kontakty z Google Maps a LinkedIn <span class="icp-count" data-count></span></p>
        <ul class="firms" role="list">${FIRMS.map(([n, d, ok], i) => `<li class="firm" data-ok="${ok}" style="--i:${i}"><b>${n}</b><span>${d}</span><em>${ok ? CH[i % 3] : 'Mimo ICP'}</em></li>`).join('')}</ul>
        <div class="demo__row">
          <button type="button" class="btn demo__btn">Spustit AI filtr</button>
          <span class="icp-rule">ICP v ukázce: řemeslník s recenzemi nebo slabým webem</span>
        </div>
      </div>${NOTE}`;
    const btn = $('.demo__btn', box), list = $('.firms', box), count = $('[data-count]', box);
    let on = false;
    btn.addEventListener('click', () => {
      on = !on;
      list.classList.toggle('is-filtered', on);
      btn.textContent = on ? 'Vrátit všechny' : 'Spustit AI filtr';
      count.textContent = on ? '5 z 8 prošlo' : '';
    });
    return {};
  };

  /* ---------- 5. Skloňování jmen ---------- */
  const vocative = (name) => {
    const n = name.trim();
    if (n.length < 2) return n;
    const low = n.toLowerCase(), cut = (k) => n.slice(0, n.length - k);
    if (/(ý|í|ů|u|e|ě|i|y|o)$/.test(low)) return n;            // Novotný, Krejčí, Janů
    if (low.endsWith('a')) return cut(1) + 'o';                // Svoboda → Svobodo
    if (low.endsWith('ek')) return cut(2) + 'ku';              // Hájek → Hájku
    if (/[^aáeéěiíoóuúůyý]{2}ec$/.test(low)) return n + 'i';   // Kadlec → Kadleci
    if (low.endsWith('ec')) return cut(2) + 'če';              // Němec → Němče
    if (low.endsWith('el')) return cut(2) + 'le';              // Havel → Havle
    if (/(k|h|g)$/.test(low)) return n + 'u';                  // Novák → Nováku
    if (/[^aáeéěiíoóuúůyý]r$/.test(low)) return cut(1) + 'ře'; // Petr → Petře
    if (/(š|č|ř|ž|j|c|ň|ť|ď|x|s|z)$/.test(low)) return n + 'i'; // Tomáš → Tomáši
    return n + 'e';                                            // Dvořák? no: Kadlec handled, Novotn → e
  };
  const letter = (box) => {
    box.innerHTML = `<div class="card">
        <div class="letter-form">
          <div class="seg seg--small" role="group" aria-label="Oslovení">
            <button type="button" class="seg__btn is-on" aria-pressed="true" data-g="m">Pan</button>
            <button type="button" class="seg__btn" aria-pressed="false" data-g="f">Paní</button>
          </div>
          <label class="field"><span>Příjmení</span><input type="text" value="Novák" maxlength="24" autocomplete="off" spellcheck="false"></label>
        </div>
        <div class="paper">
          <p class="paper__hi" data-hi></p>
          <p>všiml jsem si, že vlastníte nemovitost v naší lokalitě. Mám pro ni vážného zájemce.</p>
          <p>Pokud o prodeji uvažujete, rád vám připravím nezávazný odhad ceny.</p>
        </div>
        <div class="demo__row">${['Svoboda', 'Hájek', 'Němec', 'Petr', 'Tomáš'].map((n) => `<button type="button" class="chip chip--small" data-try="${n}">${n}</button>`).join('')}</div>
      </div><p class="demo__note">Zjednodušená ukázka skloňování. Ostrá verze běží v Make.</p>`;
    const input = $('input', box), hi = $('[data-hi]', box);
    let g = 'm';
    const paint = () => {
      const n = input.value.trim() || 'Novák';
      hi.innerHTML = g === 'm' ? `Vážený pane <mark>${vocative(n).replace(/</g, '')}</mark>,` : `Vážená paní <mark>${n.replace(/</g, '')}</mark>,`;
      hi.classList.remove('is-pop'); void hi.offsetWidth; hi.classList.add('is-pop');
    };
    input.addEventListener('input', paint);
    $$('[data-g]', box).forEach((b) => b.addEventListener('click', () => {
      g = b.dataset.g;
      $$('[data-g]', box).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
      if (g === 'f' && !/ová$/.test(input.value)) input.value = 'Nováková';
      if (g === 'm' && /ová$/.test(input.value)) input.value = 'Novák';
      paint();
    }));
    $$('[data-try]', box).forEach((b) => b.addEventListener('click', () => { g = 'm'; $$('[data-g]', box).forEach((x) => { x.classList.toggle('is-on', x.dataset.g === 'm'); x.setAttribute('aria-pressed', x.dataset.g === 'm'); }); input.value = b.dataset.try; paint(); }));
    paint();
    return {};
  };

  const DEMOS = { agent, leads, icp, letter };
  $$('[data-demo]').forEach((box) => {
    const api = DEMOS[box.dataset.demo]?.(box) || {};
    const sl = box.closest('.slide');
    sl?.addEventListener('slide:show', () => api.show?.());
    if (sl?.classList.contains('is-active')) api.show?.();
  });

  /* ---------- kalkulačka pro ProfiCredit ---------- */
  const calc = $('[data-calc]');
  if (calc) {
    const cols = $$('[data-variant]', calc);
    const paint = () => {
      const res = cols.map((col) => {
        const v = Object.fromEntries($$('input[type=range]', col).map((i) => [i.name, +i.value]));
        $$('input[type=range]', col).forEach((i) => { $(`[data-val="${i.name}"]`, col).textContent = i.name === 'rate' ? i.value + ' %' : fmt(+i.value) + ' Kč'; });
        const leadsN = v.budget / v.cpl, loans = leadsN * v.rate / 100, cost = loans > 0 ? v.budget / loans : 0;
        $('[data-out="leads"]', col).textContent = fmt(leadsN);
        $('[data-out="loans"]', col).textContent = fmt(loans);
        $('[data-out="cost"]', col).textContent = fmt(cost) + ' Kč';
        return cost;
      });
      const best = res[0] === res[1] ? -1 : res[0] < res[1] ? 0 : 1;
      cols.forEach((c, i) => c.classList.toggle('is-best', i === best));
      const verdict = $('[data-verdict]', calc);
      if (best < 0) verdict.textContent = 'Obě varianty vyjdou stejně.';
      else {
        const diff = Math.abs(res[0] - res[1]);
        verdict.innerHTML = `Varianta <b>${best ? 'B' : 'A'}</b> má schválenou půjčku o <b>${fmt(diff)} Kč</b> levnější${(best === 1) === (+$('input[name=cpl]', cols[1]).value > +$('input[name=cpl]', cols[0]).value) ? ', i když je její lead dražší' : ''}.`;
      }
    };
    calc.addEventListener('input', paint);
    paint();
  }

  /* ---------- plán: kroky ---------- */
  const plan = $('[data-plan]');
  if (plan) {
    const tabs = $$('[data-plan-step]', plan), panels = $$('[data-plan-panel]', plan);
    const set = (i) => {
      tabs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i); });
      panels.forEach((p, k) => { p.hidden = k !== i; });
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => set(i)));
    set(0);
  }
})();
