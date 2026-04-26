let selectedMinutes = 25;
let totalSecs = 0;
let secondsLeft = 0;
let timerintervall = null;
let isPaused = false;
let isRunning = false;

let calYear, calMonth, calSelDate;
let events = [];
let tasks = [];
let taskId = 0;

//init 
(function init() {
    const ahora = new Date();
    calYear = ahora.getFullYear();
    calMonth = ahora.getMonth();
    calSelDate = fmtDate(ahora);

    renderCal();
    renderTasks();
    renderEvents();
    updateClock();
    setInterval(updateClock, 1000);
})();

//clock
function updateClock() {
    const date = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Satuday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const hour = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const dayName = `${date.getDate()} ${months[date.getMonth()]}`;
    document.getElementById('clockDisplay').textContent = `${h}:${m} · ${dayName}, ${dateStr}`;
}

//time Selection
function selectTime(mins, el) {
    selectedMinutes = mins;
    document.querySelectorAll('.time-opt').forEach(e => e.classList.remove('selected'));
    if(el) el.classList.add('selected');
    const customInput = document.getElementById('customMins');
    if(customInput) customInput.value = "";
}

function selectCustom(val) {
    if(!val || val < 1 || val > 300) return;
    selectedMinutes = parseInt(val);
    document.querySelectorAll('.time-opt').forEach(e => e.classList.remove('selected'));
}

//Timer 
function startTimer() {
    if(!selectedMinutes || selectedMinutes < 1) return;

    totalSecs = selectedMinutes * 60;
    secondsLeft = totalSecs;
    isRunning = true;
    isPaused = false;

    updateTimerDisplay();
    updateRing();

    document.getElementById('setup').style.display = 'none';
    document.getElementById('timer').style.display = 'flex';
    document.getElementById('pauseBtn').textContent = 'pause';

    setStatus('running', 'active session');

    timerintervall = setInterval(tick, 1000);
}

function tick() {
    if(isPaused) return;
    remainingSeconds--;

    if(remainingSeconds <= 0) {
        remainingSeconds = 0;
        clearInterval(timerintervall);
        isRunning = false;
        updateTimerDisplay();
        updateRing();
        setStatus('done', 'You have finished! ✓;)');
        document.getElementById('timerControls').innerHTML = '<button class="ctrl-btn primary" onclick="resetTimer()">New Session</button>';
    } else {
        updateTimerDisplay();
        updateRing();
    }
}

function togglePause() {
    isPaused = true;
    document.getElementById('pauseBtn').textContent = isPaused? 'continue' : 'pause';
    setStatus( 
        isPaused ? 'paused' : 'running'
    );
}

function resetTimer() {
    clearInterval(timerintervall);
    isRunning = false;
    isPaused = false;

    document.getElementById('timer').style.display = 'none';
    document.getElementById('setup').style.display = 'block';

    document.getElementById('timerControls').innerHTML = 
     '<button class="ctrl-btn stop" onclick="resetTimer()">detener</button>' +
    '<button class="ctrl-btn primary" id="pauseBtn" onclick="togglePause()">pausar</button>';
}

function updateTimerDisplay() {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    document.getElementById('timerDisplay').textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function updateRing() {
    const circ = 2 * Math.PI * 88;
    const fill = document.getElementById('ringFill');
    fill.style.strokeDasharray = circ;
    const ratio = totalSecs > 0 ? secondsLeft / totalSecs : 1;
    fill.style.strokeDashoffset = circ * (1-ratio);
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