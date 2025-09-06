// 全局變量
let timers = {
    1: { interval: null, running: false, seconds: 60, total: 60, autoRestart: true },
    2: { interval: null, running: false, seconds: 120, total: 120, autoRestart: false },
    3: { interval: null, running: false, seconds: 150, total: 150, autoRestart: false },
    4: { interval: null, running: false, seconds: 240, total: 240, autoRestart: false }
};
let lootAssignments = {};
let bonLooters = [];

// 預定義顏色陣列 - 高對比度、易區分、減少紅色系
const playerColors = [
    '#4ECDC4',  // 青綠色
    '#45B7D1',  // 天藍色
    '#96CEB4',  // 薄荷綠
    '#FFEAA7',  // 金黃色
    '#DDA0DD',  // 紫色
    '#98D8C8',  // 淺綠
    '#F7DC6F',  // 檸檬黃
    '#BB8FCE',  // 薰衣草
    '#85C1E9',  // 淺藍色
    '#27AE60',  // 翠綠色
    '#8E44AD',  // 深紫色
    '#16A085',  // 深青色
    '#32CD32',  // 酸橙綠
    '#FFD700',  // 金色
    '#9370DB',  // 中紫色
    '#20B2AA',  // 淺海綠
    '#00BFFF',  // 深天藍
    '#8A2BE2',  // 藍紫色
    '#00FF7F',  // 春綠色
    '#1E90FF',  // 道奇藍
    '#9932CC',  // 深蘭花紫
    '#00FA9A',  // 中春綠
    '#00CED1',  // 深青藍色
    '#FF6B6B',  // 鮮紅色（僅作為備用）
    '#F39C12',  // 橙色（僅作為備用）
    '#FF8C00',  // 深橙色（僅作為備用）
    '#FF1493',  // 深粉紅色（僅作為備用）
    '#FF6347',  // 番茄紅（僅作為備用）
    '#FF4500',  // 橙紅色（僅作為備用）
    '#E74C3C',  // 深紅色（僅作為備用）
    '#D35400',  // 深橙色（僅作為備用）
    '#C0392B',  // 深棕色（僅作為備用）
    '#7D3C98',  // 深藍紫色（僅作為備用）
    '#138D75',  // 深薄荷綠（僅作為備用）
    '#B7950B'   // 深金黃色（僅作為備用）
];

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

// 玩家顏色管理
let playerColorMap = new Map(); // 存儲玩家ID對應的顏色

// 獲取玩家的顏色
function getPlayerColor(playerName) {
    return playerColorMap.get(playerName);
}

// 為新玩家分配顏色
function assignNewPlayerColor(playerName, uniquePlayers) {
    // 獲取已使用的顏色
    const usedColors = new Set(playerColorMap.values());
    
    // 優先使用預定義顏色
    for (let i = 0; i < playerColors.length; i++) {
        const color = playerColors[i];
        if (!usedColors.has(color)) {
            playerColorMap.set(playerName, color);
            return color;
        }
    }
    
    // 如果預定義顏色不夠，生成新顏色
    const newColor = generateDistinctColor(usedColors);
    playerColorMap.set(playerName, newColor);
    return newColor;
}

// 生成與現有顏色區別明顯的新顏色
function generateDistinctColor(usedColors) {
    if (usedColors.size === 0) {
        return `hsl(${Math.random() * 360}, 80%, 60%)`;
    }
    
    let bestColor;
    let bestContrast = 0;
    
    // 嘗試多個HSL顏色，選擇與現有顏色對比度最高的
    for (let i = 0; i < 30; i++) {
        const testColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
        let totalContrast = 0;
        
        usedColors.forEach(usedColor => {
            totalContrast += calculateColorContrast(testColor, usedColor);
        });
        
        const avgContrast = totalContrast / usedColors.size;
        if (avgContrast > bestContrast) {
            bestContrast = avgContrast;
            bestColor = testColor;
        }
    }
    
    return bestColor || `hsl(${Math.random() * 360}, 80%, 60%)`;
}

// 戰利品分配功能
function assignLoot(boxId, playerName) {
    lootAssignments[boxId] = playerName;
    const box = document.querySelector(`[data-box="${boxId}"]`);
    if (box) {
        box.classList.add('assigned');
        box.setAttribute('data-player', playerName);
        
        // 基於玩家ID的顏色分配 - 確保同一個玩家所有寶箱使用相同顏色
        const uniquePlayers = [...new Set(Object.values(lootAssignments))];
        const playerIndex = uniquePlayers.indexOf(playerName);
        
        // 檢查這個玩家是否已經有分配的顏色
        let color = getPlayerColor(playerName);
        
        if (!color) {
            // 如果玩家還沒有顏色，為其分配一個新顏色
            color = assignNewPlayerColor(playerName, uniquePlayers);
        }
        
        // 設置背景色（包含獅子後方的背景填充）
        box.style.backgroundColor = color;
        box.style.borderColor = color;
        box.style.borderWidth = '6px';  // 更粗的邊框
        box.style.color = '#ffffff';
        box.style.boxShadow = `0 8px 20px rgba(0, 0, 0, 0.4), 0 0 30px ${color}`;  // 添加發光效果
        
        // 覆蓋原本的綠色背景，確保顏色完全填充
        box.style.setProperty('--loot-box-bg', color);
        box.style.setProperty('--loot-box-border', color);
        
        // 調試信息
        console.log(`🎨 Chest ${boxId} assigned to ${playerName}, color: ${color}`);
        console.log(`📦 Chest styles:`, {
            backgroundColor: box.style.backgroundColor,
            borderColor: box.style.borderColor,
            borderWidth: box.style.borderWidth,
            boxShadow: box.style.boxShadow,
            cssVarBg: box.style.getPropertyValue('--loot-box-bg'),
            cssVarBorder: box.style.getPropertyValue('--loot-box-border')
        });
        
        // 添加顏色標籤
        let colorLabel = box.querySelector('.color-label');
        if (!colorLabel) {
            colorLabel = document.createElement('div');
            colorLabel.className = 'color-label';
            box.appendChild(colorLabel);
        }
        colorLabel.textContent = playerName;
        colorLabel.style.borderColor = color;
        
        // 使用CSS ::after伪元素显示玩家名称，不需要JavaScript创建元素
    }
}

// 更新遠征隊總覽統計
function updateExpeditionSummary() {
    let totalMembers = 0;
    let totalBucc = 0;
    let totalShad = 0;
    let totalBs = 0;
    let totalTrainee = 0;
    
    // 遍歷所有隊伍的成員
    ['party1', 'party2', 'party3', 'party4'].forEach(partyId => {
        const party = document.getElementById(partyId);
        if (party) {
            party.querySelectorAll('.member-input').forEach(member => {
                const nameInput = member.querySelector('.player-name');
                const jobSelect = member.querySelector('.job-select');
                const lootSelect = member.querySelector('.loot-select');
                
                if (nameInput && nameInput.value.trim()) {
                    totalMembers++;
                    
                    // 統計職業數量
                    if (jobSelect && jobSelect.value) {
                        switch (jobSelect.value) {
                            case 'BUCC':
                                totalBucc++;
                                break;
                            case 'SHAD':
                                totalShad++;
                                break;
                            case 'BS':
                                totalBs++;
                                break;
                        }
                    }
                    
                    // 統計實習生數量
                    if (lootSelect && lootSelect.value === 'trainee') {
                        totalTrainee++;
                    }
                }
            });
        }
    });
    
    // 更新顯示並添加動畫效果
    updateStatWithAnimation('total-members', totalMembers);
    updateStatWithAnimation('total-bucc', totalBucc);
    updateStatWithAnimation('total-shad', totalShad);
    updateStatWithAnimation('total-bs', totalBs);
    updateStatWithAnimation('total-trainee', totalTrainee);
    
    console.log('📊 Expedition summary updated:', {
        totalMembers,
        totalBucc,
        totalShad,
        totalBs,
        totalTrainee
    });
}

// 顯示保存成功提示
function showSaveNotification() {
    // 創建提示元素
    const notification = document.createElement('div');
    notification.textContent = '✅ Data saved successfully!';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #38a169;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease-out;
    `;
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒後自動移除
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// 帶動畫效果的統計更新
function updateStatWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const targetValue = newValue;
    
    // 如果值沒有變化，不需要動畫
    if (currentValue === targetValue) return;
    
    // 添加更新動畫類
    element.classList.add('updating');
    
    // 更新數值
    element.textContent = targetValue;
    
    // 移除動畫類
    setTimeout(() => {
        element.classList.remove('updating');
    }, 500);
}

// 計算兩個顏色的對比度
function calculateColorContrast(color1, color2) {
    // 將顏色轉換為RGB值
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    // 計算歐幾里得距離作為對比度
    const deltaR = rgb1.r - rgb2.r;
    const deltaG = rgb1.g - rgb2.g;
    const deltaB = rgb1.b - rgb2.b;
    
    return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
}

// 將十六進制顏色轉換為RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function clearLoot(boxId) {
    const playerName = lootAssignments[boxId];
    delete lootAssignments[boxId];
    
    const box = document.querySelector(`[data-box="${boxId}"]`);
    if (box) {
        box.classList.remove('assigned');
        box.removeAttribute('data-player');
        
        // 清除顏色樣式，恢復默認樣式
        box.style.backgroundColor = '';
        box.style.borderColor = '';
        box.style.color = '';
        box.style.borderWidth = '';
        box.style.boxShadow = '';
        box.style.removeProperty('--loot-box-bg');
        box.style.removeProperty('--loot-box-border');
        
        // 強制重新計算樣式
        box.style.setProperty('--loot-box-bg', '');
        box.style.setProperty('--loot-box-border', '');
        
        // 移除顏色標籤
        const colorLabel = box.querySelector('.color-label');
        if (colorLabel) {
            colorLabel.remove();
        }
    }
    
    // 檢查這個玩家是否還有其他寶箱，如果沒有則清除其顏色映射
    if (playerName && !Object.values(lootAssignments).includes(playerName)) {
        playerColorMap.delete(playerName);
        console.log(`🗑️ 玩家 ${playerName} 的所有寶箱已清除，顏色映射已移除`);
    }
}

function clearBon() {
    Object.keys(lootAssignments).forEach(boxId => {
        clearLoot(boxId);
    });
    // 清空分配記錄
    lootAssignments = {};
}

function getEligibleBonPlayers() {
    const eligiblePlayers = [];
    const excludedPlayers = [];
    
    console.log('🔍 開始檢查玩家資格...');
    
    document.querySelectorAll('.member-input').forEach((member, index) => {
        const nameInput = member.querySelector('.player-name');
        const lootSelect = member.querySelector('.loot-select');
        
        if (nameInput && nameInput.tagName === 'INPUT' && nameInput.value.trim()) {
            const name = nameInput.value.trim();
            const loot = lootSelect && lootSelect.tagName === 'SELECT' ? lootSelect.value : '';
            
            console.log(`玩家${index + 1}: ${name} | Reward: ${loot || '空白'}`);
            
            // 只有同時填寫ID且選擇BON的玩家才參與分配
            if (loot === 'BON') {
                eligiblePlayers.push(name);
                console.log(`  ✅ ${name} 符合條件，加入分配名單`);
            } else {
                excludedPlayers.push({ name, loot: loot || '空白' });
                console.log(`  ❌ ${name} 不符合條件，原因: ${loot || '空白'}`);
            }
        } else {
            console.log(`玩家${index + 1}: 未填寫或不是輸入框`);
        }
    });
    
    // 输出调试信息
    console.log('🎯 寶箱分配篩選結果:');
    console.log('✅ 參與分配的玩家:', eligiblePlayers);
    console.log('❌ 被排除的玩家:', excludedPlayers);
    console.log('📊 總計:', eligiblePlayers.length + excludedPlayers.length, '人');
    
    return eligiblePlayers;
}

// 判斷兩個寶箱是否相鄰的函數（使用新的配置規則）
function isAdjacentBoxes(box1, box2) {
    const config = treasureAllocationConfig;
    
    // 檢查是否為特殊連接
    const isSpecialConnection = config.rules.connections.special.some(pair => 
        (pair[0] === box1 && pair[1] === box2) || (pair[0] === box2 && pair[1] === box1)
    );
    
    if (isSpecialConnection) {
        return true;
    }
    
    const row1 = box1.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3, E=4, F=5
    const col1 = parseInt(box1[1]) - 1;   // 1=0, 2=1, 3=2, 4=3, 5=4
    const row2 = box2.charCodeAt(0) - 65;
    const col2 = parseInt(box2[1]) - 1;
    
    // 檢查水平相鄰
    if (config.rules.connections.horizontal && row1 === row2 && Math.abs(col1 - col2) === 1) {
        return true;
    }
    
    // 檢查垂直相鄰
    if (config.rules.connections.vertical && col1 === col2 && Math.abs(row1 - row2) === 1) {
        return true;
    }
    
    return false;
}

// 計算兩個寶箱之間的間隔距離（使用新的配置規則）
function calculateGap(box1, box2) {
    const config = treasureAllocationConfig;
    
    // 檢查是否為特殊連接
    const isSpecialConnection = config.rules.connections.special.some(pair => 
        (pair[0] === box1 && pair[1] === box2) || (pair[0] === box2 && pair[1] === box1)
    );
    
    if (isSpecialConnection) {
        return 1; // 特殊連接距離為1
    }
    
    const row1 = box1.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3, E=4, F=5
    const col1 = parseInt(box1[1]) - 1;   // 1=0, 2=1, 3=2, 4=3, 5=4
    const row2 = box2.charCodeAt(0) - 65;
    const col2 = parseInt(box2[1]) - 1;
    
    // 檢查是否為水平相鄰
    if (config.rules.connections.horizontal && row1 === row2 && Math.abs(col1 - col2) === 1) {
        return 1; // 水平相鄰距離為1
    }
    
    // 檢查是否為垂直相鄰
    if (config.rules.connections.vertical && col1 === col2 && Math.abs(row1 - row2) === 1) {
        return 1; // 垂直相鄰距離為1
    }
    
    // 計算曼哈頓距離（水平+垂直距離）
    const rowDistance = Math.abs(row1 - row2);
    const colDistance = Math.abs(col1 - col2);
    
    return rowDistance + colDistance;
}

// 遊戲寶箱分配指令配置
const treasureAllocationConfig = {
    "command": "treasure_allocation",
    "players": 10,                  // 玩家人數 (7–18)
    "rules": {
        "chests": [
            "A1","A2","A3","A4","A5",
            "B1","B2","B3","B4","B5",
            "C1","C2","C3","C4","C5",
            "D1","D2","D3","D4","D5",
            "E1","E2","E3","E4","E5",
            "F1","F2","F3","F4","F5"
        ],
        "connections": {
            "horizontal": true,
            "vertical": true,
            "special": [
                ["A5","C5"], ["C5","E5"],
                ["B1","D1"], ["D1","F1"]
            ]
        },
        "allocation": {
            "minPerPlayer": 1,
            "maxPerPlayer": 5,
            "avgDistribution": true,      // 確保平均
            "maxStepDistance": 3          // 每人區塊 3 步內可完成
        }
    },
    "output": "mapping"              // 輸出結果格式 {player: [chests]}
};

// 精確的寶箱分配方案 - 按照您提供的規則
const preciseAllocationPatterns = {
    6: [
        { player: "P1", boxes: ["A1", "A2", "A3", "A4", "A5"] },
        { player: "P2", boxes: ["B1", "B2", "B3", "B4", "B5"] },
        { player: "P3", boxes: ["C1", "C2", "C3", "C4", "C5"] },
        { player: "P4", boxes: ["D1", "D2", "D3", "D4", "D5"] },
        { player: "P5", boxes: ["E1", "E2", "E3", "E4", "E5"] },
        { player: "P6", boxes: ["F1", "F2", "F3", "F4", "F5"] }
    ],
    7: [
        { player: "P1", boxes: ["A1", "A2", "A3", "A4", "A5"] },
        { player: "P2", boxes: ["B1", "B2", "B3", "B4", "B5"] },
        { player: "P3", boxes: ["C1", "C2", "C3", "C4"] },
        { player: "P4", boxes: ["D2", "D3", "D4", "D5"] },
        { player: "P5", boxes: ["C5", "D1", "E5", "F1"] },
        { player: "P6", boxes: ["E1", "E2", "E3", "E4"] },
        { player: "P7", boxes: ["F2", "F3", "F4", "F5"] }
    ],
    8: [
        { player: "P1", boxes: ["A1", "A2", "A3", "A4"] },
        { player: "P2", boxes: ["B2", "B3", "B4", "B5"] },
        { player: "P3", boxes: ["C1", "C2", "C3", "C4"] },
        { player: "P4", boxes: ["D2", "D3", "D4", "D5"] },
        { player: "P5", boxes: ["F2", "F3", "F4", "F5"] },
        { player: "P6", boxes: ["E1", "E2", "E3", "E4"] },
        { player: "P7", boxes: ["A5", "C5", "E5"] },
        { player: "P8", boxes: ["B1", "D1", "F1"] }
    ],
    9: [
        { player: "P1", boxes: ["A1", "A2", "A3"] },
        { player: "P2", boxes: ["B5", "B4", "B3"] },
        { player: "P3", boxes: ["C1", "C2", "C3"] },
        { player: "P4", boxes: ["D3", "D4", "D5"] },
        { player: "P5", boxes: ["E1", "E2", "E3"] },
        { player: "P6", boxes: ["F3", "F4", "F5"] },
        { player: "P7", boxes: ["A4", "A5", "B1", "B2"] },
        { player: "P8", boxes: ["C4", "C5", "D1", "D2"] },
        { player: "P9", boxes: ["E4", "E5", "F1", "F2"] }
    ],
    10: [
        { player: "P1", boxes: ["A1", "A2", "A3"] },
        { player: "P2", boxes: ["A5", "B2", "B1"] },
        { player: "P3", boxes: ["B3", "B4", "B5"] },
        { player: "P4", boxes: ["A4", "C4", "C5"] },
        { player: "P5", boxes: ["D3", "D4", "D5"] },
        { player: "P6", boxes: ["D1", "D2", "F2"] },
        { player: "P7", boxes: ["E1", "E2", "E3"] },
        { player: "P8", boxes: ["E4", "E5", "F1"] },
        { player: "P9", boxes: ["F3", "F4", "F5"] },
        { player: "P10", boxes: ["C1", "C2", "C3"] }
    ],
    11: [
        { player: "P1", boxes: ["A1", "A2", "A3"] },
        { player: "P2", boxes: ["A4", "A5"] },
        { player: "P3", boxes: ["B5", "B3", "B4"] },
        { player: "P4", boxes: ["B1", "B2"] },
        { player: "P5", boxes: ["C1", "C2", "C3"] },
        { player: "P6", boxes: ["D3", "D4", "D5"] },
        { player: "P7", boxes: ["D1", "D2", "C4"] },
        { player: "P8", boxes: ["C5", "E5"] },
        { player: "P9", boxes: ["E1", "E2", "E3"] },
        { player: "P10", boxes: ["E4", "F1", "F2"] },
        { player: "P11", boxes: ["F5", "F4", "F3"] }
    ],
    12: [
        { player: "P1", boxes: ["A1", "A2", "A3"] },
        { player: "P2", boxes: ["A4", "A5"] },
        { player: "P3", boxes: ["B5", "B3", "B4"] },
        { player: "P4", boxes: ["B1", "B2"] },
        { player: "P5", boxes: ["C1", "C2", "C3"] },
        { player: "P6", boxes: ["C4", "C5"] },
        { player: "P7", boxes: ["D3", "D4", "D5"] },
        { player: "P8", boxes: ["D1", "D2"] },
        { player: "P9", boxes: ["E1", "E2", "E3"] },
        { player: "P10", boxes: ["E4", "E5"] },
        { player: "P11", boxes: ["F1", "F2"] },
        { player: "P12", boxes: ["F4", "F5", "F3"] }
    ],
    13: [
        { player: "P1", boxes: ["A1", "A2"] },
        { player: "P2", boxes: ["A3", "A4"] },
        { player: "P3", boxes: ["A5", "B1"] },
        { player: "P4", boxes: ["B2", "B3"] },
        { player: "P5", boxes: ["B4", "B5"] },
        { player: "P6", boxes: ["C1", "C2", "C3"] },
        { player: "P7", boxes: ["C4", "C5"] },
        { player: "P8", boxes: ["D1", "D2"] },
        { player: "P9", boxes: ["D3", "D4", "D5"] },
        { player: "P10", boxes: ["E1", "E2", "E3"] },
        { player: "P11", boxes: ["E5", "E4"] },
        { player: "P12", boxes: ["F1", "F2"] },
        { player: "P13", boxes: ["F4", "F5", "F3"] }
    ],
    14: [
        { player: "P1", boxes: ["A1", "A2", "A3"] },
        { player: "P2", boxes: ["A4", "A5"] },
        { player: "P3", boxes: ["B5", "B3", "B4"] },
        { player: "P4", boxes: ["B1", "B2"] },
        { player: "P5", boxes: ["C1", "C2"] },
        { player: "P6", boxes: ["C3", "C4"] },
        { player: "P7", boxes: ["C5", "D1"] },
        { player: "P8", boxes: ["D3", "D2"] },
        { player: "P9", boxes: ["D5", "D4"] },
        { player: "P10", boxes: ["E1", "E2"] },
        { player: "P11", boxes: ["E4", "E3"] },
        { player: "P12", boxes: ["E5", "F1"] },
        { player: "P13", boxes: ["F3", "F2"] },
        { player: "P14", boxes: ["F5", "F4"] }
    ],
    15: [
        { player: "P1", boxes: ["A1", "A2"] },
        { player: "P2", boxes: ["A3", "A4"] },
        { player: "P3", boxes: ["A5", "B1"] },
        { player: "P4", boxes: ["B2", "B3"] },
        { player: "P5", boxes: ["B4", "B5"] },
        { player: "P6", boxes: ["C1", "C2"] },
        { player: "P7", boxes: ["C3", "C4"] },
        { player: "P8", boxes: ["C5", "D1"] },
        { player: "P9", boxes: ["D2", "D3"] },
        { player: "P10", boxes: ["D4", "D5"] },
        { player: "P11", boxes: ["E1", "E2"] },
        { player: "P12", boxes: ["E3", "E4"] },
        { player: "P13", boxes: ["E5", "F1"] },
        { player: "P14", boxes: ["F2", "F3"] },
        { player: "P15", boxes: ["F4", "F5"] }
    ],
    16: [
        { player: "P1", boxes: ["A1", "A2"] },
        { player: "P2", boxes: ["A3", "A4"] },
        { player: "P3", boxes: ["A5", "B1"] },
        { player: "P4", boxes: ["B2", "B3"] },
        { player: "P5", boxes: ["B4", "B5"] },
        { player: "P6", boxes: ["C1", "C2"] },
        { player: "P7", boxes: ["C3", "C4"] },
        { player: "P8", boxes: ["C5", "D1"] },
        { player: "P9", boxes: ["D2", "D3"] },
        { player: "P10", boxes: ["D4", "D5"] },
        { player: "P11", boxes: ["E1", "E2"] },
        { player: "P12", boxes: ["E3", "E4"] },
        { player: "P13", boxes: ["E5", "F1"] },
        { player: "P14", boxes: ["F2", "F3"] },
        { player: "P15", boxes: ["F4"] },
        { player: "P16", boxes: ["F5"] }
    ],
    17: [
        { player: "P1", boxes: ["A1", "A2"] },
        { player: "P2", boxes: ["A3", "A4"] },
        { player: "P3", boxes: ["A5", "B1"] },
        { player: "P4", boxes: ["B2", "B3"] },
        { player: "P5", boxes: ["B4", "B5"] },
        { player: "P6", boxes: ["C1", "C2"] },
        { player: "P7", boxes: ["C3", "C4"] },
        { player: "P8", boxes: ["C5", "D1"] },
        { player: "P9", boxes: ["D2", "D3"] },
        { player: "P10", boxes: ["D4", "D5"] },
        { player: "P11", boxes: ["E1", "E2"] },
        { player: "P12", boxes: ["E3", "E4"] },
        { player: "P13", boxes: ["E5", "F1"] },
        { player: "P14", boxes: ["F2"] },
        { player: "P15", boxes: ["F3"] },
        { player: "P16", boxes: ["F4"] },
        { player: "P17", boxes: ["F5"] }
    ],
    18: [
        { player: "P1", boxes: ["A1", "A2"] },
        { player: "P2", boxes: ["A3", "A4"] },
        { player: "P3", boxes: ["A5", "B1"] },
        { player: "P4", boxes: ["B2", "B3"] },
        { player: "P5", boxes: ["B4", "B5"] },
        { player: "P6", boxes: ["C1", "C2"] },
        { player: "P7", boxes: ["C3", "C4"] },
        { player: "P8", boxes: ["C5", "D1"] },
        { player: "P9", boxes: ["D2", "D3"] },
        { player: "P10", boxes: ["D4", "D5"] },
        { player: "P11", boxes: ["E1", "E2"] },
        { player: "P12", boxes: ["E3", "E4"] },
        { player: "P13", boxes: ["E5"] },
        { player: "P14", boxes: ["F4"] },
        { player: "P15", boxes: ["F5"] },
        { player: "P16", boxes: ["F1"] },
        { player: "P17", boxes: ["F2"] },
        { player: "P18", boxes: ["F3"] }
    ]
};

function splitBon() {
    clearBon();
    
    const eligiblePlayers = getEligibleBonPlayers();
    
    if (eligiblePlayers.length === 0) {
        console.log('沒有可用的玩家進行分配');
        return;
    }
    
    if (eligiblePlayers.length < 6 || eligiblePlayers.length > 18) {
        alert(`玩家人數必須在6-18人之間，目前有 ${eligiblePlayers.length} 人`);
        return;
    }
    
    console.log(`✅ 找到 ${eligiblePlayers.length} 個符合條件的玩家`);
    
    // 隨機打亂玩家順序
    const shuffledPlayers = [...eligiblePlayers];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }
    
    // 獲取精確的分配模式
    const pattern = preciseAllocationPatterns[eligiblePlayers.length];
    if (!pattern) {
        console.log('沒有找到對應的分配模式');
        return;
    }
    
    // 按照精確模式分配寶箱
    pattern.forEach((allocation, index) => {
        if (index < shuffledPlayers.length) {
            const playerName = shuffledPlayers[index];
            allocation.boxes.forEach(boxId => {
                assignLoot(boxId, playerName);
            });
        }
    });
    
    console.log(`✅ 精確分配完成：${eligiblePlayers.length} 個玩家`);
    console.log('分配結果：', shuffledPlayers.map((player, index) => 
        `${player}: ${pattern[index].boxes.join(', ')}`
    ));
}

// 測試新的寶箱分配系統
function testTreasureAllocation() {
    console.log('🧪 開始測試新的寶箱分配系統...');
    
    // 測試配置
    const config = treasureAllocationConfig;
    console.log('📋 配置信息:', config);
    
    // 測試相鄰關係
    console.log('🔗 測試相鄰關係:');
    console.log('A1 和 A2 相鄰:', isAdjacentBoxes('A1', 'A2')); // 應該為 true
    console.log('A1 和 B1 相鄰:', isAdjacentBoxes('A1', 'B1')); // 應該為 true
    console.log('A5 和 C5 相鄰:', isAdjacentBoxes('A5', 'C5')); // 應該為 true (特殊連接)
    console.log('B1 和 D1 相鄰:', isAdjacentBoxes('B1', 'D1')); // 應該為 true (特殊連接)
    console.log('A1 和 C1 相鄰:', isAdjacentBoxes('A1', 'C1')); // 應該為 false
    console.log('A1 和 F5 相鄰:', isAdjacentBoxes('A1', 'F5')); // 應該為 false
    
    // 測試距離計算
    console.log('📏 測試距離計算:');
    console.log('A1 和 A2 距離:', calculateGap('A1', 'A2')); // 應該為 1
    console.log('A1 和 B1 距離:', calculateGap('A1', 'B1')); // 應該為 1
    console.log('A5 和 C5 距離:', calculateGap('A5', 'C5')); // 應該為 1 (特殊連接)
    console.log('A1 和 C1 距離:', calculateGap('A1', 'C1')); // 應該為 2
    console.log('A1 和 F5 距離:', calculateGap('A1', 'F5')); // 應該為 9
    
    // 測試寶箱組合生成
    console.log('🎲 測試寶箱組合生成:');
    const twoBoxCombos = generateBoxCombinations(2);
    console.log('2寶箱組合數量:', twoBoxCombos.length);
    console.log('前5個2寶箱組合:', twoBoxCombos.slice(0, 5));
    
    const threeBoxCombos = generateBoxCombinations(3);
    console.log('3寶箱組合數量:', threeBoxCombos.length);
    console.log('前5個3寶箱組合:', threeBoxCombos.slice(0, 5));
    
    console.log('✅ 測試完成！');
}

// 調試Split Bon的輔助函數
function debugSplitBon() {
    console.log('🔧 開始調試Split Bon...');
    
    // 檢查玩家資格
    const eligiblePlayers = getEligibleBonPlayers();
    console.log('🎯 符合條件的玩家:', eligiblePlayers);
    
    if (eligiblePlayers.length === 0) {
        console.log('❌ 沒有符合條件的玩家！');
        console.log('💡 請確保：');
        console.log('   1. 填寫了玩家名稱');
        console.log('   2. 選擇了BON獎勵');
        return;
    }
    
    // 檢查配置
    const config = treasureAllocationConfig;
    console.log('📋 配置信息:', config);
    
    // 檢查寶箱數量
    const totalBoxes = config.rules.chests.length;
    console.log('📦 總寶箱數:', totalBoxes);
    
    // 計算分配
    const baseBoxesPerPlayer = Math.floor(totalBoxes / eligiblePlayers.length);
    const remainingBoxes = totalBoxes % eligiblePlayers.length;
    console.log('📊 基礎分配:', baseBoxesPerPlayer, '個/人');
    console.log('📊 剩餘寶箱:', remainingBoxes, '個');
    
    console.log('✅ 調試完成！如果以上信息都正常，Split Bon應該可以工作。');
}

// 生成寶箱組合的輔助函數（用於測試）
function generateBoxCombinations(count) {
    const config = treasureAllocationConfig;
    const allBoxIds = config.rules.chests;
    const combinations = [];
    
    // 定義相鄰關係
    const getAdjacentBoxes = (boxId) => {
        const adjacent = [];
        const row = boxId.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3, E=4, F=5
        const col = parseInt(boxId[1]) - 1;   // 1=0, 2=1, 3=2, 4=3, 5=4
        
        // 水平相鄰
        if (config.rules.connections.horizontal) {
            if (col > 0) adjacent.push(String.fromCharCode(65 + row) + (col));
            if (col < 4) adjacent.push(String.fromCharCode(65 + row) + (col + 2));
        }
        
        // 垂直相鄰
        if (config.rules.connections.vertical) {
            if (row > 0) adjacent.push(String.fromCharCode(64 + row) + (col + 1));
            if (row < 5) adjacent.push(String.fromCharCode(66 + row) + (col + 1));
        }
        
        // 特殊連接
        config.rules.connections.special.forEach(pair => {
            if (pair[0] === boxId) adjacent.push(pair[1]);
            if (pair[1] === boxId) adjacent.push(pair[0]);
        });
        
        return adjacent.filter(box => allBoxIds.includes(box));
    };
    
    if (count === 1) {
        return allBoxIds.map(box => [box]);
    }
    
    if (count === 2) {
        allBoxIds.forEach(box1 => {
            const adjacent = getAdjacentBoxes(box1);
            adjacent.forEach(box2 => {
                if (box1 < box2) { // 避免重複
                    combinations.push([box1, box2]);
                }
            });
        });
        return combinations;
    }
    
    if (count === 3) {
        allBoxIds.forEach(box1 => {
            const adjacent1 = getAdjacentBoxes(box1);
            adjacent1.forEach(box2 => {
                const adjacent2 = getAdjacentBoxes(box2);
                adjacent2.forEach(box3 => {
                    if (box1 !== box3 && box2 !== box3) {
                        // 檢查三個寶箱是否形成連通區域
                        const boxes = [box1, box2, box3].sort();
                        const key = boxes.join(',');
                        if (!combinations.some(combo => combo.sort().join(',') === key)) {
                            combinations.push(boxes);
                        }
                    }
                });
            });
        });
        return combinations;
    }
    
    return combinations;
}

function pickLuckyWinner() {
    const idPlayers = [];
    document.querySelectorAll('.member-input').forEach(member => {
        const nameInput = member.querySelector('.player-name');
        const jobSelect = member.querySelector('.job-select');
        const lootSelect = member.querySelector('.loot-select');
        
        // 檢查是否填寫了ID、Job、Reward且不是trainee
        if (nameInput && nameInput.tagName === 'INPUT' && nameInput.value.trim()) {
            const name = nameInput.value.trim();
            const job = jobSelect && jobSelect.tagName === 'SELECT' ? jobSelect.value : '';
            const loot = lootSelect && lootSelect.tagName === 'SELECT' ? lootSelect.value : '';
            
            // 只有同時填寫ID、Job、Reward且不是trainee的玩家才加入候選名單
            if (name && job && loot && loot !== 'trainee') {
                idPlayers.push(name);
            }
        }
    });
    
    console.log('🎲 Lucky Winner 候選名單:', idPlayers);
    
    if (idPlayers.length === 0) {
        alert('沒有符合條件的玩家可以選擇！\n需要同時填寫ID、Job、Reward且不是trainee');
        return;
    }
    
    // Randomly select 3 different IDs
    const selectedPlayers = [];
    const tempPlayers = [...idPlayers];
    
    for (let i = 0; i < Math.min(3, tempPlayers.length); i++) {
        const randomIndex = Math.floor(Math.random() * tempPlayers.length);
        selectedPlayers.push(tempPlayers[randomIndex]);
        tempPlayers.splice(randomIndex, 1);
    }
    
    // 使用全局的playerColors陣列（與寶箱分配系統保持一致）
    
    // Create popup notification
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
    
    let winnersHTML = '<div>🎉 Lucky Winners 🎉</div>';
    selectedPlayers.forEach((player, index) => {
        // 根据玩家名称确定颜色索引（与宝箱分配系统保持一致）
        let colorIndex = 0;
        for (let existingPlayer in lootAssignments) {
            if (lootAssignments[existingPlayer] === player) {
                break;
            }
            colorIndex++;
        }
        
        // 获取对应的颜色
        const color = playerColors[colorIndex % playerColors.length] || `hsl(${colorIndex * 137.5 % 360}, 70%, 60%)`;
        
        winnersHTML += `<div style="margin-top: 15px; font-size: 1.5rem;">
            <span style="background: ${color}; color: white; padding: 5px 10px; border-radius: 50%; margin-right: 10px; box-shadow: 0 0 10px ${color};">${index + 1}</span>
            <span style="color: ${color}; font-weight: bold;">${player}</span>
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
    const party1Command = party1Players.length > 0 ? `\`\`\`/pi ${party1Players.join(' ')}\`\`\`` : '';
    const party2Command = party2Players.length > 0 ? `\`\`\`/pi ${party2Players.join(' ')}\`\`\`` : '';
    const party3Command = party3Players.length > 0 ? `\`\`\`/pi ${party3Players.join(' ')}\`\`\`` : '';
    const party4Command = party4Players.length > 0 ? `\`\`\`/pi ${party4Players.join(' ')}\`\`\`` : '';
    
    // 生成狀態信息
    const ssAvailable = shadPlayers.length > 0 ? shadPlayers.join(' ') : '';
    const tlAvailable = buccPlayers.length > 0 ? buccPlayers.join(' ') : '';
    const ressAvailable = bsPlayers.length > 0 ? `\`\`\`/pi ${bsPlayers.join(' ')}\`\`\`` : '';
    
    // 生成完整的 Party Commands 顯示內容
    let commandsDisplay = '';
    
    if (party1Players.length > 0) {
        commandsDisplay += `**Party 1 Leader: ${party1Players.slice(0, 2).join(' ')}**\n`;
        commandsDisplay += `${party1Command}\n\n`;
    }
    
    if (party2Players.length > 0) {
        commandsDisplay += `**Party 2 Leader: ${party2Players.slice(0, 2).join(' ')}**\n`;
        commandsDisplay += `${party2Command}\n\n`;
    }
    
    if (party3Players.length > 0) {
        commandsDisplay += `**Party 3 Leader: ${party3Players.slice(0, 2).join(' ')}**\n`;
        commandsDisplay += `${party3Command}\n\n`;
    }
    
    if (party4Players.length > 0) {
        commandsDisplay += `**Party 4 Leader: ${party4Players.slice(0, 2).join(' ')}**\n`;
        commandsDisplay += `${party4Command}\n\n`;
    }
    
    // 添加 SS order、TL order 和 Res order
    if (ssAvailable) {
        commandsDisplay += `SS order: ${ssAvailable}\n`;
    }
    if (tlAvailable) {
        commandsDisplay += `TL order: ${tlAvailable}\n`;
    }
    if (ressAvailable) {
        commandsDisplay += `Res order/party: ${ressAvailable}\n`;
    }
    
    // 填充到大對話框
    document.getElementById('party-commands-display').value = commandsDisplay;
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
    
    // 更新遠征隊統計
    updateExpeditionSummary();
    
    // 顯示保存成功提示
    showSaveNotification();
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
        
        // 更新遠征隊統計
        updateExpeditionSummary();
    }
}

// 清空所有欄位
function clearAllFields() {
    // 清空所有隊伍的輸入欄位
    ['party1', 'party2', 'party3', 'party4'].forEach(partyId => {
        const party = document.getElementById(partyId);
        if (party) {
            const memberInputs = party.querySelectorAll('.member-input');
            memberInputs.forEach((member, index) => {
                if (index > 0) { // 跳過標題行
                    const nameInput = member.querySelector('.player-name');
                    const jobSelect = member.querySelector('.job-select');
                    const lootSelect = member.querySelector('.loot-select');
                    
                    if (nameInput && nameInput.tagName === 'INPUT') {
                        nameInput.value = '';
                    }
                    if (jobSelect && jobSelect.tagName === 'SELECT') {
                        jobSelect.value = '';
                    }
                    if (lootSelect && jobSelect.tagName === 'SELECT') {
                        lootSelect.value = '';
                    }
                }
            });
        }
    });
    
    // 清空 Party Commands 顯示區域
    const partyCommandsDisplay = document.getElementById('party-commands-display');
    if (partyCommandsDisplay) {
        partyCommandsDisplay.value = '';
    }
    
    // 清空戰利品分配
    lootAssignments = {};
    document.querySelectorAll('.loot-box').forEach(box => {
        box.classList.remove('assigned');
        box.removeAttribute('data-player');
        
        // 清除顏色樣式
        box.style.backgroundColor = '';
        box.style.borderColor = '';
        box.style.color = '';
        box.style.borderWidth = '';
        box.style.boxShadow = '';
        box.style.removeProperty('--loot-box-bg');
        box.style.removeProperty('--loot-box-border');
        
        // 移除顏色標籤
        const colorLabel = box.querySelector('.color-label');
        if (colorLabel) {
            colorLabel.remove();
        }
    });
    
    // 清空玩家顏色映射
    playerColorMap.clear();
    console.log('🗑️ 所有玩家顏色映射已清除');
    
    // 重置計時器到初始狀態
    Object.keys(timers).forEach(timerId => {
        const timer = timers[timerId];
        timer.seconds = timer.total;
        timer.running = false;
        if (timer.interval) {
            clearInterval(timer.interval);
            timer.interval = null;
        }
        updateTimerDisplay(parseInt(timerId));
    });
    
    // 清空本地存儲
    localStorage.removeItem('gameToolData');
    
    // 更新遠征隊統計
    updateExpeditionSummary();
}

function exportData() {
    const data = {
        parties: {}
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
    // 初始化 - 先嘗試加載保存的數據，如果沒有則清空所有欄位
    const savedData = localStorage.getItem('gameToolData');
    if (savedData) {
        console.log('🔄 Found saved data, restoring...');
        loadData();
    } else {
        console.log('🆕 No saved data found, initializing new page...');
        clearAllFields();
    }
    
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
    
    // 監聽輸入變化 - 只更新遠征隊統計，不自動保存
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('player-name') || 
            e.target.classList.contains('loot-select') ||
            e.target.classList.contains('job-select')) {
            // 只更新遠征隊統計，不自動保存
            updateExpeditionSummary();
        }
    });
    
    // 初始化遠征隊統計
    updateExpeditionSummary();
    
    // Create save/load buttons
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
    saveButton.textContent = '💾 Save';
    saveButton.title = 'Save all data to browser local storage';
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
    
    const clearButton = document.createElement('button');
    clearButton.textContent = '🗑️ Clear';
    clearButton.title = 'Clear all data';
    clearButton.onclick = clearAllFields;
    clearButton.style.cssText = `
        background: #e53e3e;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    `;
    
    saveLoadDiv.appendChild(saveButton);
    saveLoadDiv.appendChild(clearButton);
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

// 拖拽功能
let draggedElement = null;
let draggedBoxId = null;
let draggedPlayer = null;
let dragPath = []; // 記錄拖拽路徑

// 初始化拖拽功能
function initializeDragAndDrop() {
    const lootBoxes = document.querySelectorAll('.loot-box');
    
    lootBoxes.forEach(box => {
        // 拖拽開始
        box.addEventListener('dragstart', function(e) {
            draggedElement = this;
            draggedBoxId = this.getAttribute('data-box');
            draggedPlayer = lootAssignments[draggedBoxId] || null;
            dragPath = [draggedBoxId]; // 初始化拖拽路徑
            
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.outerHTML);
            
            console.log(`🚀 開始拖拽: ${draggedBoxId}, 玩家: ${draggedPlayer}`);
        });
        
        // 拖拽結束
        box.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
            
            // 清除所有拖拽相關樣式
            document.querySelectorAll('.loot-box').forEach(b => {
                b.classList.remove('drag-over', 'drag-path', 'drag-target');
            });
            
            // 清除拖拽路徑
            dragPath = [];
            
            draggedElement = null;
            draggedBoxId = null;
            draggedPlayer = null;
            
            console.log('🏁 拖拽結束');
        });
        
        // 拖拽進入目標
        box.addEventListener('dragenter', function(e) {
            e.preventDefault();
            if (this !== draggedElement) {
                const currentBoxId = this.getAttribute('data-box');
                
                // 添加到拖拽路徑
                if (!dragPath.includes(currentBoxId)) {
                    dragPath.push(currentBoxId);
                    console.log(`📍 拖拽路徑: ${dragPath.join(' → ')}`);
                }
                
                // 設置視覺效果
                this.classList.add('drag-over');
                
                // 如果是目標位置，添加特殊樣式
                if (dragPath.length > 1) {
                    this.classList.add('drag-target');
                }
            }
        });
        
        // 拖拽在目標上方
        box.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            // 持續更新拖拽路徑的視覺效果
            if (this !== draggedElement) {
                const currentBoxId = this.getAttribute('data-box');
                if (!dragPath.includes(currentBoxId)) {
                    dragPath.push(currentBoxId);
                    this.classList.add('drag-path');
                }
            }
        });
        
        // 拖拽離開目標
        box.addEventListener('dragleave', function(e) {
            // 只有當真正離開元素時才移除樣式
            if (!this.contains(e.relatedTarget)) {
                this.classList.remove('drag-over', 'drag-target');
                
                // 延遲移除路徑樣式，創造流暢的視覺效果
                setTimeout(() => {
                    if (!this.classList.contains('drag-over')) {
                        this.classList.remove('drag-path');
                    }
                }, 100);
            }
        });
        
        // 放置
        box.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over', 'drag-target', 'drag-path');
            
            if (this !== draggedElement && draggedBoxId) {
                const targetBoxId = this.getAttribute('data-box');
                const targetPlayer = lootAssignments[targetBoxId] || null;
                
                console.log(`🎯 放置: ${draggedBoxId} → ${targetBoxId}`);
                console.log(`🔄 交換玩家: ${draggedPlayer} <-> ${targetPlayer}`);
                console.log(`🛤️ 拖拽路徑: ${dragPath.join(' → ')}`);
                
                // 執行交換
                swapLootAssignments(draggedBoxId, targetBoxId, draggedPlayer, targetPlayer);
            }
        });
    });
}

// 交換寶箱分配
function swapLootAssignments(boxId1, boxId2, player1, player2) {
    try {
        // 保存原有的視覺樣式
        const box1 = document.querySelector(`[data-box="${boxId1}"]`);
        const box2 = document.querySelector(`[data-box="${boxId2}"]`);
        
        if (!box1 || !box2) {
            console.error('❌ 找不到寶箱元素');
            return;
        }
        
        // 保存原有的樣式信息
        const box1Styles = {
            backgroundColor: box1.style.backgroundColor,
            borderColor: box1.style.borderColor,
            borderWidth: box1.style.borderWidth,
            color: box1.style.color,
            boxShadow: box1.style.boxShadow,
            hasPlayer: box1.classList.contains('assigned'),
            playerName: box1.getAttribute('data-player')
        };
        
        const box2Styles = {
            backgroundColor: box2.style.backgroundColor,
            borderColor: box2.style.borderColor,
            borderWidth: box2.style.borderWidth,
            color: box2.style.color,
            boxShadow: box2.style.boxShadow,
            hasPlayer: box2.classList.contains('assigned'),
            playerName: box2.getAttribute('data-player')
        };
        
        // 清除原有分配
        if (player1) {
            clearLoot(boxId1);
        }
        if (player2) {
            clearLoot(boxId2);
        }
        
        // 應用新分配（保持原有顏色）
        if (player1) {
            // 將player1分配到boxId2，但保持player1原本的顏色
            assignLootWithColor(boxId2, player1, box1Styles.backgroundColor, box1Styles.borderColor);
        }
        if (player2) {
            // 將player2分配到boxId1，但保持player2原本的顏色
            assignLootWithColor(boxId1, player2, box2Styles.backgroundColor, box2Styles.borderColor);
        }
        
        console.log(`✅ 交換完成: ${boxId1}(${player2 || '空'}) <-> ${boxId2}(${player1 || '空'})`);
        console.log(`🎨 顏色保持: ${player1}保持原色, ${player2}保持原色`);
        
        // 不自動保存，用戶需要手動點擊Save按鈕
        
    } catch (error) {
        console.error('❌ 交換寶箱分配時出錯:', error);
        alert('交換失敗，請重試');
    }
}

// 帶顏色的寶箱分配函數
function assignLootWithColor(boxId, playerName, backgroundColor, borderColor) {
    lootAssignments[boxId] = playerName;
    const box = document.querySelector(`[data-box="${boxId}"]`);
    if (box) {
        box.classList.add('assigned');
        box.setAttribute('data-player', playerName);
        
        // 使用指定的顏色
        if (backgroundColor) {
            box.style.backgroundColor = backgroundColor;
            box.style.borderColor = borderColor || backgroundColor;
            box.style.borderWidth = '4px';
            box.style.color = '#ffffff';
            box.style.boxShadow = `0 0 10px ${backgroundColor}`;
            
            // 設置CSS變數
            box.style.setProperty('--loot-box-bg', backgroundColor);
            box.style.setProperty('--loot-box-border', borderColor || backgroundColor);
        }
    }
}


// 在頁面載入時初始化拖拽功能
document.addEventListener('DOMContentLoaded', function() {
    // 延遲初始化，確保所有元素都已載入
    setTimeout(initializeDragAndDrop, 100);
});
