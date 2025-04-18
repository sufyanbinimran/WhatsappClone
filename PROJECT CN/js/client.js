// Establishing a WebSocket connection
const socket = io('whatsappclone-production-dac8.up.railway.app');

// DOM elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
var audio = new Audio('Doraemon_Ringtone___message_ringtone___notification_ringtone(128k).m4a');

// Function to append messages to the chat container
const append = (message, position, isImage = false) => {
    const messageElement = document.createElement(isImage ? 'img' : 'div');
    if (isImage) {
        messageElement.src = message;
    } else {
        messageElement.innerText = message;
    }
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if (position == 'left') {
        // Play notification sound for incoming messages
        audio.play();
    }
}

// Event listener for sending messages
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    // Append the sent message to the right side of the chat container
    append(`You:${message}`, 'right');
    // Emit the message to the server
    socket.emit('send', message);
    messageInput.value = '';
});

// Prompt user to enter their name
const userName = prompt("Enter your name to join");
socket.emit('new-user-joined', userName);

// Socket event handler for new user joining
socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'right');
});

// Socket event handler for receiving messages
socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

// Socket event handler for user leaving
socket.on('left', name => {
    append(`${name} left the chat`, 'left');
});

// Function to send images
function sendImage() {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const imageData = reader.result;
        // Emit the image data to the server
        socket.emit('send-image', { image: imageData, fileName: file.name });
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Socket event handler for receiving images
socket.on('receive-image', data => {
    append(data.image, 'left', true);
});

// Function to send documents
function sendDocument() {
    const fileInput = document.getElementById('documentInput');
    const file = fileInput.files[0];

    // Ensure the selected file is in pdf format
    if (file.type !== "application/pdf") {
        alert("Please select a PDF document.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        const documentData = reader.result;
        // Emit the document data to the server
        socket.emit('send-document', { document: documentData, fileName: file.name });
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Socket event handler for receiving documents
socket.on('receive-document', data => {
    // Create a new iframe element to display the document
    const iframe = document.createElement('iframe');
    iframe.src = data.document;
    // Set iframe dimensions
    iframe.style.width = '100%';
    iframe.style.height = '500px'; // Adjust the height as needed
    // Append the iframe to the message container
    const messageContainer = document.querySelector(".container");
    messageContainer.appendChild(iframe);
});

// Function to send status text
function sendStatus() {
    const statusText = document.getElementById('statusText').value;
    // Emit status text to the server
    socket.emit('send-status', { text: statusText });
    showStatusNotification("Status uploaded successfully!");
}

// Function to send status image
function sendStatusImage() {
    const fileInput = document.getElementById('statusImageInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const imageData = reader.result;
        // Emit status image to the server
        socket.emit('send-status-image', { image: imageData, fileName: file.name });
        showStatusNotification("Status image uploaded successfully!");
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Function to append status text
function appendStatusText(text) {
    const statusContainer = document.getElementById('statusContainer');
    const statusElement = document.createElement('div');
    statusElement.classList.add('status-text');
    statusElement.textContent = text;
    statusContainer.appendChild(statusElement);
}

// Function to append status image
function appendStatusImage(imageSrc) {
    const statusContainer = document.getElementById('statusContainer');
    const imageElement = document.createElement('img');
    imageElement.classList.add('status-image');
    imageElement.src = imageSrc;
    statusContainer.appendChild(imageElement);
}

// Event delegation to handle click on status elements
document.getElementById('statusContainer').addEventListener('click', function (event) {
    const target = event.target;
    if (target.classList.contains('status-text')) {
        alert(target.textContent); // Display text status
    } else if (target.classList.contains('status-image')) {
        alert('Image status clicked'); // Display image status
    }
});

// Socket event handlers for receiving statuses
socket.on('receive-status', data => {
    appendStatusText(data.text);
});

socket.on('receive-status-image', data => {
    appendStatusImage(data.image);
});
