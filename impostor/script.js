/* ============================================================
   EL IMPOSTOR — EDICIÓN FÚTBOL  ·  Lógica del juego
   HTML + CSS + JS vanilla, sin frameworks.
   ============================================================ */

"use strict";

/* ---------- Lista precargada de jugadores famosos ---------- */
const FUTBOLISTAS = [
  "Messi", "Cristiano Ronaldo", "Neymar", "Mbappé", "Haaland",
  "Modric", "Kroos", "Salah", "Lewandowski", "Suárez",
  "Di María", "Julián Álvarez", "Dibu Martínez", "Maradona", "Pelé",
  "Zidane", "Ronaldinho", "Kaká", "Beckham", "Rooney",
  "Xavi", "Iniesta", "Ramos", "Buffon", "Benzema",
  "Griezmann", "Tévez", "Riquelme", "Palermo", "Lautaro Martínez"
];

/* ---------- Estado de la partida ---------- */
const state = {
  players: 4,            // cantidad de participantes
  impostors: 1,          // cantidad de impostores
  names: [],             // nombres ingresados (opcional)
  current: 0,            // índice del turno actual (0..players-1)
  chosen: "",            // futbolista elegido para la ronda
  lastChosen: "",        // último futbolista (para no repetir en "Nueva partida")
  impostorSet: new Set(),// índices de turno que son impostores
  soundOn: true          // sonido activado
};

/* ---------- Atajos al DOM ---------- */
const $ = (sel) => document.querySelector(sel);

const screens = {
  setup: $("#screen-setup"),
  turn: $("#screen-turn"),
  final: $("#screen-final")
};

const el = {
  cfgPlayers: $("#cfg-players"),
  cfgImpostors: $("#cfg-impostors"),
  namesList: $("#names-list"),
  setupHint: $("#setup-hint"),
  btnGenerate: $("#btn-generate"),
  btnCopy: $("#btn-copy"),
  btnSound: $("#btn-sound"),
  turnCounter: $("#turn-counter"),
  turnName: $("#turn-name"),
  card: $("#card"),
  cardBack: $("#card-back"),
  roleText: $("#role-text"),
  btnNext: $("#btn-next"),
  btnNewgame: $("#btn-newgame"),
  btnConfig: $("#btn-config"),
  toast: $("#toast")
};

/* ============================================================
   SONIDO (Web Audio API, sin archivos externos)
   ============================================================ */
let audioCtx = null;

/** Reproduce un tono corto. type: 'tap' | 'reveal' | 'impostor' */
function playSound(type) {
  if (!state.soundOn) return;
  try {
    // El AudioContext debe crearse tras un gesto del usuario.
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const presets = {
      tap:      { freq: 520, dur: 0.08, vol: 0.18, wave: "triangle" },
      reveal:   { freq: 660, dur: 0.22, vol: 0.22, wave: "sine" },
      impostor: { freq: 180, dur: 0.32, vol: 0.25, wave: "sawtooth" }
    };
    const p = presets[type] || presets.tap;

    osc.type = p.wave;
    osc.frequency.setValueAtTime(p.freq, now);
    if (type === "reveal") osc.frequency.exponentialRampToValueAtTime(p.freq * 1.5, now + p.dur);

    gain.gain.setValueAtTime(p.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + p.dur);
  } catch (e) {
    /* Si el navegador bloquea el audio, simplemente seguimos sin sonido. */
  }
}

/* ============================================================
   UTILIDADES
   ============================================================ */

/** Muestra una pantalla y oculta el resto, con transición. */
function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("is-active"));
  screens[name].classList.add("is-active");
}

/** Devuelve un entero aleatorio en [0, max). */
function randInt(max) {
  return Math.floor(Math.random() * max);
}

/** Aviso temporal (toast). */
let toastTimer = null;
function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("is-show"), 1800);
}

/* ============================================================
   CONFIGURACIÓN: steppers y nombres
   ============================================================ */

/** Reconstruye los inputs de nombres según la cantidad de jugadores. */
function renderNameInputs() {
  // Guardamos lo ya escrito para no perderlo al cambiar la cantidad.
  const previos = Array.from(el.namesList.querySelectorAll(".name-input")).map((i) => i.value);
  el.namesList.innerHTML = "";

  for (let i = 0; i < state.players; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "name-input";
    input.placeholder = `Jugador ${i + 1}`;
    input.maxLength = 24;
    input.value = previos[i] || "";
    el.namesList.appendChild(input);
  }
}

/** Maneja los botones +/− de jugadores e impostores. */
function onStep(kind, dir) {
  if (kind === "players") {
    state.players = Math.min(20, Math.max(2, state.players + dir));
    el.cfgPlayers.textContent = state.players;
    // Los impostores nunca pueden igualar/superar a los jugadores.
    if (state.impostors >= state.players) {
      state.impostors = state.players - 1;
      el.cfgImpostors.textContent = state.impostors;
    }
    renderNameInputs();
  } else {
    state.impostors = Math.min(state.players - 1, Math.max(1, state.impostors + dir));
    el.cfgImpostors.textContent = state.impostors;
  }
  validateSetup();
  playSound("tap");
}

/** Valida la configuración y devuelve true/false. */
function validateSetup() {
  if (state.impostors >= state.players) {
    el.setupHint.textContent = "Tiene que haber más jugadores que impostores.";
    return false;
  }
  el.setupHint.textContent = "";
  return true;
}

/* ============================================================
   FLUJO DEL JUEGO
   ============================================================ */

/** Inicia una ronda eligiendo futbolista e impostores al azar. */
function startRound(avoidRepeat) {
  // Tomamos los nombres ingresados (o vacío si no se escribió).
  state.names = Array.from(el.namesList.querySelectorAll(".name-input"))
    .map((i) => i.value.trim());

  // Elegimos un futbolista, evitando repetir el de la ronda anterior.
  let pick;
  do {
    pick = FUTBOLISTAS[randInt(FUTBOLISTAS.length)];
  } while (avoidRepeat && pick === state.lastChosen && FUTBOLISTAS.length > 1);
  state.chosen = pick;
  state.lastChosen = pick;

  // Asignamos impostores aleatoriamente entre los índices de turno.
  state.impostorSet = pickImpostors(state.players, state.impostors);

  state.current = 0;
  renderTurn();
  showScreen("turn");
}

/** Devuelve un Set con N índices de impostor distintos (mezcla Fisher-Yates). */
function pickImpostors(total, count) {
  const idxs = Array.from({ length: total }, (_, i) => i);
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
  }
  return new Set(idxs.slice(0, count));
}

/** Dibuja el turno actual con la carta tapada. */
function renderTurn() {
  const i = state.current;
  el.turnCounter.textContent = `Jugador ${i + 1} de ${state.players}`;
  el.turnName.textContent = state.names[i] || `Jugador ${i + 1}`;

  // Reseteamos la carta a "tapada" sin animación visible.
  el.card.classList.remove("is-flipped");
  el.cardBack.classList.remove("is-impostor");
  el.roleText.classList.remove("is-impostor");
  el.btnNext.classList.add("is-hidden");

  // Ajustamos la etiqueta del botón si es el último jugador.
  el.btnNext.textContent =
    i === state.players - 1 ? "Ver resultado" : "Siguiente jugador";
}

/** Voltea la carta y revela el rol del jugador actual. */
function revealRole() {
  if (el.card.classList.contains("is-flipped")) return; // ya revelada
  const esImpostor = state.impostorSet.has(state.current);

  if (esImpostor) {
    el.roleText.textContent = "Sos el impostor";
    el.cardBack.classList.add("is-impostor");
    el.roleText.classList.add("is-impostor");
    playSound("impostor");
  } else {
    el.roleText.textContent = state.chosen; // nombre del futbolista
    playSound("reveal");
  }

  el.card.classList.add("is-flipped");
  el.btnNext.classList.remove("is-hidden");
}

/** Pasa al siguiente jugador o a la pantalla final. */
function nextPlayer() {
  playSound("tap");
  state.current++;
  if (state.current >= state.players) {
    showScreen("final");
  } else {
    renderTurn();
    showScreen("turn");
  }
}

/* ============================================================
   ACCIONES SECUNDARIAS
   ============================================================ */

/** Copia la lista de futbolistas al portapapeles. */
async function copyList() {
  const texto = FUTBOLISTAS.join(", ");
  try {
    await navigator.clipboard.writeText(texto);
    showToast("Lista copiada ✅");
  } catch {
    // Fallback para navegadores sin permiso de portapapeles.
    const ta = document.createElement("textarea");
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("Lista copiada ✅");
  }
  playSound("tap");
}

/** Activa/desactiva el sonido. */
function toggleSound() {
  state.soundOn = !state.soundOn;
  el.btnSound.setAttribute("aria-pressed", String(state.soundOn));
  el.btnSound.textContent = state.soundOn ? "🔊 Sonido" : "🔇 Silencio";
  if (state.soundOn) playSound("tap");
}

/* ============================================================
   EVENTOS
   ============================================================ */
function bindEvents() {
  // Steppers +/−
  document.querySelectorAll(".stepper__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onStep(btn.dataset.step, Number(btn.dataset.dir));
    });
  });

  // Generar jugador → empieza la ronda
  el.btnGenerate.addEventListener("click", () => {
    if (!validateSetup()) return;
    playSound("tap");
    startRound(false);
  });

  // Carta: revelar al tocar (click o teclado)
  el.card.addEventListener("click", revealRole);
  el.card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      revealRole();
    }
  });

  // Siguiente jugador
  el.btnNext.addEventListener("click", nextPlayer);

  // Nueva partida → nuevo futbolista distinto, misma config
  el.btnNewgame.addEventListener("click", () => {
    playSound("tap");
    startRound(true);
  });

  // Volver a configuración
  el.btnConfig.addEventListener("click", () => {
    playSound("tap");
    showScreen("setup");
  });

  // Opciones
  el.btnCopy.addEventListener("click", copyList);
  el.btnSound.addEventListener("click", toggleSound);
}

/* ============================================================
   INICIO
   ============================================================ */
function init() {
  el.cfgPlayers.textContent = state.players;
  el.cfgImpostors.textContent = state.impostors;
  renderNameInputs();
  bindEvents();
}

init();
