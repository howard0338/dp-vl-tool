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
    
    document.querySelectorAll('.member-input').forEach(member => {
        const nameInput = member.querySelector('.player-name');
        const lootSelect = member.querySelector('.loot-select');
        
        if (nameInput && nameInput.tagName === 'INPUT' && nameInput.value.trim()) {
            const name = nameInput.value.trim();
            const loot = lootSelect && lootSelect.tagName === 'SELECT' ? lootSelect.value : '';
            
            // 只有同時填寫ID且選擇BON的玩家才參與分配
            if (loot === 'BON') {
                eligiblePlayers.push(name);
            } else {
                excludedPlayers.push({ name, loot: loot || '空白' });
            }
        }
    });
    
    // 输出调试信息
    console.log('🎯 寶箱分配篩選結果:');
    console.log('✅ 參與分配的玩家:', eligiblePlayers);
    console.log('❌ 被排除的玩家:', excludedPlayers);
    console.log('📊 總計:', eligiblePlayers.length + excludedPlayers.length, '人');
    
    // 詳細檢查每個玩家的狀態
    document.querySelectorAll('.member-input').forEach((member, index) => {
        const nameInput = member.querySelector('.player-name');
        const lootSelect = member.querySelector('.loot-select');
        
        if (nameInput && lootSelect) {
            const name = nameInput.value.trim();
            const loot = lootSelect.value;
            const status = loot === 'BON' ? '✅ 參與' : loot === '' ? '❌ 空白' : `❌ ${loot}`;
            console.log(`玩家${index + 1}: ${name || '未填寫'} | Reward: ${loot || '空白'} | ${status}`);
        }
    });
    
    return eligiblePlayers;
}

// 判斷兩個寶箱是否相鄰的函數
function isAdjacentBoxes(box1, box2) {
    // 水平相鄰
    if (box1[0] === box2[0]) { // 同一列
        const num1 = parseInt(box1[1]);
        const num2 = parseInt(box2[1]);
        return Math.abs(num1 - num2) === 1;
    }
    
    // 允許的垂直相鄰
    // 左側垂直相鄰
    if ((box1 === 'A5' && box2 === 'C5') || (box1 === 'C5' && box2 === 'A5')) return true;
    if ((box1 === 'C5' && box2 === 'E5') || (box1 === 'E5' && box2 === 'C5')) return true;
    if ((box1 === 'A4' && box2 === 'C4') || (box1 === 'C4' && box2 === 'A4')) return true;
    if ((box1 === 'C4' && box2 === 'E4') || (box1 === 'E4' && box2 === 'C4')) return true;
    
    // 右側垂直相鄰
    if ((box1 === 'B1' && box2 === 'D1') || (box1 === 'D1' && box2 === 'B1')) return true;
    if ((box1 === 'D1' && box2 === 'F1') || (box1 === 'F1' && box2 === 'D1')) return true;
    if ((box1 === 'B2' && box2 === 'D2') || (box1 === 'D2' && box2 === 'B2')) return true;
    if ((box1 === 'D2' && box2 === 'F2') || (box1 === 'F2' && box2 === 'D2')) return true;
    
    return false;
}

// 計算兩個寶箱之間的間隔距離
function calculateGap(box1, box2) {
    const row1 = box1.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3, E=4, F=5
    const col1 = parseInt(box1[1]) - 1;   // 1=0, 2=1, 3=2, 4=3, 5=4
    const row2 = box2.charCodeAt(0) - 65;
    const col2 = parseInt(box2[1]) - 1;
    
    // 檢查是否為不連通的方塊對（間隔為5格）
    const nonConnectedPairs = [
        ['A1', 'C1'], ['C1', 'A1'], ['A2', 'C2'], ['C2', 'A2'],
        ['C1', 'E1'], ['E1', 'C1'], ['C2', 'E2'], ['E2', 'C2'],
        ['B4', 'D4'], ['D4', 'B4'], ['B5', 'D5'], ['D5', 'B5'],
        ['D4', 'F4'], ['F4', 'D4'], ['D5', 'F5'], ['F5', 'D5']
    ];
    
    // 如果是不連通的方塊對，間隔為5格
    if (nonConnectedPairs.some(pair => pair[0] === box1 && pair[1] === box2)) {
        return 5; // 不連通的方塊對間隔為5格
    }
    
    // 檢查是否為垂直相鄰（間隔為1格）
    const verticalAdjacentPairs = [
        ['A5', 'C5'], ['C5', 'A5'], ['C5', 'E5'], ['E5', 'C5'],  // 左側垂直相鄰
        ['B1', 'D1'], ['D1', 'B1'], ['D1', 'F1'], ['F1', 'D1'],  // 右側垂直相鄰
        ['A4', 'C4'], ['C4', 'A4'], ['C4', 'E4'], ['E4', 'C4'],  // 左側中間垂直相鄰
        ['B2', 'D2'], ['D2', 'B2'], ['D2', 'F2'], ['F2', 'D2']   // 右側中間垂直相鄰
    ];
    
    // 如果是垂直相鄰，間隔為1格
    if (verticalAdjacentPairs.some(pair => pair[0] === box1 && pair[1] === box2)) {
        return 1; // 垂直相鄰間隔為1格
    }
    
    // 檢查是否為跨行垂直（間隔為3格）
    const crossRowVerticalPairs = [
        ['A1', 'B1'], ['B1', 'A1'], ['A2', 'B2'], ['B2', 'A2'], ['A3', 'B3'], ['B3', 'A3'], ['A4', 'B4'], ['B4', 'A4'], ['A5', 'B5'], ['B5', 'A5'],
        ['B1', 'C1'], ['C1', 'B1'], ['B2', 'C2'], ['C2', 'B2'], ['B3', 'C3'], ['C3', 'B3'], ['B4', 'C4'], ['C4', 'B4'], ['B5', 'C5'], ['C5', 'B5'],
        ['C1', 'D1'], ['D1', 'C1'], ['C2', 'D2'], ['D2', 'C2'], ['C3', 'D3'], ['D3', 'C3'], ['C4', 'D4'], ['D4', 'C4'], ['C5', 'D5'], ['D5', 'C5'],
        ['D1', 'E1'], ['E1', 'D1'], ['D2', 'E2'], ['E2', 'D2'], ['D3', 'E3'], ['E3', 'D3'], ['D4', 'E4'], ['E4', 'D4'], ['D5', 'E5'], ['E5', 'D5'],
        ['E1', 'F1'], ['F1', 'E1'], ['E2', 'F2'], ['F2', 'E2'], ['E3', 'F3'], ['F3', 'E3'], ['E4', 'F4'], ['F4', 'E4'], ['E5', 'F5'], ['F5', 'E5']
    ];
    
    // 如果是跨行垂直，間隔為3格
    if (crossRowVerticalPairs.some(pair => pair[0] === box1 && pair[1] === box2)) {
        return 3; // 跨行垂直間隔為3格
    }
    
    // 檢查是否為禁止跨區配對的箱子（間隔為5格）
    const forbiddenCrossZonePairs = [
        // A行禁止跨區配對
        ['A1', 'A3'], ['A3', 'A1'],
        // B行禁止跨區配對
        ['B3', 'B5'], ['B5', 'B3'],
        // C行禁止跨區配對
        ['C1', 'C3'], ['C3', 'C1'],
        // D行禁止跨區配對
        ['D3', 'D5'], ['D5', 'D3'],
        // E行禁止跨區配對
        ['E1', 'E3'], ['E3', 'E1'],
        // F行禁止跨區配對
        ['F3', 'F5'], ['F5', 'F3']
    ];
    
    // 如果是禁止跨區配對的箱子，間隔為5格
    if (forbiddenCrossZonePairs.some(pair => pair[0] === box1 && pair[1] === box2)) {
        return 5; // 禁止跨區配對，間隔為5格
    }
    
    // 計算曼哈頓距離（水平+垂直距離）
    const rowDistance = Math.abs(row1 - row2);
    const colDistance = Math.abs(col1 - col2);
    
    return rowDistance + colDistance;
}

function splitBon() {
    clearBon();
    
    // 计算每个玩家应该获得的箱子数量
    const totalBoxes = 30;
    const eligiblePlayers = getEligibleBonPlayers();
    
    if (eligiblePlayers.length === 0) {
        console.log('没有可用的玩家进行分配');
        return;
    }
    
    // 随机打乱玩家顺序
    const shuffledPlayers = [...eligiblePlayers];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }
    
    // 计算每个玩家的宝箱数量（2或3个）
    const baseBoxesPerPlayer = Math.floor(totalBoxes / eligiblePlayers.length);
    const remainingBoxes = totalBoxes % eligiblePlayers.length;
    
    // 创建玩家分配列表
    const playerAssignments = [];
    shuffledPlayers.forEach((player, index) => {
        const boxesToAssign = baseBoxesPerPlayer + (index < remainingBoxes ? 1 : 0);
        playerAssignments.push({
            player: player,
            boxes: [],
            targetCount: boxesToAssign
        });
    });
    
    console.log('玩家分配顺序（随机后）：', shuffledPlayers);
    console.log('宝箱分配数量：', playerAssignments.map(p => `${p.player}: ${p.targetCount}个`));
    
    // 定义所有可能的宝箱组合
    const allBoxIds = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5',
                       'C1', 'C2', 'C3', 'C4', 'C5', 'D1', 'D2', 'D3', 'D4', 'D5',
                       'E1', 'E2', 'E3', 'E4', 'E5', 'F1', 'F2', 'F3', 'F4', 'F5'];
    
    // 检查是否为10人且全部3宝箱的特殊情况
    const isSpecialCase = eligiblePlayers.length === 10 && playerAssignments.every(p => p.targetCount === 3);
    
    // 检查是否为15人且全部2宝箱的特殊情况
    const isFifteenPlayerCase = eligiblePlayers.length === 15 && playerAssignments.every(p => p.targetCount === 2);
    
    if (isSpecialCase) {
        console.log('检测到特殊情况：10人且全部3宝箱，使用特殊组合规则');
        
        // 特殊规则：10人且全部3宝箱时的特定组合
        const specialTenPlayerGroups = [
            ['A4', 'A5', 'C4'],  // 左上方组合
            ['C5', 'E5', 'E4'],  // 左下方组合
            ['B1', 'B2', 'D1'],  // 右上方组合
            ['D2', 'F1', 'F2'],  // 右下方组合
            ['A1', 'A2', 'A3'],  // 左边界 A123
            ['C1', 'C2', 'C3'],  // 左边界 C123  
            ['E1', 'E2', 'E3'],  // 左边界 E123
            ['B3', 'B4', 'B5'],  // 右边界 B345
            ['D3', 'D4', 'D5'],  // 右边界 D345
            ['F3', 'F4', 'F5']   // 右边界 F345
        ];
        
        // 随机打乱特殊组合顺序
        const shuffledSpecialGroups = [...specialTenPlayerGroups];
        for (let i = shuffledSpecialGroups.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledSpecialGroups[i], shuffledSpecialGroups[j]] = [shuffledSpecialGroups[j], shuffledSpecialGroups[i]];
        }
        
        // 随机打乱玩家顺序
        const shuffledThreeBoxPlayers = [...playerAssignments];
        for (let i = shuffledThreeBoxPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledThreeBoxPlayers[i], shuffledThreeBoxPlayers[j]] = [shuffledThreeBoxPlayers[j], shuffledThreeBoxPlayers[i]];
        }
        
        // 为每个玩家分配特殊组合
        shuffledThreeBoxPlayers.forEach((player, index) => {
            if (index < shuffledSpecialGroups.length) {
                const group = shuffledSpecialGroups[index];
                group.forEach(boxId => {
                    player.boxes.push(boxId);
                    assignLoot(boxId, player.player);
                });
            }
        });
        
        console.log('特殊规则分配完成！');
        return;
    }
    
    if (isFifteenPlayerCase) {
        console.log('检测到特殊情况：15人且全部2宝箱，使用特殊组合规则');
        
        // 特殊规则：15人且全部2宝箱时的组合规则
        // 按照新规则：a1 a2一組 a3 a4一組 a5 b1一組
        const specialFifteenPlayerGroups = [
            ['A1', 'A2'],  // A1-A2组合
            ['A3', 'A4'],  // A3-A4组合
            ['A5', 'B1'],  // A5-B1组合
            ['B2', 'B3'],  // B2-B3组合
            ['B4', 'B5'],  // B4-B5组合
            ['C1', 'C2'],  // C1-C2组合
            ['C3', 'C4'],  // C3-C4组合
            ['C5', 'D1'],  // C5-D1组合
            ['D2', 'D3'],  // D2-D3组合
            ['D4', 'D5'],  // D4-D5组合
            ['E1', 'E2'],  // E1-E2组合
            ['E3', 'E4'],  // E3-E4组合
            ['E5', 'F1'],  // E5-F1组合
            ['F2', 'F3'],  // F2-F3组合
            ['F4', 'F5']   // F4-F5组合
        ];
        
        // 随机打乱特殊组合顺序
        const shuffledFifteenGroups = [...specialFifteenPlayerGroups];
        for (let i = shuffledFifteenGroups.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledFifteenGroups[i], shuffledFifteenGroups[j]] = [shuffledFifteenGroups[j], shuffledFifteenGroups[i]];
        }
        
        // 随机打乱玩家顺序
        const shuffledTwoBoxPlayers = [...playerAssignments];
        for (let i = shuffledTwoBoxPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledTwoBoxPlayers[i], shuffledTwoBoxPlayers[j]] = [shuffledTwoBoxPlayers[j], shuffledTwoBoxPlayers[i]];
        }
        
        // 为每个玩家分配特殊组合
        shuffledTwoBoxPlayers.forEach((player, index) => {
            if (index < shuffledFifteenGroups.length) {
                const group = shuffledFifteenGroups[index];
                group.forEach(boxId => {
                    player.boxes.push(boxId);
                    assignLoot(boxId, player.player);
                });
            }
        });
        
        console.log('15人2宝箱特殊规则分配完成！');
        return;
    }
    
    // 常规分配逻辑（非特殊人数情况）
    
    // 定义3宝箱的优先边界组合（第一优先级）
    const priorityThreeBoxGroups = [
        ['A1', 'A2', 'A3'],  // 左边界 A123
        ['C1', 'C2', 'C3'],  // 左边界 C123  
        ['E1', 'E2', 'E3'],  // 左边界 E123
        ['B3', 'B4', 'B5'],  // 右边界 B345
        ['D3', 'D4', 'D5'],  // 右边界 D345
        ['F3', 'F4', 'F5']   // 右边界 F345
    ];
    
    // 定义3宝箱的备用水平相邻组合（第二优先级）
    const fallbackThreeBoxGroups = [
        ['A2', 'A3', 'A4'], ['A3', 'A4', 'A5'],
        ['B1', 'B2', 'B3'], ['B2', 'B3', 'B4'],
        ['C2', 'C3', 'C4'], ['C3', 'C4', 'C5'],
        ['D1', 'D2', 'D3'], ['D2', 'D3', 'D4'],
        ['E2', 'E3', 'E4'], ['E3', 'E4', 'E5'],
        ['F1', 'F2', 'F3'], ['F2', 'F3', 'F4']
    ];
    
    // 定义2宝箱的相邻组合（遵循特定规则）
    const twoBoxGroups = [
        // 第一优先级：水平相邻（遵循边界相邻限制）
        ['A2', 'A3'], ['A3', 'A4'], ['A4', 'A5'],  // A1只跟A2相邻，A5只跟A4相邻
        ['B1', 'B2'], ['B2', 'B3'], ['B3', 'B4'],  // B5只跟B4相邻
        ['C2', 'C3'], ['C3', 'C4'], ['C4', 'C5'],  // C1只跟C2相邻
        ['D1', 'D2'], ['D2', 'D3'], ['D3', 'D4'],  // D5只跟D4相邻
        ['E2', 'E3'], ['E3', 'E4'], ['E4', 'E5'],  // E1只跟E2相邻
        ['F1', 'F2'], ['F2', 'F3'], ['F3', 'F4'],  // F5只跟F4相邻
        
        // 第二优先级：垂直相邻（遵循特定规则）
        ['A5', 'B1'], ['A5', 'C5'],  // A5跟B1,C5相邻
        ['B1', 'D1'],                 // B1也跟D1相邻
        ['C5', 'E5'],                 // C5也跟E5相邻
        ['D1', 'F1'],                 // D1也跟F1相邻
        ['E5', 'F1'],                 // E5也跟F1相邻
        
        // 第三优先级：跨行相邻（间隔为3）
        ['A2', 'B2'], ['B2', 'C2'], ['C2', 'D2'], ['D2', 'E2'], ['E2', 'F2'],
        ['A3', 'B3'], ['B3', 'C3'], ['C3', 'D3'], ['D3', 'E3'], ['E3', 'F3'],
        ['A4', 'B4'], ['B4', 'C4'], ['C4', 'D4'], ['D4', 'E4'], ['E4', 'F4']
    ];
    
    // 随机打乱组合顺序，增加随机性
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };
    
    const shuffledPriorityGroups = shuffleArray(priorityThreeBoxGroups);
    const shuffledFallbackGroups = shuffleArray(fallbackThreeBoxGroups);
    const shuffledTwoBoxGroups = shuffleArray(twoBoxGroups);
    
    // 第一阶段：优先分配3宝箱玩家（优先边界组合）
    const threeBoxPlayers = playerAssignments.filter(p => p.targetCount === 3);
    const shuffledThreeBoxPlayers = shuffleArray(threeBoxPlayers);
    
    shuffledThreeBoxPlayers.forEach(player => {
        // 优先分配边界组合
        let assigned = false;
        for (let group of shuffledPriorityGroups) {
            if (group.every(boxId => !lootAssignments[boxId])) {
                // 分配这组边界宝箱
                group.forEach(boxId => {
                    player.boxes.push(boxId);
                    assignLoot(boxId, player.player);
                });
                assigned = true;
                break;
            }
        }
        
        // 如果没有找到可用的边界组合，使用备用组合
        if (!assigned) {
            for (let group of shuffledFallbackGroups) {
                if (group.every(boxId => !lootAssignments[boxId])) {
                    group.forEach(boxId => {
                        player.boxes.push(boxId);
                        assignLoot(boxId, player.player);
                    });
                    break;
                }
            }
        }
        
        // 如果还是没有找到，分配任何可用的3个相邻宝箱
        if (player.boxes.length === 0) {
            let boxesAssigned = 0;
            for (let boxId of allBoxIds) {
                if (!lootAssignments[boxId] && boxesAssigned < 3) {
                    player.boxes.push(boxId);
                    assignLoot(boxId, player.player);
                    boxesAssigned++;
                }
            }
        }
    });
    
    // 第二阶段：分配2宝箱玩家
    const twoBoxPlayers = playerAssignments.filter(p => p.targetCount === 2);
    const shuffledTwoBoxPlayers = shuffleArray(twoBoxPlayers);
    
    shuffledTwoBoxPlayers.forEach(player => {
        // 找到可用的2宝箱相邻组合
        let assigned = false;
        for (let group of shuffledTwoBoxGroups) {
            if (group.every(boxId => !lootAssignments[boxId])) {
                // 分配这组宝箱
                group.forEach(boxId => {
                    player.boxes.push(boxId);
                    assignLoot(boxId, player.player);
                });
                assigned = true;
                break;
            }
        }
        
        // 如果没有找到可用的2宝箱组合，分配任何可用的2个宝箱
        if (!assigned) {
            let boxesAssigned = 0;
            for (let boxId of allBoxIds) {
                if (!lootAssignments[boxId] && boxesAssigned < 2) {
                    player.boxes.push(boxId);
                    assignLoot(boxId, player.player);
                    boxesAssigned++;
                }
            }
        }
    });
    
    // 第三阶段：确保所有宝箱都被分配
    allBoxIds.forEach(boxId => {
        if (!lootAssignments[boxId]) {
            // 找到有空间的玩家
            let availablePlayer = playerAssignments.find(p => p.boxes.length < p.targetCount);
            
            if (availablePlayer) {
                availablePlayer.boxes.push(boxId);
                assignLoot(boxId, availablePlayer.player);
            }
        }
    });
    
    // 最终检查和优化
    let maxAttempts = 5;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        let needsOptimization = false;
        
        // 检查每个玩家的宝箱间隔
        for (const player of playerAssignments) {
            if (player.boxes.length <= 1) continue;
            
            // 对宝箱进行排序
            const sortedBoxes = [...player.boxes].sort();
            
            // 检查间隔
            for (let i = 0; i < sortedBoxes.length - 1; i++) {
                const gap = calculateGap(sortedBoxes[i], sortedBoxes[i + 1]);
                if (gap > 3) {
                    needsOptimization = true;
                    console.log(`玩家 ${player.player} 的宝箱 ${sortedBoxes[i]} 和 ${sortedBoxes[i + 1]} 间隔为 ${gap}，需要优化`);
                    break;
                }
            }
            if (needsOptimization) break;
        }
        
        if (!needsOptimization) {
            console.log('所有玩家的宝箱间隔都在3格以内，分配完成！');
            break;
        }
        
        // 尝试优化：重新分配间隔过大的宝箱
        console.log(`第 ${attempt + 1} 次优化...`);
        attempt++;
        
        // 找到间隔过大的玩家，尝试重新分配
        for (const player of playerAssignments) {
            if (player.boxes.length <= 1) continue;
            
            const sortedBoxes = [...player.boxes].sort();
            let hasLargeGap = false;
            
            for (let i = 0; i < sortedBoxes.length - 1; i++) {
                const gap = calculateGap(sortedBoxes[i], sortedBoxes[i + 1]);
                if (gap > 3) {
                    hasLargeGap = true;
                    break;
                }
            }
            
            if (hasLargeGap) {
                // 尝试找到更好的相邻宝箱组合
                const currentBoxes = [...player.boxes];
                player.boxes = [];
                
                // 清空当前分配
                currentBoxes.forEach(boxId => {
                    clearLoot(boxId);
                });
                
                // 重新分配，优先选择相邻的宝箱
                if (player.targetCount === 3) {
                    // 优先寻找边界组合
                    for (let group of shuffledPriorityGroups) {
                        if (group.every(boxId => !lootAssignments[boxId])) {
                            group.forEach(boxId => {
                                player.boxes.push(boxId);
                                assignLoot(boxId, player.player);
                            });
                            break;
                        }
                    }
                    
                    // 如果没有边界组合，寻找备用组合
                    if (player.boxes.length === 0) {
                        for (let group of shuffledFallbackGroups) {
                            if (group.every(boxId => !lootAssignments[boxId])) {
                                group.forEach(boxId => {
                                    player.boxes.push(boxId);
                                    assignLoot(boxId, player.player);
                                });
                                break;
                            }
                        }
                    }
                } else if (player.targetCount === 2) {
                    // 寻找2个相邻的宝箱
                    for (let group of shuffledTwoBoxGroups) {
                        if (group.every(boxId => !lootAssignments[boxId])) {
                            group.forEach(boxId => {
                                player.boxes.push(boxId);
                                assignLoot(boxId, player.player);
                            });
                            break;
                        }
                    }
                }
                
                // 如果重新分配失败，恢复原来的分配
                if (player.boxes.length === 0) {
                    currentBoxes.forEach(boxId => {
                        player.boxes.push(boxId);
                        assignLoot(boxId, player.player);
                    });
                }
            }
        }
    }
    
    // 最终检查
    const finalAssignedBoxes = Object.keys(lootAssignments).length;
    console.log(`最终分配完成：${finalAssignedBoxes}/30 个宝箱已分配`);
    
    // 输出每个玩家的最终分配结果
    playerAssignments.forEach(player => {
        console.log(`${player.player}: ${player.boxes.join(', ')}`);
    });
    
    console.log('Bon分配完成！');
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
        alert('No IDs available to select!');
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
