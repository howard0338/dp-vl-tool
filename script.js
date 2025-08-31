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
        
        // 為每個玩家分配不同的顏色
        const playerColors = [
            '#FF6B6B',  // 紅色
            '#4ECDC4',  // 青色
            '#45B7D1',  // 藍色
            '#96CEB4',  // 綠色
            '#FFEAA7',  // 黃色
            '#DDA0DD',  // 紫色
            '#98D8C8',  // 薄荷綠
            '#F7DC6F',  // 金黃色
            '#BB8FCE',  // 薰衣草
            '#85C1E9',  // 天藍色
            '#F39C12',  // 橙色
            '#E74C3C',  // 深紅色
            '#27AE60',  // 深綠色
            '#8E44AD',  // 深紫色
            '#16A085',  // 深青色
            '#D35400',  // 深橙色
            '#C0392B',  // 深棕色
            '#7D3C98',  // 深藍紫色
            '#138D75',  // 深薄荷綠
            '#B7950B'   // 深金黃色
        ];
        
        // 根據玩家名稱生成顏色索引
        let colorIndex = 0;
        for (let existingPlayer in lootAssignments) {
            if (lootAssignments[existingPlayer] === playerName) {
                break;
            }
            colorIndex++;
        }
        
        // 設置寶箱的顏色樣式
        const color = playerColors[colorIndex % playerColors.length] || `hsl(${colorIndex * 137.5 % 360}, 70%, 60%)`;
        
        // 設置背景色（包含獅子後方的背景填充）
        box.style.backgroundColor = color;
        box.style.borderColor = color;
        box.style.borderWidth = '4px';  // 更粗的邊框
        box.style.color = '#ffffff';
        box.style.boxShadow = `0 0 10px ${color}`;  // 添加發光效果
        
        // 覆蓋原本的綠色背景，確保顏色完全填充
        box.style.setProperty('--loot-box-bg', color);
        box.style.setProperty('--loot-box-border', color);
        
        // 使用CSS ::after伪元素显示玩家名称，不需要JavaScript创建元素
    }
}

function clearLoot(boxId) {
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
        
        // 不需要移除JavaScript创建的元素，因为现在使用CSS伪元素
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
            
            // Exclude trainees and belt players
            if (loot !== 'trainee' && loot !== 'BELT') {
                eligiblePlayers.push(name);
            } else {
                excludedPlayers.push({ name, loot });
            }
        }
    });
    
    // 输出调试信息
    console.log('参与宝箱分配的玩家:', eligiblePlayers);
    console.log('被排除的玩家:', excludedPlayers);
    
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
    
    // 获取玩家颜色数组（与宝箱分配系统保持一致）
    const playerColors = [
        '#FF6B6B',  // 紅色
        '#4ECDC4',  // 青色
        '#45B7D1',  // 藍色
        '#96CEB4',  // 綠色
        '#FFEAA7',  // 黃色
        '#DDA0DD',  // 紫色
        '#98D8C8',  // 薄荷綠
        '#F7DC6F',  // 金黃色
        '#BB8FCE',  // 薰衣草
        '#85C1E9',  // 天藍色
        '#F39C12',  // 橙色
        '#E74C3C',  // 深紅色
        '#27AE60',  // 深綠色
        '#8E44AD',  // 深紫色
        '#16A085',  // 深青色
        '#D35400',  // 深橙色
        '#C0392B',  // 深棕色
        '#7D3C98',  // 深藍紫色
        '#138D75',  // 深薄荷綠
        '#B7950B'   // 深金黃色
    ];
    
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
        commandsDisplay += `Party 1 Leader: ${party1Players.slice(0, 2).join(' ')}\n`;
        commandsDisplay += `${party1Command}\n\n`;
    }
    
    if (party2Players.length > 0) {
        commandsDisplay += `Party 2 Leader: ${party2Players.slice(0, 2).join(' ')}\n`;
        commandsDisplay += `${party2Command}\n\n`;
    }
    
    if (party3Players.length > 0) {
        commandsDisplay += `Party 3 Leader: ${party3Players.slice(0, 2).join(' ')}\n`;
        commandsDisplay += `${party3Command}\n\n`;
    }
    
    if (party4Players.length > 0) {
        commandsDisplay += `Party 4 Leader: ${party4Players.slice(0, 2).join(' ')}\n`;
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
    });
    
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
    // 初始化 - 清空所有欄位
    clearAllFields();
    
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
            e.target.classList.contains('job-select')) {
            saveData();
        }
    });
    
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
    
    const clearButton = document.createElement('button');
            clearButton.textContent = 'Clear';
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
    saveLoadDiv.appendChild(exportButton);
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
