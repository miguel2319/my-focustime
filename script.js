// --- CONFIGURAÇÕES DE TEMPO ---
let timeLeft = 0;
let timerId = null;
let lastTickTime = null; // timestamp do último ciclo

const slider = document.getElementById('timeSlider');
const timerDisplay = document.getElementById('timer');
const music = document.getElementById('bg-music');
const musicNameDisplay = document.getElementById('music-name');
const waveSpans = document.querySelectorAll('.sound-wave span');

const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");

// --- LISTAS ---
const videos = [
    "videos/01.mp4",
    "videos/03.mp4",
    "videos/04.mp4",
    "videos/05.mp4",
    "videos/06.mp4",
    "videos/07.mp4",
    "videos/08.mp4"
];
const musicas = ["musicas/lofi.mp3","musicas/Piano.mp3"];

let currentVideoIndex = 0;
let currentMusicIndex = 0;

// --- PRÉ-CARREGAMENTO DE VÍDEOS ---
const preloadedVideos = videos.map((src, i) => {
    const video = document.createElement("video");
    video.src = src;
    video.autoplay = false; // só toca quando necessário
    video.loop = true;
    video.muted = true;
    video.preload = "auto";
    video.style.position = "fixed";
    video.style.top = "0";
    video.style.left = "0";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.zIndex = "-1";
    video.style.opacity = i === currentVideoIndex ? "1" : "0"; // apenas o atual visível
    video.style.transition = "opacity 0.4s ease";
	video.style.filter = "blur(5px)"; // <-- ajuste o valor que quiser
video.style.transform = "scale(1.05)"; // evita bordas aparecendo com blur
    document.body.appendChild(video);
    return video;
});

// --- INICIAR MÚSICA ---
music.src = musicas[0];
musicNameDisplay.innerText = musicas[0].split('/').pop().toUpperCase();

// --- ANIMAÇÃO DAS ONDAS ---
let currentHeights = Array(waveSpans.length).fill(6);
let targetHeights = Array(waveSpans.length).fill(6);

function animateWaves(){
    waveSpans.forEach((span, index)=>{
        if(!music.paused){
            if(Math.random() > 0.92){
                const peaks = [12, 28, 10, 32, 18];
                targetHeights[index] = Math.random() * peaks[index % peaks.length] + 8;
            }
            currentHeights[index] += (targetHeights[index] - currentHeights[index]) * 0.15;
            targetHeights[index] *= 0.94;
            span.style.height = `${currentHeights[index]}px`;
            span.style.opacity = currentHeights[index] > 10 ? "1" : "0.5";
        }else{
            currentHeights[index] += (6 - currentHeights[index]) * 0.1;
            span.style.height = `${currentHeights[index]}px`;
            span.style.opacity = "0.3";
        }
    });
    requestAnimationFrame(animateWaves);
}
animateWaves();

// --- TIMER ---
function startTimer() {
    if (timerId !== null || timeLeft <= 0) return;

    slider.style.pointerEvents = "none";
    slider.style.opacity = "0.7";

    lastTickTime = Date.now();

    timerId = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickTime;
        lastTickTime = now;

        if (timeLeft > 0) {
            timeLeft -= delta / 1000;
            if (timeLeft < 0) timeLeft = 0;
            updateDisplay();
        }

        if (timeLeft <= 0) {
            stopTimer();
            timerDisplay.innerText = "Finished";
        }
    }, 100);
}

function stopTimer() {
    clearInterval(timerId);
    timerId = null;
    lastTickTime = null;
    slider.style.pointerEvents = "auto";
    slider.style.opacity = "1";
}

slider.oninput = function(){
    timeLeft = parseFloat(this.value) * 60;
    updateDisplay();
};

function updateDisplay(){
    const total = Math.ceil(timeLeft);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    timerDisplay.innerText =
        `${hrs.toString().padStart(2,"0")}:`+
        `${mins.toString().padStart(2,"0")}:`+
        `${secs.toString().padStart(2,"0")}`;
    slider.value = timeLeft / 60;
}

// --- MÚSICA CONTROLES ---
function toggleMusic(){
    if(music.paused){
        music.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
    }else{
        music.pause();
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
    }
}

function nextMusic(){
    currentMusicIndex = (currentMusicIndex + 1) % musicas.length;
    updateMusic();
}

function prevMusic(){
    currentMusicIndex = (currentMusicIndex - 1 + musicas.length) % musicas.length;
    updateMusic();
}

function updateMusic(customName = null){
    const isPlaying = !music.paused;
    music.src = musicas[currentMusicIndex];
    musicNameDisplay.innerText =
        (customName || musicas[currentMusicIndex].split('/').pop()).toUpperCase();
    
    if(isPlaying){
        music.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
    } else {
        music.pause();
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
    }
}

// --- BACKGROUND OTIMIZADO ---
function updateBackground() {
    preloadedVideos.forEach((vid, i) => {
        vid.style.opacity = "0";
        vid.pause();
    });

    const currentVideo = preloadedVideos[currentVideoIndex];
    
    if (currentVideo.readyState >= 3) {
        // Já carregado, troca imediatamente
        currentVideo.style.opacity = "1";
        currentVideo.play();
    } else {
        // Aguarda carregar e mostra
        currentVideo.addEventListener('canplay', function handler() {
            currentVideo.style.opacity = "1";
            currentVideo.play();
            currentVideo.removeEventListener('canplay', handler);
        });
    }
}

function nextBackground(){
    currentVideoIndex = (currentVideoIndex + 1) % preloadedVideos.length;
    updateBackground();
}

function prevBackground(){
    currentVideoIndex = (currentVideoIndex - 1 + preloadedVideos.length) % preloadedVideos.length;
    updateBackground();
}

// --- INICIAR DISPLAY ---
updateDisplay();
updateBackground();

// --- TRANSIÇÃO SUAVE ENTRE PÁGINAS ---
window.addEventListener("pageshow", () => {
    document.body.style.opacity = "1";
});

window.addEventListener("load", () => {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";
    setTimeout(() => document.body.style.opacity = "1", 50);
});

document.querySelectorAll("a").forEach(link => {
    if(link.hostname === window.location.hostname){
        link.addEventListener("click", e => {
            e.preventDefault();
            const href = link.href;
            document.body.style.transition = "opacity 0.3s ease";
            document.body.style.opacity = "0";
            setTimeout(() => window.location.href = href, 400);
        });
    }
});

// --- AD MINIMIZE ---
function minimizeAd(){
    const ad = document.getElementById("ad-container");
    ad.classList.toggle("ad-minimized");
}

// --- MÚSICA CUSTOM ---
function handleCustomMusic(event){
    const file = event.target.files[0];
    if(file){
        const musicURL = URL.createObjectURL(file);
        musicas.push(musicURL);
        currentMusicIndex = musicas.length - 1;
        music.src = musicURL;
        musicNameDisplay.innerText = file.name.toUpperCase();
        music.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
    }
}