let timerId = null;
let timeLeft = 240;

self.onmessage = function(e) {
    switch (e.data.command) {
        case 'start':
            timeLeft = e.data.timeLeft;
            startTimer();
            break;
        case 'stop':
            stopTimer();
            break;
        case 'resume':
            // Просто продолжаем с текущего времени
            break;
    }
};

function startTimer() {
    stopTimer(); // Очищаем предыдущий таймер если он был
    
    timerId = setInterval(() => {
        timeLeft--;
        
        // Отправляем текущее время в основной поток
        self.postMessage({ command: 'tick', timeLeft: timeLeft });
        
        if (timeLeft <= 0) {
            self.postMessage({ command: 'timeout' });
            stopTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}
