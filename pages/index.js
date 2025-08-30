import { useState, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [timers, setTimers] = useState({
    1: { interval: null, running: false, seconds: 60, total: 60, autoRestart: true },
    2: { interval: null, running: false, seconds: 120, total: 120, autoRestart: false },
    3: { interval: null, running: false, seconds: 150, total: 150, autoRestart: false },
    4: { interval: null, running: false, seconds: 240, total: 240, autoRestart: false }
  })
  
  const [lootAssignments, setLootAssignments] = useState({})
  const [parties, setParties] = useState({
    party1: Array(6).fill({ name: '', job: '', loot: '' }),
    party2: Array(6).fill({ name: '', job: '', loot: '' }),
    party3: Array(6).fill({ name: '', job: '', loot: '' }),
    party4: Array(6).fill({ name: '', job: '', loot: '' })
  })

  // Timer functions
  const startTimer = (timerId, totalSeconds) => {
    const timer = timers[timerId]
    if (!timer.running) {
      const newTimers = { ...timers }
      newTimers[timerId] = { ...timer, running: true, seconds: totalSeconds }
      setTimers(newTimers)
      
      const interval = setInterval(() => {
        setTimers(prev => {
          const updated = { ...prev }
          if (updated[timerId].seconds > 0) {
            updated[timerId].seconds--
          } else {
            if (updated[timerId].autoRestart) {
              updated[timerId].seconds = updated[timerId].total
            } else {
              updated[timerId].running = false
              clearInterval(interval)
            }
          }
          return updated
        })
      }, 1000)
      
      newTimers[timerId].interval = interval
      setTimers(newTimers)
    }
  }

  const resetAndStartTimer = (timerId, totalSeconds) => {
    const newTimers = { ...timers }
    newTimers[timerId] = { 
      ...newTimers[timerId], 
      running: false, 
      seconds: totalSeconds, 
      total: totalSeconds 
    }
    setTimers(newTimers)
    startTimer(timerId, totalSeconds)
  }

  const updatePartyMember = (partyId, index, field, value) => {
    setParties(prev => {
      const newParties = { ...prev }
      newParties[partyId][index] = { ...newParties[partyId][index], [field]: value }
      return newParties
    })
  }

  const generateSummary = () => {
    let totalPlayers = 0
    let bonCount = 0
    let beltCount = 0
    let traineeCount = 0
    let ssCount = 0
    let tlCount = 0
    let resCount = 0

    Object.values(parties).forEach(party => {
      party.forEach(member => {
        if (member.name.trim()) totalPlayers++
        if (member.loot === 'BON') bonCount++
        if (member.loot === 'BELT') beltCount++
        if (member.loot === '練習生') traineeCount++
        if (member.job === 'SHAD') ssCount++
        if (member.job === 'BUCC') tlCount++
        if (member.job === 'BS') resCount++
      })
    })

    // Update summary display
    document.getElementById('expedition-size').textContent = totalPlayers
    document.getElementById('bon-count').textContent = bonCount
    document.getElementById('belt-count').textContent = beltCount
    document.getElementById('trainee-count').textContent = traineeCount
    document.getElementById('ss-count').textContent = ssCount
    document.getElementById('tl-count').textContent = tlCount
    document.getElementById('res-count').textContent = resCount

    console.log('Summary updated:', { totalPlayers, bonCount, beltCount, traineeCount, ssCount, tlCount, resCount })
  }

  const generatePartyCommand = () => {
    // Generate party commands logic here
    console.log('Generating party commands...')
  }

  const splitBon = () => {
    // Split bon logic here
    console.log('Splitting bon...')
  }

  const clearBon = () => {
    setLootAssignments({})
  }

  const pickLuckyWinner = () => {
    const allPlayers = []
    Object.values(parties).forEach(party => {
      party.forEach(member => {
        if (member.name.trim()) allPlayers.push(member.name)
      })
    })
    
    if (allPlayers.length === 0) {
      alert('No players available!')
      return
    }

    const selectedPlayers = []
    const tempPlayers = [...allPlayers]
    
    for (let i = 0; i < Math.min(3, tempPlayers.length); i++) {
      const randomIndex = Math.floor(Math.random() * tempPlayers.length)
      selectedPlayers.push(tempPlayers[randomIndex])
      tempPlayers.splice(randomIndex, 1)
    }

    alert(`🎉 Lucky Winners 🎉\n\n${selectedPlayers.map((player, index) => `${index + 1}. ${player}`).join('\n')}`)
  }

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      Object.values(timers).forEach(timer => {
        if (timer.interval) clearInterval(timer.interval)
      })
    }
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>DP's VL tool - Job Classification & Reward Distribution</title>
        <meta name="description" content="Job Classification, Reward Distribution & Timer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <h1>DP's VL tool</h1>
        <p>Job Classification, Reward Distribution & Timer</p>
      </header>

      <div className={styles.mainContent}>
        {/* Left Panel - Party Information */}
        <div className={styles.leftPanel}>
          <div className={styles.partySection}>
            <h2>Party Information</h2>
            <div className={styles.partyContainer}>
              {/* Party 1 & 2 Row */}
              <div className={styles.partyRow}>
                <div className={styles.party}>
                  <h3>Party 1</h3>
                  <div className={styles.partyMembers}>
                    <div className={styles.memberInput}>
                      <div className={styles.playerId}>ID</div>
                      <div className={styles.jobSelect}>Job</div>
                      <div className={styles.lootSelect}>Loot Type</div>
                    </div>
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className={styles.memberInput}>
                        <input
                          type="text"
                          placeholder="Player Name"
                          value={parties.party1[index]?.name || ''}
                          onChange={(e) => updatePartyMember('party1', index, 'name', e.target.value)}
                        />
                        <select
                          value={parties.party1[index]?.job || ''}
                          onChange={(e) => updatePartyMember('party1', index, 'job', e.target.value)}
                        >
                          <option value="">Select Job</option>
                          <option value="SHAD">SHAD</option>
                          <option value="NL">NL</option>
                          <option value="BM">BM</option>
                          <option value="MM">MM</option>
                          <option value="PALA">PALA</option>
                          <option value="DK">DK</option>
                          <option value="HR">HR</option>
                          <option value="BUCC">BUCC</option>
                          <option value="SAIR">SAIR</option>
                          <option value="BS">BS</option>
                        </select>
                        <select
                          value={parties.party1[index]?.loot || ''}
                          onChange={(e) => updatePartyMember('party1', index, 'loot', e.target.value)}
                        >
                          <option value="">Loot Type</option>
                          <option value="BON">BON</option>
                          <option value="BELT">BELT</option>
                          <option value="練習生">Trainee</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.party}>
                  <h3>Party 2</h3>
                  <div className={styles.partyMembers}>
                    <div className={styles.memberInput}>
                      <div className={styles.playerId}>ID</div>
                      <div className={styles.jobSelect}>Job</div>
                      <div className={styles.lootSelect}>Loot Type</div>
                    </div>
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className={styles.memberInput}>
                        <input
                          type="text"
                          placeholder="Player Name"
                          value={parties.party2[index]?.name || ''}
                          onChange={(e) => updatePartyMember('party2', index, 'name', e.target.value)}
                        />
                        <select
                          value={parties.party2[index]?.job || ''}
                          onChange={(e) => updatePartyMember('party2', index, 'job', e.target.value)}
                        >
                          <option value="">Select Job</option>
                          <option value="SHAD">SHAD</option>
                          <option value="NL">NL</option>
                          <option value="BM">BM</option>
                          <option value="MM">MM</option>
                          <option value="PALA">PALA</option>
                          <option value="DK">DK</option>
                          <option value="HR">HR</option>
                          <option value="BUCC">BUCC</option>
                          <option value="SAIR">SAIR</option>
                          <option value="BS">BS</option>
                        </select>
                        <select
                          value={parties.party2[index]?.loot || ''}
                          onChange={(e) => updatePartyMember('party2', index, 'loot', e.target.value)}
                        >
                          <option value="">Loot Type</option>
                          <option value="BON">BON</option>
                          <option value="BELT">BELT</option>
                          <option value="練習生">Trainee</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Party 3 & 4 Row */}
              <div className={styles.partyRow}>
                <div className={styles.party}>
                  <h3>Party 3</h3>
                  <div className={styles.partyMembers}>
                    <div className={styles.memberInput}>
                      <div className={styles.playerId}>ID</div>
                      <div className={styles.jobSelect}>Job</div>
                      <div className={styles.lootSelect}>Loot Type</div>
                    </div>
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className={styles.memberInput}>
                        <input
                          type="text"
                          placeholder="Player Name"
                          value={parties.party3[index]?.name || ''}
                          onChange={(e) => updatePartyMember('party3', index, 'name', e.target.value)}
                        />
                        <select
                          value={parties.party3[index]?.job || ''}
                          onChange={(e) => updatePartyMember('party3', index, 'job', e.target.value)}
                        >
                          <option value="">Select Job</option>
                          <option value="SHAD">SHAD</option>
                          <option value="NL">NL</option>
                          <option value="BM">BM</option>
                          <option value="MM">MM</option>
                          <option value="PALA">PALA</option>
                          <option value="DK">DK</option>
                          <option value="HR">HR</option>
                          <option value="BUCC">BUCC</option>
                          <option value="SAIR">SAIR</option>
                          <option value="BS">BS</option>
                        </select>
                        <select
                          value={parties.party3[index]?.loot || ''}
                          onChange={(e) => updatePartyMember('party3', index, 'loot', e.target.value)}
                        >
                          <option value="">Loot Type</option>
                          <option value="BON">BON</option>
                          <option value="BELT">BELT</option>
                          <option value="練習生">Trainee</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.party}>
                  <h3>Party 4</h3>
                  <div className={styles.partyMembers}>
                    <div className={styles.memberInput}>
                      <div className={styles.playerId}>ID</div>
                      <div className={styles.jobSelect}>Job</div>
                      <div className={styles.lootSelect}>Loot Type</div>
                    </div>
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className={styles.memberInput}>
                        <input
                          type="text"
                          placeholder="Player Name"
                          value={parties.party4[index]?.name || ''}
                          onChange={(e) => updatePartyMember('party4', index, 'name', e.target.value)}
                        />
                        <select
                          value={parties.party4[index]?.job || ''}
                          onChange={(e) => updatePartyMember('party4', index, 'job', e.target.value)}
                        >
                          <option value="">Select Job</option>
                          <option value="SHAD">SHAD</option>
                          <option value="NL">NL</option>
                          <option value="BM">BM</option>
                          <option value="MM">MM</option>
                          <option value="PALA">PALA</option>
                          <option value="DK">DK</option>
                          <option value="HR">HR</option>
                          <option value="BUCC">BUCC</option>
                          <option value="SAIR">SAIR</option>
                          <option value="BS">BS</option>
                        </select>
                        <select
                          value={parties.party4[index]?.loot || ''}
                          onChange={(e) => updatePartyMember('party4', index, 'loot', e.target.value)}
                        >
                          <option value="">Loot Type</option>
                          <option value="BON">BON</option>
                          <option value="BELT">BELT</option>
                          <option value="練習生">Trainee</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statusSection}>
            <h3>Party Commands</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusCategory}>
                <label>Party 1 Leader:</label>
                <input type="text" id="party1-leader" readOnly />
              </div>
              <div className={styles.statusCategory}>
                <label>Party 2 Leader:</label>
                <input type="text" id="party2-leader" readOnly />
              </div>
              <div className={styles.statusCategory}>
                <label>Party 3 Leader:</label>
                <input type="text" id="party3-leader" readOnly />
              </div>
              <div className={styles.statusCategory}>
                <label>Party 4 Leader:</label>
                <input type="text" id="party4-leader" readOnly />
              </div>
              <div className={styles.statusCategory}>
                <label>SS Available:</label>
                <input type="text" id="ss-available" />
              </div>
              <div className={styles.statusCategory}>
                <label>TL Available:</label>
                <input type="text" id="tl-available" />
              </div>
              <div className={styles.statusCategory}>
                <label>Res Available:</label>
                <input type="text" id="ress-available" />
              </div>
              <div className={styles.statusCategory}>
                <button onClick={generatePartyCommand} className={styles.generateCommandBtn}>Generate</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Timers & Summary */}
        <div className={styles.rightPanel}>
          {/* Timer Section */}
          <div className={styles.timerSection}>
            <h2>Countdown Timer</h2>
            <div className={styles.timersContainer}>
              <div className={styles.timerItem}>
                <div className={styles.timerLabel}>dispel</div>
                <div className={styles.timerDisplay}>{formatTime(timers[1].seconds)}</div>
                <div className={styles.timerControls}>
                  <button onClick={() => resetAndStartTimer(1, 60)}>Reset</button>
                </div>
              </div>
              <div className={styles.timerItem}>
                <div className={styles.timerLabel}>golem</div>
                <div className={styles.timerDisplay}>{formatTime(timers[2].seconds)}</div>
                <div className={styles.timerControls}>
                  <button onClick={() => resetAndStartTimer(2, 120)}>Reset</button>
                </div>
              </div>
              <div className={styles.timerItem}>
                <div className={styles.timerLabel}>gargoyles</div>
                <div className={styles.timerDisplay}>{formatTime(timers[3].seconds)}</div>
                <div className={styles.timerControls}>
                  <button onClick={() => resetAndStartTimer(3, 150)}>Reset</button>
                </div>
              </div>
              <div className={styles.timerItem}>
                <div className={styles.timerLabel}>jail</div>
                <div className={styles.timerDisplay}>{formatTime(timers[4].seconds)}</div>
                <div className={styles.timerControls}>
                  <button onClick={() => resetAndStartTimer(4, 240)}>Reset</button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className={styles.summarySection}>
            <h3>Expedition Summary</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <label>Expedition Size:</label>
                <span id="expedition-size">0</span>
              </div>
              <div className={styles.summaryItem}>
                <label>Bon Looters:</label>
                <span id="bon-count">0</span>
              </div>
              <div className={styles.summaryItem}>
                <label>Belt Looters:</label>
                <span id="belt-count">0</span>
              </div>
              <div className={styles.summaryItem}>
                <label>Trainees:</label>
                <span id="trainee-count">0</span>
              </div>
              <div className={styles.summaryItem}>
                <label>SS:</label>
                <span id="ss-count">0</span>
              </div>
              <div className={styles.summaryItem}>
                <label>TL:</label>
                <span id="tl-count">0</span>
              </div>
              <div className={styles.summaryItem}>
                <label>Res:</label>
                <span id="res-count">0</span>
              </div>
            </div>
            <button onClick={generateSummary} className={styles.generateSummaryBtn}>Generate</button>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Bon Split Grid */}
      <div className={styles.bottomPanel}>
        <h2>Bon Split Grid</h2>
        <div className={styles.lootGrid}>
          <div className={styles.gridContainer}>
            {/* Left Side - ACE */}
            <div className={styles.leftSide}>
              <div className={styles.gridRow}>
                <div className={styles.lootBox} data-box="A1">A1</div>
                <div className={styles.lootBox} data-box="A2">A2</div>
                <div className={styles.lootBox} data-box="A3">A3</div>
                <div className={styles.lootBox} data-box="A4">A4</div>
                <div className={styles.lootBox} data-box="A5">A5</div>
              </div>
              <div className={styles.gridRow}>
                <div className={styles.lootBox} data-box="C1">C1</div>
                <div className={styles.lootBox} data-box="C2">C2</div>
                <div className={styles.lootBox} data-box="C3">C3</div>
                <div className={styles.lootBox} data-box="C4">C4</div>
                <div className={styles.lootBox} data-box="C5">C5</div>
              </div>
              <div className={styles.gridRow}>
                <div className={styles.lootBox} data-box="E1">E1</div>
                <div className={styles.lootBox} data-box="E2">E2</div>
                <div className={styles.lootBox} data-box="E3">E3</div>
                <div className={styles.lootBox} data-box="E4">E4</div>
                <div className={styles.lootBox} data-box="E5">E5</div>
              </div>
            </div>
            
            {/* Middle - Split Bon */}
            <div className={styles.spawnSection}>
              <button onClick={splitBon} className={styles.splitBonBtn}>Split Bon</button>
            </div>
            
            {/* Right Side - BDF */}
            <div className={styles.rightSide}>
              <div className={styles.gridRow}>
                <div className={styles.lootBox} data-box="B1">B1</div>
                <div className={styles.lootBox} data-box="B2">B2</div>
                <div className={styles.lootBox} data-box="B3">B3</div>
                <div className={styles.lootBox} data-box="B4">B4</div>
                <div className={styles.lootBox} data-box="B5">B5</div>
              </div>
              <div className={styles.gridRow}>
                <div className={styles.lootBox} data-box="D1">D1</div>
                <div className={styles.lootBox} data-box="D2">D2</div>
                <div className={styles.lootBox} data-box="D3">D3</div>
                <div className={styles.lootBox} data-box="D4">D4</div>
                <div className={styles.lootBox} data-box="D5">D5</div>
              </div>
              <div className={styles.gridRow}>
                <div className={styles.lootBox} data-box="F1">F1</div>
                <div className={styles.lootBox} data-box="F2">F2</div>
                <div className={styles.lootBox} data-box="F3">F3</div>
                <div className={styles.lootBox} data-box="F4">F4</div>
                <div className={styles.lootBox} data-box="F5">F5</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
