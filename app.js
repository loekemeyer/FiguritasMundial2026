// =============================================================
//  Tracker Figuritas Mundial 2026 - lógica principal
// =============================================================

const STORAGE_KEY = 'figuritas-2026:v1';
const SESSION_KEY = 'figuritas-2026:session';

// Cuenta hardcodeada (este "login" no es seguridad real, sólo
// un candado personal: el front es público para quien vea el código).
const CREDENTIALS = { user: 'ThomasLoke', pass: 'Milanesa10' };

// ---------- Estado ----------
const state = {
  // Mapa código -> cantidad poseída (0 = no la tengo, 1 = pegada, >1 = repetidas)
  counts: {},
  filter: 'todas',
  query: '',
  collapsed: new Set(),
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data.counts === 'object') state.counts = data.counts;
    }
  } catch (e) { console.warn('No pude leer estado', e); }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ counts: state.counts }));
}

// ---------- Login ----------
function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}
function setLoggedIn(v) {
  if (v) sessionStorage.setItem(SESSION_KEY, '1');
  else sessionStorage.removeItem(SESSION_KEY);
}
function showLogin() {
  document.getElementById('login-screen').hidden = false;
  document.getElementById('app').hidden = true;
}
function showApp() {
  document.getElementById('login-screen').hidden = true;
  document.getElementById('app').hidden = false;
  render();
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  // Tolerante a mayúsculas/minúsculas en el usuario y espacios en la contraseña
  // (los autocompletados móviles suelen meter espacios al final).
  const u = document.getElementById('login-user').value.trim().toLowerCase();
  const p = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-error');
  if (u === CREDENTIALS.user.toLowerCase() && p === CREDENTIALS.pass) {
    err.hidden = true;
    setLoggedIn(true);
    showApp();
  } else {
    err.hidden = false;
  }
});
document.getElementById('btn-logout').addEventListener('click', () => {
  setLoggedIn(false);
  document.getElementById('login-pass').value = '';
  showLogin();
});

// ---------- Estadísticas ----------
function computeStats() {
  const total = ALBUM.totalCount;
  let pegadas = 0;
  let repes = 0;
  for (const s of ALBUM.allStickers) {
    const q = state.counts[s.code] || 0;
    if (q >= 1) pegadas++;
    if (q > 1) repes += q - 1;
  }
  const faltan = total - pegadas;
  const pct = (n) => total ? Math.round((n / total) * 1000) / 10 : 0;
  return {
    total, pegadas, faltan, repes,
    pegadasPct: pct(pegadas),
    faltanPct: pct(faltan),
  };
}

function renderStats() {
  const s = computeStats();
  document.getElementById('stat-pegadas').textContent = s.pegadas;
  document.getElementById('stat-pegadas-pct').textContent = s.pegadasPct + '%';
  document.getElementById('stat-faltan').textContent = s.faltan;
  document.getElementById('stat-faltan-pct').textContent = s.faltanPct + '%';
  document.getElementById('stat-repes').textContent = s.repes;
  document.getElementById('stat-total').textContent = s.total;
  document.getElementById('progress-bar').style.width = s.pegadasPct + '%';
  document.getElementById('stat-progress').textContent = s.pegadasPct + '% completado';
}

// ---------- Render del álbum ----------
function getGroupsForRender() {
  // Devuelve los "grupos" en el orden a mostrar
  const groups = [
    { id: 'FWC',  name: ALBUM.special.name, icon: ALBUM.special.icon, count: ALBUM.special.count, prefix: 'FWC' },
    { id: 'LEG',  name: ALBUM.legends.name, icon: ALBUM.legends.icon, count: ALBUM.legends.count, prefix: 'LEG' },
  ];
  for (const t of ALBUM.teams) {
    groups.push({
      id: t.code, name: t.name, flag: t.flag,
      count: ALBUM.perTeam, prefix: t.code, confed: t.confed,
    });
  }
  return groups;
}

function stickerMatchesFilter(code) {
  const q = state.counts[code] || 0;
  switch (state.filter) {
    case 'pegadas': return q >= 1;
    case 'faltan':  return q === 0;
    case 'repes':   return q > 1;
    default:        return true;
  }
}

function groupMatchesQuery(g) {
  if (!state.query) return true;
  const q = state.query.toLowerCase();
  if (g.name.toLowerCase().includes(q)) return true;
  if (g.id.toLowerCase().includes(q)) return true;
  // ¿Algún sticker del grupo cuyo número o código matchee?
  for (let i = 1; i <= g.count; i++) {
    if (`${g.prefix} ${i}`.toLowerCase().includes(q)) return true;
  }
  return false;
}

function renderGroups() {
  const root = document.getElementById('groups');
  const groups = getGroupsForRender();
  const frag = document.createDocumentFragment();

  for (const g of groups) {
    if (!groupMatchesQuery(g)) continue;
    const collapsed = state.collapsed.has(g.id);

    let pegadas = 0, repes = 0;
    for (let i = 1; i <= g.count; i++) {
      const code = `${g.prefix} ${i}`;
      const q = state.counts[code] || 0;
      if (q >= 1) pegadas++;
      if (q > 1) repes += q - 1;
    }
    const pct = Math.round((pegadas / g.count) * 100);

    const groupEl = document.createElement('section');
    groupEl.className = 'group' + (collapsed ? ' collapsed' : '');

    const head = document.createElement('header');
    head.className = 'group-head';
    head.innerHTML = `
      <div class="group-title">
        <span class="group-flag">${g.flag || g.icon || '⚽'}</span>
        <span>${g.name} <span class="muted small">· ${g.id}</span></span>
      </div>
      <div class="group-meta">
        <span>${pegadas}/${g.count}</span>
        ${repes ? `<span style="color:var(--alt)">+${repes} repe</span>` : ''}
        <div class="group-progress"><div class="group-progress-bar" style="width:${pct}%"></div></div>
        <span>${pct}%</span>
      </div>
    `;
    head.addEventListener('click', () => {
      if (collapsed) state.collapsed.delete(g.id);
      else state.collapsed.add(g.id);
      renderGroups();
    });
    groupEl.appendChild(head);

    const body = document.createElement('div');
    body.className = 'group-body';
    let anyVisible = false;
    for (let i = 1; i <= g.count; i++) {
      const code = `${g.prefix} ${i}`;
      if (!stickerMatchesFilter(code)) continue;
      if (state.query) {
        const q = state.query.toLowerCase();
        const matches = code.toLowerCase().includes(q) || g.name.toLowerCase().includes(q);
        if (!matches) continue;
      }
      anyVisible = true;
      const qty = state.counts[code] || 0;
      const cls = qty === 0 ? '' : qty === 1 ? 'have' : 'have dup';
      const cell = document.createElement('div');
      cell.className = 'sticker ' + cls;
      cell.dataset.code = code;
      cell.innerHTML = `
        <span class="num">${i}</span>
        ${qty > 1 ? `<span class="qty">+${qty - 1}</span>` : ''}
        <button class="minus" title="Restar">−</button>
      `;
      cell.addEventListener('click', (e) => {
        if (e.target.classList.contains('minus')) {
          e.stopPropagation();
          decSticker(code);
        } else {
          incSticker(code);
        }
      });
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        decSticker(code);
      });
      body.appendChild(cell);
    }
    if (!anyVisible) {
      const empty = document.createElement('p');
      empty.className = 'muted small';
      empty.style.padding = '0.4rem 0.2rem';
      empty.textContent = 'Sin figuritas que coincidan con el filtro.';
      body.appendChild(empty);
    }
    groupEl.appendChild(body);
    frag.appendChild(groupEl);
  }
  root.innerHTML = '';
  root.appendChild(frag);
}

function render() {
  renderStats();
  renderGroups();
}

// ---------- Mutaciones ----------
function incSticker(code) {
  state.counts[code] = (state.counts[code] || 0) + 1;
  saveState();
  render();
}
function decSticker(code) {
  if (!state.counts[code]) return;
  state.counts[code] -= 1;
  if (state.counts[code] <= 0) delete state.counts[code];
  saveState();
  render();
}
function setSticker(code, qty) {
  if (qty <= 0) delete state.counts[code];
  else state.counts[code] = qty;
}

// ---------- Filtros y búsqueda ----------
document.querySelectorAll('#filter-status .chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#filter-status .chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    renderGroups();
  });
});
document.getElementById('search').addEventListener('input', (e) => {
  state.query = e.target.value.trim();
  renderGroups();
});

// ---------- Export / Import / Reset ----------
document.getElementById('btn-export').addEventListener('click', () => {
  const data = JSON.stringify({
    app: 'figuritas-2026',
    exportedAt: new Date().toISOString(),
    counts: state.counts,
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `figuritas-2026-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Progreso exportado');
});
document.getElementById('btn-import').addEventListener('click', () => {
  document.getElementById('file-import').click();
});
document.getElementById('file-import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data && typeof data.counts === 'object') {
      state.counts = data.counts;
      saveState();
      render();
      toast('Progreso importado');
    } else {
      toast('Archivo inválido');
    }
  } catch (err) {
    toast('No pude leer el archivo');
  }
  e.target.value = '';
});
document.getElementById('btn-reset').addEventListener('click', () => {
  if (!confirm('¿Borrar todo el progreso?')) return;
  state.counts = {};
  saveState();
  render();
  toast('Progreso reiniciado');
});

// ---------- Escaneo OCR ----------
const scanModal      = document.getElementById('scan-modal');
const scanPreview    = document.getElementById('scan-preview');
const scanStatus     = document.getElementById('scan-status');
const scanDetected   = document.getElementById('scan-detected');
const scanSuggestions= document.getElementById('scan-suggestions');
const scanCount      = document.getElementById('scan-count');
const fileScan       = document.getElementById('file-scan');

let scanSelections = new Map(); // code -> selected boolean
let lastUnknown = []; // tokens detectados que no coinciden con códigos válidos

document.getElementById('btn-scan').addEventListener('click', () => fileScan.click());
document.getElementById('scan-close').addEventListener('click', closeScanModal);
scanModal.addEventListener('click', (e) => { if (e.target === scanModal) closeScanModal(); });
document.getElementById('scan-select-all').addEventListener('click', () => {
  for (const k of scanSelections.keys()) scanSelections.set(k, true);
  renderSuggestions();
});
document.getElementById('scan-select-none').addEventListener('click', () => {
  for (const k of scanSelections.keys()) scanSelections.set(k, false);
  renderSuggestions();
});
document.getElementById('scan-manual-add').addEventListener('click', () => addManual());
document.getElementById('scan-manual').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); addManual(); }
});
document.getElementById('scan-confirm').addEventListener('click', confirmScan);

function openScanModal() {
  scanSelections = new Map();
  lastUnknown = [];
  scanDetected.hidden = true;
  scanSuggestions.innerHTML = '';
  scanPreview.innerHTML = '<p class="muted">Cargando imagen…</p>';
  scanStatus.textContent = '';
  scanModal.hidden = false;
}
function closeScanModal() {
  scanModal.hidden = true;
  fileScan.value = '';
}

fileScan.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  openScanModal();

  const url = URL.createObjectURL(file);
  scanPreview.innerHTML = `<img src="${url}" alt="figuritas" />`;
  scanStatus.textContent = 'Analizando imagen… (puede tardar unos segundos la primera vez)';

  try {
    const { data } = await Tesseract.recognize(file, 'eng', {
      // Reduce ruido: limitamos a alfanuméricos y espacios.
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
    });
    const text = (data && data.text) ? data.text : '';
    const { found, unknown } = extractCodes(text);
    lastUnknown = unknown;
    if (!found.length) {
      scanStatus.textContent = `No detecté códigos válidos. Texto leído: "${text.replace(/\s+/g,' ').trim().slice(0,80)}". Probá agregando manualmente.`;
      // Igual mostramos el panel para que pueda agregar a mano.
      scanDetected.hidden = false;
      scanCount.textContent = '';
      renderSuggestions();
    } else {
      scanStatus.textContent = `Listo. Detecté ${found.length} código(s).`;
      for (const c of found) scanSelections.set(c, true);
      scanDetected.hidden = false;
      scanCount.textContent = `(${found.length})`;
      renderSuggestions();
    }
  } catch (err) {
    console.error(err);
    scanStatus.textContent = 'Error procesando la imagen. Probá de nuevo o agregá manualmente.';
    scanDetected.hidden = false;
    renderSuggestions();
  }
  URL.revokeObjectURL(url);
  e.target.value = '';
});

// Extrae códigos válidos del texto OCR.
// Soporta: FWC1, FWC 12, LEG 5, ARG 7, etc. También "FWC-12" o "FWC.12".
function extractCodes(rawText) {
  if (!rawText) return { found: [], unknown: [] };
  const text = rawText.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');

  // Posibles prefijos válidos
  const prefixes = new Set(['FWC', 'LEG', ...ALBUM.teamCodes]);

  // Regex: 3 letras seguido (con o sin espacio) por 1-3 dígitos
  const re = /([A-Z]{3})\s*(\d{1,3})/g;
  const found = new Set();
  const unknown = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    const prefix = m[1];
    const num = parseInt(m[2], 10);
    if (!prefixes.has(prefix)) {
      unknown.add(`${prefix} ${num}`);
      continue;
    }
    const max = prefix === 'FWC' ? ALBUM.special.count
              : prefix === 'LEG' ? ALBUM.legends.count
              : ALBUM.perTeam;
    if (num < 1 || num > max) {
      unknown.add(`${prefix} ${num}`);
      continue;
    }
    found.add(`${prefix} ${num}`);
  }
  return { found: [...found], unknown: [...unknown] };
}

function renderSuggestions() {
  scanSuggestions.innerHTML = '';
  const codes = [...scanSelections.keys()].sort();
  for (const code of codes) {
    const selected = scanSelections.get(code);
    const item = document.createElement('label');
    item.className = 'detected-item' + (selected ? ' selected' : '');
    const label = humanLabelForCode(code);
    item.innerHTML = `
      <input type="checkbox" ${selected ? 'checked' : ''} />
      <span><b>${code}</b><br><span class="muted small">${label}</span></span>
    `;
    item.querySelector('input').addEventListener('change', (e) => {
      scanSelections.set(code, e.target.checked);
      item.classList.toggle('selected', e.target.checked);
    });
    scanSuggestions.appendChild(item);
  }
  if (lastUnknown.length) {
    const note = document.createElement('div');
    note.className = 'muted small';
    note.style.gridColumn = '1 / -1';
    note.textContent = 'Detectados pero no válidos: ' + lastUnknown.join(', ');
    scanSuggestions.appendChild(note);
  }
  scanCount.textContent = codes.length ? `(${codes.length})` : '';
}

function humanLabelForCode(code) {
  if (code.startsWith('FWC')) return 'Apertura';
  if (code.startsWith('LEG')) return 'Leyenda';
  const prefix = code.split(' ')[0];
  const team = ALBUM.teams.find(t => t.code === prefix);
  return team ? `${team.flag} ${team.name}` : '?';
}

function addManual() {
  const input = document.getElementById('scan-manual');
  const raw = input.value || '';
  const { found, unknown } = extractCodes(raw);
  if (!found.length) {
    toast(unknown.length ? `Código inválido: ${unknown.join(', ')}` : 'No reconocí ningún código');
    return;
  }
  for (const c of found) scanSelections.set(c, true);
  input.value = '';
  scanDetected.hidden = false;
  renderSuggestions();
}

function confirmScan() {
  const toAdd = [...scanSelections.entries()].filter(([,v]) => v).map(([k]) => k);
  if (!toAdd.length) {
    toast('No seleccionaste ninguna');
    return;
  }
  let nuevas = 0, repes = 0;
  for (const code of toAdd) {
    const prev = state.counts[code] || 0;
    state.counts[code] = prev + 1;
    if (prev === 0) nuevas++; else repes++;
  }
  saveState();
  render();
  closeScanModal();
  toast(`+${toAdd.length} figurita(s): ${nuevas} nueva(s)${repes ? `, ${repes} repe(s)` : ''}`);
}

// ---------- Toast ----------
let toastTimer = null;
function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2400);
}

// ---------- Init ----------
loadState();
if (isLoggedIn()) showApp(); else showLogin();
