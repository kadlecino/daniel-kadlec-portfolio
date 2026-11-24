/* Dlaždice PROFIREAL Group: po kliknutí načítání, které skončí na „Ready 3. 12.“ */
(() => {
  const btn = document.querySelector('[data-teaser]');
  const dlg = document.querySelector('[data-teaser-dialog]');
  if (!btn || !dlg) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar = dlg.querySelector('[data-teaser-bar]');
  const pct = dlg.querySelector('[data-teaser-pct]');
  const log = dlg.querySelector('[data-teaser-log]');
  const done = dlg.querySelector('[data-teaser-done]');
  const STEPS = [[18, 'Načítám zadání'], [41, 'Připravuji podklady'], [67, 'Stavím ukázky'], [88, 'Ladím prezentaci'], [100, 'Hotovo']];
  let run = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const play = async () => {
    const me = ++run;
    done.hidden = true;
    log.textContent = '';
    let cur = 0;
    for (const [to, label] of STEPS) {
      log.textContent = label + '…';
      while (cur < to) {
        if (me !== run) return;
        cur += 1;
        bar.style.width = cur + '%';
        pct.textContent = cur + ' %';
        await wait(16 + Math.random() * 22);
      }
      await wait(260);
    }
    if (me !== run) return;
    log.textContent = 'Loading dokončen.';
    done.hidden = false;
  };
  btn.addEventListener('click', () => { dlg.showModal(); bar.style.width = '0'; pct.textContent = '0 %'; play(); });
  dlg.querySelector('[data-teaser-close]').addEventListener('click', () => { run++; dlg.close(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) { run++; dlg.close(); } });
  dlg.addEventListener('close', () => { run++; });
})();
