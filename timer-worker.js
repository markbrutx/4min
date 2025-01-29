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
  return TIMER_DURATION - currentCycleSeconds
}

let lastTickTime = 0

function startTimer() {
  stopTimer()
  lastTickTime = Date.now()
  timerId = setInterval(() => {
    const now = Date.now()
    const deltaTime = now - lastTickTime
    lastTickTime = now
    const compensation = Math.max(0, Math.floor(deltaTime / 1000) - 1)
    if (currentMode === 'auto') {
      timeLeft = calculateTimeLeftFromTimestamp()
    } else {
      timeLeft = Math.max(0, timeLeft - (1 + compensation))
    }
    postMessage({ command: 'tick', timeLeft })
    if (timeLeft <= 0) {
      postMessage({ command: 'timeout' })
      if (currentMode === 'manual') {
        stopTimer()
      }
    }
  }, INTERVAL_MS)
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}
