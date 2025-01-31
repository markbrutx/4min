let timerId = null
let timeLeft = 240
let currentMode = 'auto'
let timestampStart = null
const TIMER_DURATION = 240
const INTERVAL_MS = 999

onmessage = function(e) {
  switch (e.data.command) {
    case 'start':
      timeLeft = e.data.timeLeft
      currentMode = e.data.mode
      timestampStart = e.data.timestampStart
      startTimer()
      break
    case 'stop':
      if (currentMode !== 'auto') {
        stopTimer()
      }
      break
  }
}

function getCurrentUTCTimestamp() {
  return Math.floor(Date.now() / 1000)
}

function calculateTimeLeftFromTimestamp() {
  const currentTime = getCurrentUTCTimestamp()
  const elapsedSeconds = currentTime - timestampStart
  const currentCycleSeconds = elapsedSeconds % TIMER_DURATION
  const timeLeft = TIMER_DURATION - currentCycleSeconds
  
  if (timeLeft <= 1 || timeLeft >= TIMER_DURATION - 1) {
    const preciseElapsed = (Date.now() / 1000) - timestampStart
    const preciseCycle = preciseElapsed % TIMER_DURATION
    return TIMER_DURATION - preciseCycle
  }
  
  return timeLeft
}

let lastTickTime = 0
let lastTimeLeft = timeLeft

function startTimer() {
  stopTimer()
  lastTickTime = Date.now()
  lastTimeLeft = timeLeft
  timerId = setInterval(() => {
    const now = Date.now()
    const deltaTime = now - lastTickTime
    lastTickTime = now
    
    let newTimeLeft
    if (currentMode === 'auto') {
      newTimeLeft = calculateTimeLeftFromTimestamp()
    } else {
      const compensation = Math.max(0, Math.floor(deltaTime / 1000) - 1)
      newTimeLeft = Math.max(0, timeLeft - (1 + compensation))
    }
    
    if ((lastTimeLeft <= 1 && newTimeLeft > 230) || 
        (currentMode === 'manual' && newTimeLeft === 0)) {
      postMessage({ command: 'timeout' })
    }
    
    timeLeft = newTimeLeft
    lastTimeLeft = timeLeft
    
    postMessage({ command: 'tick', timeLeft: Math.round(timeLeft * 100) / 100 })
  }, INTERVAL_MS)
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}
