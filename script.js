document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('timeInput');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const clockDisplay = document.getElementById('clockDisplay');
    const endTimeDisplay = document.getElementById('endTimeDisplay');
    const statusMessage = document.getElementById('statusMessage');
    
    // Elementy kalkulatora
    const tonnageInput = document.getElementById('tonnage');
    const lengthInput = document.getElementById('length');
    const piecesInput = document.getElementById('pieces');
    const calcResults = document.getElementById('calcResults');
    const outWeight = document.getElementById('out-weight');
    const outCounter = document.getElementById('out-counter');
    const outExchange = document.getElementById('out-exchange');
    const outDtex = document.getElementById('out-dtex');
    const outSpools = document.getElementById('out-spools');
    const outUnitWeight = document.getElementById('out-unit-weight');

    const db = {
        "0.5": { spools: 1, cnt1: 20, cnt2: 40, wgt1: 0.159, wgt2: 0.312 },
        "1.0": { spools: 1, cnt1: 20, cnt2: 40, wgt1: 0.159, wgt2: 0.312 },
        "1.5": { spools: 1, cnt1: 26, cnt2: 52, wgt1: 0.201, wgt2: 0.395 },
        "2.0": { spools: 2, cnt1: 20, cnt2: 40, wgt1: 0.395, wgt2: 0.700 },
        "3.0": { spools: 3, cnt1: 20, cnt2: 40, wgt1: 0.478, wgt2: 0.936 },
        "4.0": { spools: 4, cnt1: 20, cnt2: 40, wgt1: 0.638, wgt2: 1.247 },
        "5.0": { spools: 2, cnt1: 26, cnt2: 52, wgt1: 0.804, wgt2: 1.580 },
        "6.0": { spools: 3, cnt1: 22, cnt2: 44, wgt1: 1.040, wgt2: 2.037 },
        "8.0": { spools: 3, cnt1: 30, cnt2: 60, wgt1: 1.372, wgt2: 2.703 }, 
        "10.0":{ spools: 4, cnt1: 30, cnt2: 60, wgt1: 1.830, wgt2: 3.604 },
        "12.0":{ spools: 6, cnt1: 28, cnt2: 56, wgt1: 2.329, wgt2: 4.658 },
        "15.0":{ spools: 6, cnt1: 36, cnt2: 72, wgt1: 2.990, wgt2: 5.980 },
        "20.0":{ spools: 12, cnt1: 26, cnt2: 52, wgt1: 4.326, wgt2: 8.652 },
        "25.0":{ spools: 12, cnt1: 32, cnt2: 64, wgt1: 5.320, wgt2: 10.640 },
        "30.0":{ spools: 12, cnt1: 38, cnt2: 76, wgt1: 6.323, wgt2: 12.646 },
        "35.0":{ spools: 12, cnt1: 44, cnt2: 88, wgt1: 7.320, wgt2: 14.640 },
        "40.0":{ spools: 12, cnt1: 50, cnt2: 100, wgt1: 8.320, wgt2: 16.640 },
        "45.0":{ spools: 12, cnt1: 54, cnt2: 108, wgt1: 8.990, wgt2: 17.980 },
        "50.0":{ spools: 12, cnt1: 64, cnt2: 128, wgt1: 10.649, wgt2: 21.298 },
        "60.0":{ spools: 12, cnt1: 76, cnt2: 152, wgt1: 12.650, wgt2: 25.300 },
        "70.0":{ spools: 12, cnt1: 88, cnt2: 176, wgt1: 14.640, wgt2: 29.280 },
        "80.0":{ spools: 12, cnt1: 100, cnt2: 200, wgt1: 16.640, wgt2: 33.280 },
        "90.0":{ spools: 12, cnt1: 114, cnt2: 228, wgt1: 18.970, wgt2: 37.940 },
        "100.0":{ spools: 12, cnt1: 126, cnt2: 252, wgt1: 20.970, wgt2: 41.940 },
        "125.0":{ spools: 12, cnt1: 160, cnt2: 320, wgt1: 26.620, wgt2: 53.240 },
        "150.0":{ spools: 12, cnt1: 192, cnt2: 384, wgt1: 31.950, wgt2: 63.900 },
        "180.0":{ spools: 12, cnt1: 228, cnt2: 456, wgt1: 37.940, wgt2: 75.880 },
        "200.0":{ spools: 12, cnt1: 252, cnt2: 504, wgt1: 41.930, wgt2: 83.860 },
        "250.0":{ spools: 12, cnt1: 320, cnt2: 640, wgt1: 53.250, wgt2: 106.500 },
        "300.0":{ spools: 12, cnt1: 384, cnt2: 768, wgt1: 63.890, wgt2: 127.780 }
    };

    function saveState() {
        localStorage.setItem('activeTimer_tonnage', tonnageInput.value);
        localStorage.setItem('activeTimer_length', lengthInput.value);
        localStorage.setItem('activeTimer_pieces', piecesInput.value);
        localStorage.setItem('activeTimer_timeInput', timeInput.value);
    }

    function calculateValues(dontShowIfEmpty = false) {
        if (!tonnageInput || !lengthInput || !piecesInput) return;
        if (dontShowIfEmpty && (lengthInput.value === '' || piecesInput.value === '')) return;

        let t_val = tonnageInput.value;
        let L1 = parseFloat(lengthInput.value) || 1.0;
        let pieces = parseInt(piecesInput.value) || 1;

        if (!db[t_val]) return;
        
        let t = db[t_val];

        let m_cnt = t.cnt2 - t.cnt1;
        let add_cnt = t.cnt1 - m_cnt;
        let final_cnt = (m_cnt * L1) + add_cnt;

        let m_wgt = t.wgt2 - t.wgt1;
        let add_wgt = t.wgt1 - m_wgt;
        let final_unit_wgt = (m_wgt * L1) + add_wgt;
        let total_wgt = final_unit_wgt * pieces;

        let isLarge = parseFloat(t_val) >= 5.0;
        let dtex = isLarge ? "132 000" : "66 000";

        let exchange_pieces = Math.floor(t.spools * 15 / final_unit_wgt);

        if (calcResults) calcResults.style.display = 'block';
        if (outDtex) outDtex.textContent = dtex;
        if (outSpools) outSpools.textContent = t.spools + " szt";
        if (outUnitWeight) outUnitWeight.textContent = final_unit_wgt.toFixed(2) + " kg";
        if (outWeight) outWeight.textContent = total_wgt.toFixed(2) + " kg";
        if (outCounter) outCounter.textContent = Math.round(final_cnt);
        if (outExchange) outExchange.textContent = exchange_pieces + " szt";
    }

    if (tonnageInput) tonnageInput.addEventListener('change', () => { calculateValues(); saveState(); });
    if (lengthInput) lengthInput.addEventListener('input', () => { calculateValues(); saveState(); });
    if (piecesInput) piecesInput.addEventListener('input', () => { calculateValues(); saveState(); });
    if (timeInput) timeInput.addEventListener('input', () => { saveState(); });
    
    // Oblicz na starcie, jeśli są domyślne wartości
    calculateValues(true);

    let targetTime = 0;
    let timerInterval = null;
    let isMuted = false;
    let startTimeDate = 0;
    
    let audioCtx = null;
    let alarmTimeout = null;

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

    function scheduleNextBeep() {
        const now = Date.now();
        let remaining = 0;
        if (targetTime > 0) {
            remaining = Math.round((targetTime - now) / 1000);
            if (remaining < 0) remaining = 0;
        }

        let delay = 1000;
        if (remaining === 0) {
            delay = 450;
        } else if (remaining <= 15) {
            delay = 600;
        } else if (remaining <= 30) {
            delay = 800;
        }
        
        playBeep();
        alarmTimeout = setTimeout(scheduleNextBeep, delay);
    }

    function startAlarm() {
        if (alarmTimeout || isMuted) return; 
        scheduleNextBeep();
    }

    function stopAlarm() {
        if (alarmTimeout) {
            clearTimeout(alarmTimeout);
            alarmTimeout = null;
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
            // Zapis do historii po poprawnym zakończeniu timera
            window.finishEarlyAndSave(false);
            
            startTimeDate = 0;
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            clockDisplay.textContent = '00:00:00';
            endTimeDisplay.textContent = 'Koniec: --:--:--';
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
        startTimeDate = Date.now();
        targetTime = startTimeDate + totalMs;

        localStorage.setItem('activeTimer_targetTime', targetTime);
        localStorage.setItem('activeTimer_startTimeDate', startTimeDate);
        localStorage.setItem('activeTimer_running', 'true');
        saveState();

        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';

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
            
            stopAlarm();
            statusMessage.textContent = 'Zakończono i Zapisano.';
            targetTime = 0; 
            
            window.finishEarlyAndSave(false);
        } else {
            stopAlarm();
        }
        
        startTimeDate = 0;
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        clockDisplay.textContent = '00:00:00';
        endTimeDisplay.textContent = 'Koniec: --:--:--';
        document.body.className = '';
    });

    const saveOnEnter = (e) => {
        if (e.key === 'Enter') {
            if (timeInput.value && lengthInput.value && piecesInput.value) {
                // Automatycznie rozpocznij rónież odliczanie
                startBtn.click();
                timeInput.blur();
                piecesInput.blur();
                lengthInput.blur();
                tonnageInput.blur();
            } else {
                statusMessage.textContent = 'Wypełnij wszystkie pola aby wystartować!';
                setTimeout(() => { statusMessage.textContent = ''; }, 3000);
            }
        }
    };

    if (timeInput) timeInput.addEventListener('keyup', saveOnEnter);
    if (tonnageInput) tonnageInput.addEventListener('keyup', saveOnEnter);
    if (lengthInput) lengthInput.addEventListener('keyup', saveOnEnter);
    if (piecesInput) piecesInput.addEventListener('keyup', saveOnEnter);


    // --- ZARZĄDZANIE HISTORIĄ ---
    function getHistory() {
        let historyStr = localStorage.getItem("zawiesia_history");
        try {
            let parsed = JSON.parse(historyStr || "[]");
            if(parsed.length > 0 && typeof parsed[0] === 'string') return [];
            return parsed;
        } catch(e) { return []; }
    }

    function saveToHistory(itemObj) {
        let history = getHistory();
        history.push(itemObj);
        localStorage.setItem("zawiesia_history", JSON.stringify(history));
    }

    window.finishEarlyAndSave = function(isManualSave = false) {
        let t_val = tonnageInput.value;
        let L1 = parseFloat(lengthInput.value) || 1.0;
        let pieces = parseInt(piecesInput.value) || 1;
        let timeHours = parseFloat(timeInput.value) || 0;
        let declaredMins = parseFloat((timeHours * 60).toFixed(1));

        let actualMins = declaredMins;
        if (!isManualSave && startTimeDate > 0) {
            actualMins = parseFloat(((Date.now() - startTimeDate) / 60000).toFixed(1));
        }

        let t = db[t_val];
        if(!t) return;
        let m_wgt = t.wgt2 - t.wgt1;
        let add_wgt = t.wgt1 - m_wgt;
        let final_unit_wgt = (m_wgt * L1) + add_wgt;
        let total_wgt = parseFloat((final_unit_wgt * pieces).toFixed(2));

        let d = new Date();

        saveToHistory({
            id: Date.now(),
            dayStr: d.toLocaleDateString('pl-PL'),
            timeStr: d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            ton: t_val,
            l1: L1,
            pieces: pieces,
            time: declaredMins,
            actualTime: actualMins,
            weight: total_wgt
        });
        
        // Wyczyść po zapisie
        localStorage.removeItem('activeTimer_running');
        localStorage.removeItem('activeTimer_targetTime');
        localStorage.removeItem('activeTimer_startTimeDate');
        localStorage.removeItem('activeTimer_tonnage');
        localStorage.removeItem('activeTimer_length');
        localStorage.removeItem('activeTimer_pieces');
        localStorage.removeItem('activeTimer_timeInput');

        tonnageInput.value = "1.0";
        lengthInput.value = "";
        piecesInput.value = "";
        timeInput.value = "";
        if (calcResults) calcResults.style.display = 'none';
        
        window.renderHistory();
    }

    window.renderHistory = function() {
        let history = getHistory();
        let listDiv = document.getElementById("history-list");
        if(!listDiv) return;
        
        if(history.length === 0) {
            listDiv.innerHTML = '<div style="font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-bottom:15px;">Brak zrobionych zleceń.</div>';
            return;
        }

        let groups = {};
        [...history].reverse().forEach(item => {
            let day = item.dayStr || new Date(item.id).toLocaleDateString('pl-PL');
            let time = item.timeStr || new Date(item.id).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            
            if(!groups[day]) groups[day] = { items: [], totalTime: 0, totalActualTime: 0 };
            
            item.dispDay = day;
            item.dispTime = time;
            item.parsedTime = parseFloat(item.time) || 0;
            item.parsedActualTime = item.actualTime !== undefined ? parseFloat(item.actualTime) : item.parsedTime;
            
            groups[day].items.push(item);
            groups[day].totalTime += item.parsedTime;
            groups[day].totalActualTime += item.parsedActualTime;
        });

        let html = "";
        
        for (let day in groups) {
            let g = groups[day];
            let percent = Math.min((g.totalActualTime / 450) * 100, 100).toFixed(0);
            let overTimeMsg = g.totalActualTime > 450 ? `<span style="color:#f1c40f; margin-left:5px; font-size:12px;">(+${(g.totalActualTime-450).toFixed(1)} min)</span>` : "";

            html += `
            <div class="daily-group">
                <div class="daily-header">
                    <div>📅 ${day}</div>
                    <div class="progress-container">
                        ⏱️ Faktycznie: ${g.totalActualTime.toFixed(1)} / 450 min ${overTimeMsg}
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width:${percent}%; background:${g.totalActualTime >= 450 ? '#f39c12' : '#4ade80'};"></div>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="hist-table">
                        <tr><th>Godz</th><th>Tonaż</th><th>L1 [m]</th><th>Szt.</th><th>Czas (Min)</th><th>Kg</th><th>Opcje</th></tr>
            `;
            
            g.items.forEach(item => {
                html += `<tr>
                    <td data-label="Godz:">${item.dispTime}</td>
                    <td data-label="Tonaż:"><b>${item.ton} t</b></td>
                    <td data-label="L1 [m]:">${item.l1}</td>
                    <td data-label="Szt.:">${item.pieces}</td>
                    <td data-label="Czas:" style="white-space:nowrap; font-size:0.75rem; text-align:right;">
                        <span style="color:#4ade80;">Norma: <b>${item.parsedTime.toFixed(1)}</b></span><br>
                        <span style="color:#fcd34d;">Fakt: <b>${item.parsedActualTime.toFixed(1)}</b></span>
                    </td>
                    <td data-label="Kg:">${item.weight}</td>
                    <td data-label="Opcje:" style="white-space:nowrap; text-align:right;">
                        <button class="btn-icon" style="background:#f39c12; color:white;" onclick="openEdit(${item.id})">✏️</button>
                        <button class="btn-icon" style="background:#ef4444; color:white;" onclick="deleteItem(${item.id})">🗑️</button>
                    </td>
                </tr>`;
            });
            html += `</table></div></div>`;
        }
        
        listDiv.innerHTML = html;
    }

    window.deleteItem = function(id) {
        if(!confirm("Na pewno usunąć to zlecenie z historii?")) return;
        let history = getHistory().filter(i => i.id !== id);
        localStorage.setItem("zawiesia_history", JSON.stringify(history));
        window.renderHistory();
    }

    window.clearHistory = function() {
        if(!confirm("Na pewno wyczyścić CAŁĄ historię ze wszystkich dni?")) return;
        localStorage.removeItem("zawiesia_history");
        window.renderHistory();
    }

    window.openEdit = function(id) {
        let item = getHistory().find(i => i.id === id);
        if(!item) return;
        document.getElementById("edit-id").value = item.id;
        document.getElementById("edit-ton").value = item.ton;
        document.getElementById("edit-l1").value = item.l1;
        document.getElementById("edit-pieces").value = item.pieces;
        document.getElementById("edit-time").value = item.time;
        document.getElementById("edit-modal").style.display = "flex";
    }

    window.closeEdit = function() {
        document.getElementById("edit-modal").style.display = "none";
    }

    window.saveEdit = function() {
        let id = parseInt(document.getElementById("edit-id").value);
        let history = getHistory();
        let index = history.findIndex(i => i.id === id);
        if(index === -1) return;

        let newPieces = parseInt(document.getElementById("edit-pieces").value);
        let newTime = parseFloat(document.getElementById("edit-time").value);

        if(!newPieces || !newTime) return alert("Podaj prawidłowe wartości!");

        let item = history[index];
        let t = db[item.ton];
        let m_wgt = t.wgt2 - t.wgt1;
        let add_wgt = t.wgt1 - m_wgt;
        let final_unit_wgt = (m_wgt * parseFloat(item.l1)) + add_wgt;
        
        item.pieces = newPieces;
        item.time = newTime;
        item.weight = parseFloat((final_unit_wgt * newPieces).toFixed(2));

        history[index] = item;
        localStorage.setItem("zawiesia_history", JSON.stringify(history));
        
        window.closeEdit();
        window.renderHistory();
    }

    window.exportCSV = function() {
        let history = getHistory();
        if(history.length === 0) return alert("Brak danych do wyeksportowania!");

        let csv = "Data;Godzina;Tonaz [t];Dlugosc L1 [m];Sztuki;Czas wykonania (Norma) [min];Czas Faktyczny [min];Laczna waga [kg]\n";
        
        history.forEach(i => {
            let d = i.dayStr || new Date(i.id).toLocaleDateString('pl-PL');
            let t = i.timeStr || new Date(i.id).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            let act = i.actualTime !== undefined ? i.actualTime : i.time;
            csv += `${d};${t};${i.ton};${i.l1};${i.pieces};${i.time};${act};${i.weight}\n`;
        });

        let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement("a");
        let url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `Historia_Czasomierz_${new Date().toLocaleDateString('pl-PL').replace(/\\./g, '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Restore z localStorage w razie ubicia karty
    if (localStorage.getItem('activeTimer_running') === 'true') {
        if (localStorage.getItem('activeTimer_tonnage')) tonnageInput.value = localStorage.getItem('activeTimer_tonnage');
        if (localStorage.getItem('activeTimer_length')) lengthInput.value = localStorage.getItem('activeTimer_length');
        if (localStorage.getItem('activeTimer_pieces')) piecesInput.value = localStorage.getItem('activeTimer_pieces');
        if (localStorage.getItem('activeTimer_timeInput')) timeInput.value = localStorage.getItem('activeTimer_timeInput');
        
        targetTime = parseInt(localStorage.getItem('activeTimer_targetTime'), 10) || 0;
        startTimeDate = parseInt(localStorage.getItem('activeTimer_startTimeDate'), 10) || 0;
        
        calculateValues();
        
        if (targetTime > 0) {
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            
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
            
            updateDisplay();
            timerInterval = setInterval(updateDisplay, 1000);
        }
    }

    // Uruchom na start
    window.renderHistory();
});
