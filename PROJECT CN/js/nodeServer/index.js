// Require the socket.io library and initialize the server with CORS configuration
const io = require('socket.io')(8000, { cors: { origin: "*" } });

// Object to store users' information
const users = {};

// Event listener for new connections
io.on('connection', socket => {
    // Event listener for when a new user joins
    socket.on('new-user-joined', name => {
        console.log("New user", name);
        // Store the user's name with their socket ID
        users[socket.id] = name;
        // Broadcast to all clients except the sender that a new user has joined
        socket.broadcast.emit('user-joined', name);
    });

    // Event listener for sending messages
    socket.on('send', message => {
        // Broadcast the message to all clients except the sender, along with the sender's name
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });

    // Event listener for disconnection
    socket.on('disconnect', message => {
        // Broadcast to all clients except the sender that a user has left
        socket.broadcast.emit('left', users[socket.id]);
        // Remove the user from the users object
        delete users[socket.id];
    });

    // Event listener for sending images
    socket.on('send-image', data => {
        // Broadcast the image to all clients except the sender, along with the sender's name and file name
        socket.broadcast.emit('receive-image', { image: data.image, name: users[socket.id], fileName: data.fileName });
    });

    // Event listener for sending documents
    socket.on('send-document', data => {
        // Broadcast the document to all clients except the sender, along with the sender's name and file name
        socket.broadcast.emit('receive-document', { document: data.document, fileName: data.fileName });
    });

    // Event listener for sending status updates
    socket.on('send-status', data => {
        // Broadcast the status update to all clients except the sender, along with the status text
        socket.broadcast.emit('receive-status', { text: data.text });
    });

    // Event listener for sending status images
    socket.on('send-status-image', data => {
        // Broadcast the status image to all clients except the sender, along with the sender's name and file name
        socket.broadcast.emit('receive-status-image', { image: data.image, fileName: data.fileName });
    });
});
