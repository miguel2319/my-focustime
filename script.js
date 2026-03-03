// ============================================
// CONFIGURAÇÕES DE TEMPO
// ============================================
let timeLeft = 0;
let timerId = null;
let lastTickTime = null;

const slider           = document.getElementById('timeSlider');
const timerDisplay     = document.getElementById('timer');
const music            = document.getElementById('bg-music');
const musicNameDisplay = document.getElementById('music-name');
const waveSpans        = document.querySelectorAll('.sound-wave span');
const playIcon         = document.getElementById('playIcon');
const pauseIcon        = document.getElementById('pauseIcon');

const videos  = ["videos/01.mp4","videos/03.mp4","videos/04.mp4","videos/05.mp4","videos/06.mp4","videos/07.mp4","videos/08.mp4"];
const musicas = ["musicas/lofi.mp3","musicas/Piano.mp3"];

let currentVideoIndex = 0;
let currentMusicIndex = 0;

const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// ============================================
// VÍDEOS — lazy loading
// ============================================
const heroSection = document.querySelector('.hero-section') || document.body;

const preloadedVideos = videos.map((src, i) => {
    const v = document.createElement('video');
    v.loop = true; v.muted = true; v.playsInline = true;
    v.setAttribute('playsinline','');
    v.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;opacity:0;transition:opacity 0.4s ease;filter:brightness(0.6) blur(5px);transform:scale(1.05);pointer-events:none;';
    if (i === 0) { v.src = src; v.preload = 'auto'; v.style.opacity = '1'; }
    else if (!isMobile && i <= 2) { v.src = src; v.preload = 'metadata'; }
    else { v.dataset.src = src; v.preload = 'none'; }
    heroSection.appendChild(v);
    return v;
});

preloadedVideos[0].play().catch(() => {});

// ============================================
// MÚSICA
// ============================================
music.src = musicas[0];
if (musicNameDisplay) musicNameDisplay.innerText = musicas[0].split('/').pop().toUpperCase();

// ============================================
// ONDAS SONORAS
// ============================================
let waveAnimId = null;
const currentHeights = Array(waveSpans.length).fill(6);
const targetHeights  = Array(waveSpans.length).fill(6);

function animateWaves() {
    waveSpans.forEach((span, i) => {
        if (!music.paused) {
            if (Math.random() > 0.92) {
                const peaks = [12,28,10,32,18];
                targetHeights[i] = Math.random() * peaks[i % peaks.length] + 8;
            }
            currentHeights[i] += (targetHeights[i] - currentHeights[i]) * 0.15;
            targetHeights[i]  *= 0.94;
            span.style.height  = currentHeights[i] + 'px';
            span.style.opacity = currentHeights[i] > 10 ? '1' : '0.5';
        } else {
            currentHeights[i] += (6 - currentHeights[i]) * 0.1;
            span.style.height  = currentHeights[i] + 'px';
            span.style.opacity = '0.3';
        }
    });
    waveAnimId = requestAnimationFrame(animateWaves);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (waveAnimId) { cancelAnimationFrame(waveAnimId); waveAnimId = null; } }
    else { if (!waveAnimId && waveSpans.length) animateWaves(); }
});

if (waveSpans.length) animateWaves();

// ============================================
// TIMER
// ============================================
function startTimer() {
    if (timerId !== null || timeLeft <= 0) return;
    slider.style.pointerEvents = 'none';
    slider.style.opacity = '0.7';
    lastTickTime = Date.now();
    timerId = setInterval(() => {
        const now = Date.now();
        timeLeft -= (now - lastTickTime) / 1000;
        lastTickTime = now;
        if (timeLeft < 0) timeLeft = 0;
        updateDisplay();
        if (timeLeft <= 0) {
            stopTimer();
            timerDisplay.innerText = 'Finished';
            if (navigator.vibrate) navigator.vibrate([200,100,200]);
        }
    }, 250);
}

function stopTimer() {
    clearInterval(timerId); timerId = null; lastTickTime = null;
    slider.style.pointerEvents = 'auto'; slider.style.opacity = '1';
}

function pauseTimer() { stopTimer(); }

function resetTimer() { stopTimer(); timeLeft = 0; slider.value = 0; updateDisplay(); }

slider.addEventListener('input', function() { timeLeft = parseFloat(this.value) * 60; updateDisplay(); });

function updateDisplay() {
    const total = Math.ceil(timeLeft);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    timerDisplay.innerText = String(hrs).padStart(2,'0') + ':' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
    slider.value = timeLeft / 60;
}

// ============================================
// MÚSICA CONTROLES
// ============================================
function toggleMusic() {
    if (music.paused) {
        music.play();
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
    } else {
        music.pause();
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    }
}

function nextMusic() { currentMusicIndex = (currentMusicIndex + 1) % musicas.length; updateMusic(); }
function prevMusic() { currentMusicIndex = (currentMusicIndex - 1 + musicas.length) % musicas.length; updateMusic(); }

function updateMusic(customName) {
    const isPlaying = !music.paused;
    music.src = musicas[currentMusicIndex];
    if (musicNameDisplay)
        musicNameDisplay.innerText = (customName || musicas[currentMusicIndex].split('/').pop()).toUpperCase();
    if (isPlaying) {
        music.play();
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
    }
}

// ============================================
// BACKGROUNDS
// ============================================
function loadVideo(index) {
    const v = preloadedVideos[index];
    if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
}

function updateBackground() {
    preloadedVideos.forEach(v => { v.style.opacity = '0'; v.pause(); });
    loadVideo(currentVideoIndex);
    const cur = preloadedVideos[currentVideoIndex];
    const show = () => {
        cur.style.opacity = '1';
        cur.play().catch(() => {});
        loadVideo((currentVideoIndex + 1) % videos.length);
    };
    cur.readyState >= 3 ? show() : cur.addEventListener('canplay', function h() { show(); cur.removeEventListener('canplay', h); });
}

function nextBackground() { currentVideoIndex = (currentVideoIndex + 1) % videos.length; updateBackground(); }
function prevBackground() { currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length; updateBackground(); }

// ============================================
// INIT
// ============================================
updateDisplay();
updateBackground();

// ============================================
// TRANSIÇÃO DE PÁGINAS
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    requestAnimationFrame(() => requestAnimationFrame(() => { document.body.style.opacity = '1'; }));
});

window.addEventListener('pageshow', () => { document.body.style.opacity = '1'; });

document.querySelectorAll('a').forEach(link => {
    if (link.hostname === window.location.hostname) {
        link.addEventListener('click', e => {
            e.preventDefault();
            const href = link.href;
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '0';
            setTimeout(() => window.location.href = href, 350);
        });
    }
});

// ============================================
// AD + UPLOAD
// ============================================
function minimizeAd() { const ad = document.getElementById('ad-container'); if (ad) ad.classList.toggle('ad-minimized'); }

function handleCustomMusic(event) {
    const file = event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    musicas.push(url);
    currentMusicIndex = musicas.length - 1;
    music.src = url;
    if (musicNameDisplay) musicNameDisplay.innerText = file.name.toUpperCase();
    music.play();
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
}
