let connectButton;
let disconnectButton;
let socket;
let statusInput;
let messageInput;

// const getCookieValue = (a) => {
//     var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
//     return b ? b.pop() : '';
// }
const socketUrl = '';

const connect = () => {
    let error = null;

    socket = io(socketUrl, {
        autoConnect: false,
        path: '/ws',
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('Connected');
        statusInput.value = 'Connected';
        connectButton.disabled = true;
        disconnectButton.disabled = false;

        // socket.emit('authentication', 'test');
    });

    socket.on('chat msgs', (msg) => {
        console.log('RECEIVED: ', msg);
    });

    // socket.on('unauthorized', (reason) => {
    //     console.log('Unauthorized:', reason);
    //
    //     error = reason.message;
    //
    //     socket.disconnect();
    // });

    socket.on('disconnect', (reason) => {
        console.log(`Disconnected: ${error || reason}`);
        statusInput.value = `Disconnected: ${error || reason}`;
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        error = null;
    });

    socket.open();
};

const sendMsg = ()=> {
    console.log('SENT: ', messageInput.value);
    socket.emit('message', messageInput.value);
};

const disconnect = () => {
    socket.disconnect();
}

document.addEventListener('DOMContentLoaded', () => {
    connectButton = document.getElementById('connect');
    disconnectButton = document.getElementById('disconnect');
    statusInput = document.getElementById('status');
    messageInput = document.getElementById('message');
});

/*
overide origin
https://stackoverflow.com/questions/30144233/how-to-set-websocket-origin-header-from-javascript
server {
    server_name test.dev;

    location / {
        proxy_pass http://123.123.123.123;
        proxy_set_header Origin test.com;

        # the following 3 are required to proxy WebSocket connections.
        # See more here: http://nginx.com/blog/websocket-nginx/

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
 */
