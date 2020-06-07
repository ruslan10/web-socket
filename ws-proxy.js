const WebSocket = require('ws');

const ws = new WebSocket('wss://web.whatsapp.com/ws', {
    origin: 'https://web.whatsapp.com'
});

ws.onopen = function(e) {
    console.log('connected');
    ws.emit('status', 'Available');
};

ws.onerror = function(error) {
    console.error(`[error] ${error.message}`);
};

ws.on('close', function close() {
    console.log('disconnected');
});

ws.on('message', function incoming(data) {
    console.log(`Roundtrip time: ${Date.now() - data} ms`);

    setTimeout(function timeout() {
        ws.send(Date.now());
    }, 500);
});
