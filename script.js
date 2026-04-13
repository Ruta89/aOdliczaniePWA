document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('timeInput');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const muteBtn = document.getElementById('muteBtn');
    const clockDisplay = document.getElementById('clockDisplay');
    const endTimeDisplay = document.getElementById('endTimeDisplay');
    const statusMessage = document.getElementById('statusMessage');

    let targetTime = 0;
    let timerInterval = null;
    let isMuted = false;
    
    let audioCtx = null;
    let alarmInterval = null;

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker registered.', reg.scope))
                .catch(err => console.log('Service Worker registration failed:', err));
        });
    }

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playBeep() {
        if (!audioCtx || isMuted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
    }

    function startAlarm() {
        if (alarmInterval) return; 
        playBeep();
        alarmInterval = setInterval(playBeep, 1000);
    }

    function stopAlarm() {
        if (alarmInterval) {
            clearInterval(alarmInterval);
            alarmInterval = null;
        }
    }

    function formatTime(seconds) {
        if (seconds < 0) seconds = 0;
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(Math.floor(seconds % 60)).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function updateBackground(remainingSeconds) {
        document.body.className = '';
        if (remainingSeconds < 60 && remainingSeconds >= 0) {
            document.body.classList.add('bg-red');
        } else if (remainingSeconds < 180 && remainingSeconds >= 0) {
            document.body.classList.add('bg-yellow');
        }
    }

    function updateDisplay() {
        if (targetTime === 0) return;
        
        const now = Date.now();
        const remainingStr = Math.round((targetTime - now) / 1000);
        let remaining = parseInt(remainingStr, 10);
        
        if (remaining < 0) remaining = 0;

        clockDisplay.textContent = formatTime(remaining);
        updateBackground(remaining);

        if (remaining < 60 && remaining > 0) {
            startAlarm();
        }

        if (remaining === 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            document.body.className = 'bg-red'; 
            statusMessage.textContent = '⏱ Czas dobiegł końca!';
            showNotification();
            startAlarm(); 
            // Alarm gra dopóki go nie wyłączymy
        }
    }

    function showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Czas dobiegł końca!', {
                body: 'Odliczanie zakończone.',
                icon: 'icons/icon-192x192.png'
            });
        }
    }

    startBtn.addEventListener('click', () => {
        initAudio();
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        let valStr = timeInput.value.replace(',', '.'); // Allow comma as decimal separator too
        const val = parseFloat(valStr);

        if (isNaN(val) || val <= 0) {
            statusMessage.textContent = 'Podaj poprawny dodatni czas dziesiętny.';
            return;
        }

        statusMessage.textContent = '';
        stopAlarm();
        
        const totalMs = Math.floor(val * 3600 * 1000);
        targetTime = Date.now() + totalMs;

        const endD = new Date(targetTime);
        const today = new Date();
        const isSameDay = endD.getDate() === today.getDate() && endD.getMonth() === today.getMonth() && endD.getFullYear() === today.getFullYear();
        
        const endH = String(endD.getHours()).padStart(2, '0');
        const endM = String(endD.getMinutes()).padStart(2, '0');
        const endS = String(endD.getSeconds()).padStart(2, '0');
        
        if (isSameDay) {
            endTimeDisplay.textContent = `Koniec o: ${endH}:${endM}:${endS}`;
        } else {
            const endY = endD.getFullYear();
            const endMo = String(endD.getMonth()+1).padStart(2, '0');
            const endDt = String(endD.getDate()).padStart(2, '0');
            endTimeDisplay.textContent = `Koniec: ${endY}-${endMo}-${endDt} ${endH}:${endM}:${endS}`;
        }

        if (timerInterval) clearInterval(timerInterval);
        
        updateDisplay();
        timerInterval = setInterval(updateDisplay, 1000);
    });

    stopBtn.addEventListener('click', () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            
            // Adjust targetTime dynamically so if we resume it doesn't jump
            // But user wanted "Zatrzymano", we will clear entirely. Wait, "Zatrzymaj" just stops it.
            // If they click Start again, it reads input again.
            stopAlarm();
            statusMessage.textContent = 'Zatrzymano.';
            targetTime = 0; 
        } else {
            stopAlarm();
        }
    });

    resetBtn.addEventListener('click', () => {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        stopAlarm();
        document.body.className = '';
        targetTime = 0;
        timeInput.value = '';
        clockDisplay.textContent = '00:00:00';
        endTimeDisplay.textContent = 'Koniec: --:--:--';
        statusMessage.textContent = '';
    });

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            muteBtn.textContent = 'Włącz dźwięk 🔔';
            muteBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            if (alarmInterval) stopAlarm();
        } else {
            muteBtn.textContent = 'Wycisz 🔕';
            muteBtn.style.background = 'var(--outline)';
            if (targetTime > 0 && Math.round((targetTime - Date.now()) / 1000) < 60) {
                startAlarm();
            }
        }
    });

    muteBtn.textContent = 'Wycisz 🔕';
});
