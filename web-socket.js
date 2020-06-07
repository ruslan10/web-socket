const ioSession = require('express-socket.io-session');
const cookieParser = require('cookie-parser');
const session = require('./middlewares/session');
const auth = require('./middlewares/auth');
const url = require('url');
const io = require('socket.io');

const httpErrors = require('http-errors');
const config = require('config');

const host = config.get('host');

function initializeSecurity(sockets, port) {
    // initializeRedisStore(sockets);
    const allowedOrigin = url.format({
        protocol: 'https:',
        hostname: host,
        port
    });

    console.log(`Sockets origins set to ${allowedOrigin}.`);
    sockets.origins(allowedOrigin);

    sockets.use(ioSession(session, cookieParser('secret string go here'), {
        autoSave: true
    }));

    //aut
    sockets.use((socket, next) => {
        let session = socket.handshake.session;
        console.log(session);
        if (session && session.user && session.user.username) {
            return next();
        } else {
            console.error('Unauthorized');
            return next(new httpErrors.Unauthorized());
        }
    });
}

function saveClient(clients, username, clientId, socket) {
    let client = clients.get(username);
    if (!client) {
        client = new Map();
        clients.set(username, client);
    }
    client.set(clientId, socket);
}

module.exports = (server, port) => {
    let sockets = io.listen(server, {
        path: '/ws',
        transports: ['websocket']
    });

    initializeSecurity(sockets, port);
    // Chatroom

    var numUsers = 0;

    sockets.on('connection', (socket) => {
        let addedUser = false;
        console.log('connection init');

        // when the client emits 'new message', this listens and executes
        socket.on('new message', (data) => {
            console.log('new message emitted', data);
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: data
            });
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add user', (username) => {
            if (addedUser) return;

            console.log('client emits \'add user\'', username);

            // we store the username in the socket session for this client
            socket.username = username;
            ++numUsers;
            addedUser = true;
            socket.emit('login', {
                numUsers: numUsers
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        });

        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', () => {
            socket.broadcast.emit('typing', {
                username: socket.username
            });
        });

        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', () => {
            socket.broadcast.emit('stop typing', {
                username: socket.username
            });
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', () => {
            if (addedUser) {
                --numUsers;

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
        });
    });

}
