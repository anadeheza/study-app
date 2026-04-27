/* =====================
   State
   ===================== */
let selectedMinutes = 25;
let totalSeconds    = 0;
let remainingSeconds = 0;
let timerInterval   = null;
let isPaused        = false;
let isRunning       = false;

let calYear, calMonth, calSelectedDate;
let events = {};
let todos  = [];
let todoId = 0;

/* =====================
   Init
   ===================== */
(function init() {
  const now = new Date();
  calYear         = now.getFullYear();
  calMonth        = now.getMonth();
  calSelectedDate = fmtDate(now);

  renderCal();
  renderTodos();
  renderEvents();
  updateClock();
  setInterval(updateClock, 1000);
})();

/* =====================
   Clock
   ===================== */
function updateClock() {
  const d      = new Date();
  const days   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const h      = String(d.getHours()).padStart(2, '0');
  const m      = String(d.getMinutes()).padStart(2, '0');
  const dayName = days[d.getDay()];
  const dateStr = `${d.getDate()} ${months[d.getMonth()]}`;
  document.getElementById('clockDisplay').textContent =
    `${h}:${m} · ${dayName}, ${dateStr}`;
}

/* =====================
   Time Selection
   ===================== */
function selectTime(min, el) {
  selectedMinutes = min;
  document.querySelectorAll('.time-opt').forEach(e => e.classList.remove('selected'));
  if (el) el.classList.add('selected');
  const customInput = document.getElementById('customMin');
  if (customInput) customInput.value = '';
}

function selectCustom(val) {
  if (!val || val < 1) return;
  selectedMinutes = parseInt(val);
  document.querySelectorAll('.time-opt').forEach(e => e.classList.remove('selected'));
}

/* =====================
   Timer
   ===================== */
function startTimer() {
  if (!selectedMinutes || selectedMinutes < 1) return;

  totalSeconds     = selectedMinutes * 60;
  remainingSeconds = totalSeconds;
  isRunning        = true;
  isPaused         = false;

  updateTimerDisplay();
  updateRing();

  document.getElementById('setupView').style.display = 'none';
  document.getElementById('timerView').style.display = 'flex';
  document.getElementById('pauseBtn').textContent    = 'pausar';

  setStatus('running', 'sesión activa');

  timerInterval = setInterval(tick, 1000);
}

function tick() {
  if (isPaused) return;
  remainingSeconds--;

  if (remainingSeconds <= 0) {
    remainingSeconds = 0;
    clearInterval(timerInterval);
    isRunning = false;
    updateTimerDisplay();
    updateRing();
    setStatus('done', '¡sesión completada! ✓');
    document.getElementById('timerControls').innerHTML =
      '<button class="ctrl-btn primary" onclick="resetTimer()">nueva sesión</button>';
  } else {
    updateTimerDisplay();
    updateRing();
  }
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById('pauseBtn').textContent = isPaused ? 'continuar' : 'pausar';
  setStatus(
    isPaused ? 'paused' : 'running',
    isPaused ? 'en pausa' : 'sesión activa'
  );
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isPaused  = false;

  document.getElementById('timerView').style.display  = 'none';
  document.getElementById('setupView').style.display  = 'block';

  // Restore original controls
  document.getElementById('timerControls').innerHTML =
    '<button class="ctrl-btn stop" onclick="resetTimer()">detener</button>' +
    '<button class="ctrl-btn primary" id="pauseBtn" onclick="togglePause()">pausar</button>';
}

function updateTimerDisplay() {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  document.getElementById('timerDisplay').textContent =
    String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function updateRing() {
  const circ = 2 * Math.PI * 88;
  const fill = document.getElementById('ringFill');
  fill.style.strokeDasharray  = circ;
  const ratio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
  fill.style.strokeDashoffset = circ * (1 - ratio);
}

function setStatus(cls, txt) {
  const el = document.getElementById('statusText');
  el.className   = 'status-text ' + cls;
  el.textContent = txt;
}

// Init ring on page load
(function initRing() {
  const circ = 2 * Math.PI * 88;
  const fill = document.getElementById('ringFill');
  fill.style.strokeDasharray  = circ;
  fill.style.strokeDashoffset = 0;
})();

/* =====================
   Side Panels
   ===================== */
function toggleTodo() {
  const panel  = document.getElementById('todoPanel');
  const isOpen = panel.classList.contains('open');
  closePanels();
  if (!isOpen) {
    panel.classList.add('open');
    document.getElementById('overlay').classList.add('active');
  }
}

function toggleCal() {
  const panel  = document.getElementById('calPanel');
  const isOpen = panel.classList.contains('open');
  closePanels();
  if (!isOpen) {
    panel.classList.add('open');
    document.getElementById('overlay').classList.add('active');
  }
}

function closePanels() {
  document.getElementById('todoPanel').classList.remove('open');
  document.getElementById('calPanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

/* =====================
   To-Do List
   ===================== */
function addTodo() {
  const input = document.getElementById('todoInput');
  const text  = input.value.trim();
  if (!text) return;
  todos.unshift({ id: todoId++, text, done: false });
  input.value = '';
  renderTodos();
}

function toggleTodoItem(id) {
  const t = todos.find(t => t.id === id);
  if (t) { t.done = !t.done; renderTodos(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos();
}

function renderTodos() {
  const list = document.getElementById('todoList');

  if (todos.length === 0) {
    list.innerHTML = '<div class="todo-empty">sin tareas aún</div>';
    return;
  }

  list.innerHTML = todos.map(t => `
    <div class="todo-item">
      <div class="todo-check ${t.done ? 'done' : ''}" onclick="toggleTodoItem(${t.id})"></div>
      <div class="todo-text ${t.done ? 'done' : ''}" onclick="toggleTodoItem(${t.id})">${escapeHtml(t.text)}</div>
      <button class="todo-del" onclick="deleteTodo(${t.id})">×</button>
    </div>
  `).join('');
}

/* =====================
   Calendar
   ===================== */
function fmtDate(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function calNav(dir) {
  calMonth += dir;
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  if (calMonth > 11) { calMonth = 0;  calYear++; }
  renderCal();
  renderEvents();
}

function renderCal() {
  const monthNames = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];
  const dows = ['lu','ma','mi','ju','vi','sá','do'];

  document.getElementById('calMonthLabel').textContent =
    `${monthNames[calMonth]} ${calYear}`;

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const offset      = (firstDay + 6) % 7; // Monday-first offset
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today       = new Date();

  let html = dows.map(d => `<div class="cal-dow">${d}</div>`).join('');

  // Empty cells before first day
  for (let i = 0; i < offset; i++) {
    html += '<div class="cal-day empty"></div>';
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${calYear}-${calMonth}-${d}`;
    const isToday =
      today.getFullYear() === calYear &&
      today.getMonth()    === calMonth &&
      today.getDate()     === d;
    const hasEv  = events[dateKey] && events[dateKey].length > 0;
    const isSel  = calSelectedDate === dateKey;

    html += `
      <div class="cal-day
        ${isToday ? 'today'     : ''}
        ${hasEv   ? 'has-event' : ''}
        ${isSel   ? 'selected'  : ''}"
        onclick="selectDay(${d})">${d}</div>`;
  }

  document.getElementById('calGrid').innerHTML = html;
}

function selectDay(d) {
  calSelectedDate = `${calYear}-${calMonth}-${d}`;
  renderCal();
  renderEvents();
}

function renderEvents() {
  const list   = document.getElementById('eventList');
  const title  = document.getElementById('calEventsTitle');
  const evs    = events[calSelectedDate] || [];
  const monthNames = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];

  const [, m, d] = calSelectedDate.split('-');
  title.textContent = `${parseInt(d)} ${monthNames[parseInt(m)]}`;

  if (evs.length === 0) {
    list.innerHTML = '<div class="no-events">sin eventos</div>';
    return;
  }

  list.innerHTML = evs.map((ev, i) => `
    <div class="event-item">
      <div class="event-dot"></div>
      <span>${escapeHtml(ev)}</span>
      <button class="event-del" onclick="deleteEvent(${i})">×</button>
    </div>
  `).join('');
}

function addEvent() {
  const input = document.getElementById('eventInput');
  const text  = input.value.trim();
  if (!text) return;
  if (!events[calSelectedDate]) events[calSelectedDate] = [];
  events[calSelectedDate].push(text);
  input.value = '';
  renderCal();
  renderEvents();
}

function deleteEvent(i) {
  events[calSelectedDate].splice(i, 1);
  renderCal();
  renderEvents();
}

/* =====================
   Utilities
   ===================== */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
