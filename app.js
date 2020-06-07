const express = require('express');
const config = require('config');
const fs = require('fs');
const port = config.get('port') || 3000;
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
let server;
let serverProtocol = 'http';
let domain;

if (config.has('ssl')) {
    app.enable('view cashe');
    const ssl = config.get('ssl');
    const options = {
        key: fs.readFileSync(ssl.key),
        cert: fs.readFileSync(ssl.cert),
    };
    server = require('https').createServer(options, app);
    serverProtocol = 'https';
} else {
    server = require('http').createServer(app);
}

domain = `${serverProtocol}://${config.get('host')}`;

app.use(express.static(path.join(__dirname, 'public')));

let content;
app.get('/*', (req, res) => {
    if (!content) content = fs.readFileSync(`./public/index.html`, 'utf8');
    res.send(content);
});

const io = require('socket.io')(server);
io.attach(server, {
    path: '/ws',
    transports: ['websocket']
});

// 1) Check the Origin header of the WebSocket handshake request on the server
io.origins([`${domain}:${port}`]);

io.of('/').on('connection', (socket) => {
    console.log('user connected: ', socket.id);

    socket.on('message', msg => {
        console.log('new message emitted: ', msg);
        socket.broadcast.emit('chat msgs', msg);
    });
});

server.listen(port, () => {
    console.log('********** SERVER STARTED **********');
    console.log('********** Server Date: ' + Date() + '**********');
    console.log('Server listening at port %d', port);
    console.log(`********** ${domain}:${port} **********`)
});




