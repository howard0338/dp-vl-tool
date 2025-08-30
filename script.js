// 全局變量
let timers = {
    1: { interval: null, running: false, seconds: 60, total: 60, autoRestart: true },
    2: { interval: null, running: false, seconds: 120, total: 120, autoRestart: false },
    3: { interval: null, running: false, seconds: 150, total: 150, autoRestart: false },
    4: { interval: null, running: false, seconds: 240, total: 240, autoRestart: false }
};
let lootAssignments = {};
let bonLooters = [];

// 計時器功能
function startTimer(timerId, totalSeconds) {
    const timer = timers[timerId];
    if (!timer.running) {
        timer.running = true;
        timer.seconds = totalSeconds;
        
        timer.interval = setInterval(() => {
            timer.seconds--;
            updateTimerDisplay(timerId);
            
            if (timer.seconds <= 0) {
                if (timer.autoRestart) {
                    // 自動重新開始計時器
                    timer.seconds = timer.total;
                } else {
                    pauseTimer(timerId);
                }
                // 不顯示提醒
            }
        }, 1000);
    }
}

function pauseTimer(timerId) {
    const timer = timers[timerId];
    if (timer.running) {
        timer.running = false;
        clearInterval(timer.interval);
    }
}

function resetTimer(timerId, totalSeconds) {
    const timer = timers[timerId];
    pauseTimer(timerId);
    timer.seconds = totalSeconds;
    timer.total = totalSeconds;
    updateTimerDisplay(timerId);
}

function resetAndStartTimer(timerId, totalSeconds) {
    resetTimer(timerId, totalSeconds);
    startTimer(timerId, totalSeconds);
}

function updateTimerDisplay(timerId) {
    const timer = timers[timerId];
    const minutes = Math.floor(timer.seconds / 60);
    const seconds = timer.seconds % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const timeElement = document.getElementById(`timer${timerId}`);
    timeElement.textContent = timeString;
    
    // 修正：只有最後10秒才顯示紅色，其餘時間顯示綠色
    if (timer.running && timer.seconds <= 10) {
        timeElement.style.color = '#e53e3e'; // 紅色 - 最後10秒
        timeElement.style.fontWeight = 'bold';
    } else {
        timeElement.style.color = '#38a169'; // 綠色 - 其他時間
        timeElement.style.fontWeight = 'normal';
    }
}

// 隊伍管理功能 - 固定6個欄位，無需新增/刪除功能

// 戰利品分配功能
function assignLoot(boxId, playerName) {
    lootAssignments[boxId] = playerName;
    const box = document.querySelector(`[data-box="${boxId}"]`);
    if (box) {
        box.classList.add('assigned');
        box.setAttribute('data-player', playerName);
        
        // 使用CSS ::after伪元素显示玩家名称，不需要JavaScript创建元素
    }
}

function clearLoot(boxId) {
    delete lootAssignments[boxId];
    const box = document.querySelector(`[data-box="${boxId}"]`);
    if (box) {
        box.classList.remove('assigned');
        box.removeAttribute('data-player');
        // 不需要移除JavaScript创建的元素，因为现在使用CSS伪元素
    }
}

function clearBon() {
    Object.keys(lootAssignments).forEach(boxId => {
        clearLoot(boxId);
    });
}

function getEligibleBonPlayers() {
    const eligiblePlayers = [];
    document.querySelectorAll('.member-input').forEach(member => {
        const nameInput = member.querySelector('.player-name');
        const lootSelect = member.querySelector('.loot-select');
        
        if (nameInput && nameInput.tagName === 'INPUT' && nameInput.value.trim()) {
            const name = nameInput.value.trim();
            const loot = lootSelect && lootSelect.tagName === 'SELECT' ? lootSelect.value : '';
            
            // 排除練習生
            if (loot !== '練習生') {
                eligiblePlayers.push(name);
            }
        }
    });
    return eligiblePlayers;
}

function splitBon() {
    clearBon();
    
    // 定義所有寶箱，按相鄰性分組
    const allBoxes = [
        // 左側：ACE
        ['A1', 'A2', 'A3', 'A4', 'A5'],
        ['C1', 'C2', 'C3', 'C4', 'C5'],
        ['E1', 'E2', 'E3', 'E4', 'E5'],
        // 右側：BDF
        ['B1', 'B2', 'B3', 'B4', 'B5'],
        ['D1', 'D2', 'D3', 'D4', 'D5'],
        ['F1', 'F2', 'F3', 'F4', 'F5']
    ];
    
    // 計算每個玩家應該獲得的箱子數量
    const totalBoxes = 30;
    const eligiblePlayers = getEligibleBonPlayers(); // 重新獲取有資格的玩家
    const baseBoxesPerPlayer = Math.floor(totalBoxes / eligiblePlayers.length);
    const remainingBoxes = totalBoxes % eligiblePlayers.length;
    
    // 創建玩家分配列表
    const playerAssignments = [];
    eligiblePlayers.forEach((player, index) => {
        const boxesToAssign = baseBoxesPerPlayer + (index < remainingBoxes ? 1 : 0);
        playerAssignments.push({
            player: player,
            boxes: [],
            targetCount: boxesToAssign
        });
    });
    
    // 隨機打亂玩家順序
    for (let i = playerAssignments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playerAssignments[i], playerAssignments[j]] = [playerAssignments[j], playerAssignments[i]];
    }
    
    // 分配箱子，優先分配相鄰的箱子
    let currentPlayerIndex = 0;
    
    allBoxes.forEach(row => {
        row.forEach(boxId => {
            const currentPlayer = playerAssignments[currentPlayerIndex];
            
            // 如果當前玩家已滿，移到下一個
            if (currentPlayer.boxes.length >= currentPlayer.targetCount) {
                currentPlayerIndex = (currentPlayerIndex + 1) % playerAssignments.length;
            }
            
            // 找到有空間的玩家
            while (playerAssignments[currentPlayerIndex].boxes.length >= playerAssignments[currentPlayerIndex].targetCount) {
                currentPlayerIndex = (currentPlayerIndex + 1) % playerAssignments.length;
            }
            
            // 分配箱子
            playerAssignments[currentPlayerIndex].boxes.push(boxId);
            assignLoot(boxId, playerAssignments[currentPlayerIndex].player);
        });
    });
    
    // 顯示分配結果
    updateSummary();
}

function pickLuckyWinner() {
    const idPlayers = [];
    document.querySelectorAll('.player-name').forEach(input => {
        const name = input.value.trim();
        if (name) {
            idPlayers.push(name);
        }
    });
    
    if (idPlayers.length === 0) {
        alert('沒有ID可以選擇！');
        return;
    }
    
    // 隨機選擇3個不同的ID
    const selectedPlayers = [];
    const tempPlayers = [...idPlayers];
    
    for (let i = 0; i < Math.min(3, tempPlayers.length); i++) {
        const randomIndex = Math.floor(Math.random() * tempPlayers.length);
        selectedPlayers.push(tempPlayers[randomIndex]);
        tempPlayers.splice(randomIndex, 1);
    }
    
    // 創建彈出通知
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b6b, #ee5a52);
        color: white;
        padding: 30px;
        border-radius: 15px;
        font-size: 1.2rem;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: fadeIn 0.5s ease-out;
    `;
    
    let winnersHTML = '<div>🎉 幸運得主 🎉</div>';
    selectedPlayers.forEach((player, index) => {
        winnersHTML += `<div style="margin-top: 15px; font-size: 1.5rem;">
            <span style="background: white; color: #ff6b6b; padding: 5px 10px; border-radius: 50%; margin-right: 10px;">${index + 1}</span>
            ${player}
        </div>`;
    });
    
    notification.innerHTML = winnersHTML + `
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: #ff6b6b;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 20px;
        ">確定</button>
    `;
    
    document.body.appendChild(notification);
    
    // 5秒後自動移除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// 生成組隊指令
function generatePartyCommand() {
    const party1Players = [];
    const party2Players = [];
    const party3Players = [];
    const party4Players = [];
    const shadPlayers = [];
    const buccPlayers = [];
    const bsPlayers = [];
    
    // 收集各隊伍的玩家和職業信息
    document.querySelectorAll('#party1 .player-name').forEach(input => {
        if (input.value.trim()) {
            party1Players.push(input.value.trim());
        }
    });
    
    document.querySelectorAll('#party2 .player-name').forEach(input => {
        if (input.value.trim()) {
            party2Players.push(input.value.trim());
        }
    });
    
    document.querySelectorAll('#party3 .player-name').forEach(input => {
        if (input.value.trim()) {
            party3Players.push(input.value.trim());
        }
    });
    
    document.querySelectorAll('#party4 .player-name').forEach(input => {
        if (input.value.trim()) {
            party4Players.push(input.value.trim());
        }
    });
    
    // 收集職業信息
    document.querySelectorAll('.member-input').forEach(member => {
        const nameInput = member.querySelector('.player-name');
        const jobSelect = member.querySelector('.job-select');
        
        if (nameInput && nameInput.tagName === 'INPUT' && nameInput.value.trim()) {
            const name = nameInput.value.trim();
            const job = jobSelect && jobSelect.tagName === 'SELECT' ? jobSelect.value : '';
            
            if (job === 'SHAD') {
                shadPlayers.push(name);
            } else if (job === 'BUCC') {
                buccPlayers.push(name);
            } else if (job === 'BS') {
                bsPlayers.push(name);
            }
        }
    });
    
    // 生成各隊伍的組隊指令
    const party1Command = party1Players.length > 0 ? `'''/pi ${party1Players.join(' ')}'''` : '';
    const party2Command = party2Players.length > 0 ? `'''/pi ${party2Players.join(' ')}'''` : '';
    const party3Command = party3Players.length > 0 ? `'''/pi ${party3Players.join(' ')}'''` : '';
    const party4Command = party4Players.length > 0 ? `'''/pi ${party4Players.join(' ')}'''` : '';
    
    // 生成狀態信息
    const ssAvailable = shadPlayers.length > 0 ? `'''/pi ${shadPlayers.join(' ')}'''` : '';
    const tlAvailable = buccPlayers.length > 0 ? `'''/pi ${buccPlayers.join(' ')}'''` : '';
    const ressAvailable = bsPlayers.length > 0 ? `'''/pi ${bsPlayers.join(' ')}'''` : '';
    
    // 填充各隊伍的leader欄位
    document.getElementById('party1-leader').value = party1Command;
    document.getElementById('party2-leader').value = party2Command;
    document.getElementById('party3-leader').value = party3Command;
    document.getElementById('party4-leader').value = party4Command;
    
    // 填充狀態欄位
    document.getElementById('ss-available').value = ssAvailable;
    document.getElementById('tl-available').value = tlAvailable;
    document.getElementById('ress-available').value = ressAvailable;
}

// 統計摘要功能
function updateSummary() {
    // 計算總玩家數（填寫ID的數量）
    const totalPlayers = document.querySelectorAll('.player-name').filter(input => input.value.trim() !== '').length;
    
    // 計算BON戰利品獲得者
    const bonCount = document.querySelectorAll('.loot-select').filter(select => select.value === 'BON').length;
    
    // 計算BELT戰利品獲得者
    const beltCount = document.querySelectorAll('.loot-select').filter(select => select.value === 'BELT').length;
    
    // 計算訓練生數量
    const traineeCount = document.querySelectorAll('.loot-select').filter(select => select.value === '練習生').length;
    
    // 計算SS數量（職業選單選擇Shad人數）
    const ssCount = document.querySelectorAll('.job-select').filter(select => select.value === 'SHAD').length;
    
    // 計算TL數量（職業選單選擇Bucc人數）
    const tlCount = document.querySelectorAll('.job-select').filter(select => select.value === 'BUCC').length;
    
    // 計算Res數量（職業選單選擇BS人數）
    const resCount = document.querySelectorAll('.job-select').filter(select => select.value === 'BS').length;
    
    // 更新顯示
    document.getElementById('expedition-size').textContent = totalPlayers;
    document.getElementById('bon-count').textContent = bonCount;
    document.getElementById('belt-count').textContent = beltCount;
    document.getElementById('trainee-count').textContent = traineeCount;
    document.getElementById('ss-count').textContent = ssCount;
    document.getElementById('tl-count').textContent = tlCount;
    document.getElementById('res-count').textContent = resCount;
    
    console.log('Summary updated:', { totalPlayers, bonCount, beltCount, traineeCount, ssCount, tlCount, resCount });
}

// 生成摘要功能
function generateSummary() {
    updateSummary();
}

// 數據持久化功能
function saveData() {
    const data = {
        parties: {}
    };
    
    // 保存各隊伍數據
    ['party1', 'party2', 'party3', 'party4'].forEach(partyId => {
        const party = document.getElementById(partyId);
        const members = [];
        party.querySelectorAll('.member-input').forEach(member => {
            const nameInput = member.querySelector('.player-name');
            const jobSelect = member.querySelector('.job-select');
            const lootSelect = member.querySelector('.loot-select');
            
            if (nameInput && nameInput.tagName === 'INPUT' && nameInput.value.trim()) {
                const name = nameInput.value;
                const job = jobSelect && jobSelect.tagName === 'SELECT' ? jobSelect.value : '';
                const loot = lootSelect && lootSelect.tagName === 'SELECT' ? lootSelect.value : '';
                if (name.trim()) {
                    members.push({ name, job, loot });
                }
            }
        });
        data.parties[partyId] = members;
    });
    
    // 保存其他數據
    data.lootAssignments = lootAssignments;
    data.timers = timers;
    
    localStorage.setItem('gameToolData', JSON.stringify(data));
}

function loadData() {
    const savedData = localStorage.getItem('gameToolData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // 恢復各隊伍數據
        Object.keys(data.parties).forEach(partyId => {
            const party = document.getElementById(partyId);
            if (party) {
                // 恢復現有成員欄位
                const memberInputs = party.querySelectorAll('.member-input');
                const members = data.parties[partyId] || [];
                members.forEach((member, index) => {
                    if (index < memberInputs.length) {
                        const nameInput = memberInputs[index].querySelector('.player-name');
                        const jobSelect = memberInputs[index].querySelector('.job-select');
                        const lootSelect = memberInputs[index].querySelector('.loot-select');
                        
                        if (nameInput && nameInput.tagName === 'INPUT') {
                            nameInput.value = member.name || '';
                        }
                        if (jobSelect && jobSelect.tagName === 'SELECT') {
                            jobSelect.value = member.job || '';
                        }
                        if (lootSelect && lootSelect.tagName === 'SELECT') {
                            lootSelect.value = member.loot || '';
                        }
                    }
                });
            }
        });
        
        // 恢復戰利品分配
        if (data.lootAssignments) {
            lootAssignments = data.lootAssignments;
            Object.keys(lootAssignments).forEach(boxId => {
                assignLoot(boxId, lootAssignments[boxId]);
            });
        }
        
        // 恢復計時器
        if (data.timers) {
            timers = data.timers;
            // 更新所有計時器顯示
            Object.keys(timers).forEach(timerId => {
                updateTimerDisplay(parseInt(timerId));
            });
        }
        
        updateSummary();
    }
}

function exportData() {
    const data = {
        parties: {},
        summary: {
            expeditionSize: document.getElementById('expedition-size').textContent,
            bonCount: document.getElementById('bon-count').textContent,
            beltCount: document.getElementById('belt-count').textContent,
            traineeCount: document.getElementById('trainee-count').textContent,
            ssCount: document.getElementById('ss-count').textContent,
            tlCount: document.getElementById('tl-count').textContent,
            resCount: document.getElementById('res-count').textContent
        }
    };
    
    // 收集各隊伍數據
    ['party1', 'party2', 'party3', 'party4'].forEach(partyId => {
        const party = document.getElementById(partyId);
        const members = [];
        party.querySelectorAll('.member-input').forEach(member => {
            const nameInput = member.querySelector('.player-name');
            const jobSelect = member.querySelector('.job-select');
            const lootSelect = member.querySelector('.loot-select');
            
            if (nameInput && nameInput.tagName === 'INPUT' && nameInput.value.trim()) {
                const name = nameInput.value;
                const job = jobSelect && jobSelect.tagName === 'SELECT' ? jobSelect.value : '';
                const loot = lootSelect && lootSelect.tagName === 'SELECT' ? lootSelect.value : '';
                if (name.trim()) {
                    members.push({ name, job, loot });
                }
            }
        });
        data.parties[partyId] = members;
    });
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'game-tool-data.json';
    link.click();
    URL.revokeObjectURL(url);
}

// 事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    loadData();
    updateSummary();
    
    // 確保所有玩家名稱輸入框能夠接受所有字符（包括數字）
    document.querySelectorAll('.player-name').forEach(input => {
        // 強制設置為文本輸入框
        input.setAttribute('type', 'text');
        input.removeAttribute('pattern');
        input.removeAttribute('inputmode');
        input.removeAttribute('maxlength');
        input.removeAttribute('minlength');
        
        // 移除任何可能的輸入限制，允許所有字符包括數字
        input.addEventListener('keydown', function(e) {
            // 允許所有按鍵，包括數字
            e.stopPropagation();
        });
        
        // 移除任何可能的輸入驗證
        input.addEventListener('input', function(e) {
            // 允許任何輸入
            e.stopPropagation();
        });
        
        // 確保輸入框可以接受數字
        input.addEventListener('keypress', function(e) {
            // 允許任何按鍵
            e.stopPropagation();
        });
    });
    
    // 監聽輸入變化
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('player-name') || 
            e.target.classList.contains('loot-select') ||
            e.target.classList.contains('job-select') ||
            e.target.id === 'ss-available' ||
            e.target.id === 'tl-available' ||
            e.target.id === 'ress-available') {
            saveData();
            updateSummary();
        }
    });
    
    // 創建保存/載入按鈕
    const saveLoadDiv = document.createElement('div');
    saveLoadDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 1000;
    `;
    
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';
    saveButton.onclick = saveData;
    saveButton.style.cssText = `
        background: #4299e1;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    `;
    
    const exportButton = document.createElement('button');
    exportButton.textContent = '匯出';
    exportButton.onclick = exportData;
    exportButton.style.cssText = `
        background: #38a169;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    `;
    
    saveLoadDiv.appendChild(saveButton);
    saveLoadDiv.appendChild(exportButton);
    document.body.appendChild(saveLoadDiv);
});

// 鍵盤快捷鍵
document.addEventListener('keydown', function(e) {
    // 數字鍵1-4控制對應計時器
    if (e.code >= 'Digit1' && e.code <= 'Digit4') {
        const timerId = parseInt(e.code.replace('Digit', ''));
        const timer = timers[timerId];
        
        if (e.ctrlKey) {
            // Ctrl + 數字鍵重置計時器
            e.preventDefault();
            resetTimer(timerId, timer.total);
        } else if (e.shiftKey) {
            // Shift + 數字鍵暫停計時器
            e.preventDefault();
            pauseTimer(timerId);
        } else {
            // 數字鍵開始計時器
            e.preventDefault();
            if (!timer.running) {
                startTimer(timerId, timer.total);
            }
        }
    }
    
    // 空格鍵控制所有計時器
    if (e.code === 'Space') {
        e.preventDefault();
        Object.keys(timers).forEach(timerId => {
            const timer = timers[parseInt(timerId)];
            if (timer.running) {
                pauseTimer(parseInt(timerId));
            } else {
                startTimer(parseInt(timerId), timer.total);
            }
        });
    }
});
