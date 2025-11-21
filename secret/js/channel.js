// src/js/channel.js - NEW CONSOLIDATED SCRIPT
document.addEventListener('DOMContentLoaded', () => {
    const SERVER_URL = 'https://portfolio-server-8zei.onrender.com';
    const token = localStorage.getItem('friends-token');
    const myDisplayName = localStorage.getItem('friends-displayName');

    if (!token || !myDisplayName) {
        window.location.href = 'friends.html';
        return;
    }

    const socket = io(SERVER_URL, { auth: { token } });
    const params = new URLSearchParams(window.location.search);
    
    // UI Elements
    const ui = {
        chatMessages: document.getElementById('chat-messages'),
        chatForm: document.getElementById('chat-form'),
        chatInput: document.getElementById('chat-input'),
        pageTitle: document.querySelector('h1'),
    };
    
    // --- State Management ---
    let channelId = '';
    let isPrivateChat = window.location.pathname.includes('private.html');

    // --- Page Initialization ---
    function initializeChannel() {
        if (isPrivateChat) {
            const recipientName = params.get('recipient');
            if (!recipientName) { window.location.href = 'hub.html'; return; }
            ui.pageTitle.innerHTML = `Private Comms with <span id="recipient-name">${recipientName}</span>`;
            socket.emit('private:join', { senderName: myDisplayName, recipientName });
        } else {
            const groupChannelId = params.get('channel');
            const groupChannelName = params.get('name');
            if (!groupChannelId || !groupChannelName) { window.location.href = 'hub.html'; return; }
            ui.pageTitle.innerHTML = `Channel: <span id="channel-name">${decodeURIComponent(groupChannelName)}</span>`;
            channelId = groupChannelId;
            socket.emit('group:join', channelId);
            socket.emit('chat:get_history', channelId); // Request history for group
        }
    }

    // --- Socket Event Handlers ---
    socket.on('connect', initializeChannel);

    socket.on('private:joined', (joinedRoomName) => {
        channelId = joinedRoomName;
        socket.emit('chat:get_history', channelId); // Request history for private room
    });

    socket.on('chat:history', (history) => {
        ui.chatMessages.innerHTML = '';
        history.forEach(appendChatMessage);
    });

    socket.on('chat:message', appendChatMessage);
    
    // --- Form Submission ---
    ui.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = ui.chatInput.value.trim();
        if (text && channelId) {
            const messageData = {
                sender: myDisplayName,
                text: text,
                channel: channelId,
                isAction: false
            };

            if (text.startsWith('/me ')) {
                messageData.text = text.substring(4);
                messageData.isAction = true;
            }
            
            socket.emit('chat:message', messageData);
            ui.chatInput.value = '';
        }
    });

    // --- UI Helper Functions ---
    function appendChatMessage({ senderName, text, timestamp, isAction }) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message');
        
        if (senderName === myDisplayName) messageEl.classList.add('mine');
        if (senderName === 'SYSTEM') messageEl.classList.add('system-message');
        if (isAction) messageEl.classList.add('action-message');

        const displayTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Sanitize and parse for links/images
        let processedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        processedText = processedText.replace(urlRegex, (url) => {
            if (/\.(jpg|jpeg|png|gif)$/i.test(url)) {
                return `<a href="${url}" target="_blank"><img src="${url}" class="chat-image" alt="User image"></a>`;
            } else {
                return `<a href="${url}" target="_blank">${url}</a>`;
            }
        });

        if (isAction) {
            messageEl.innerHTML = `<div class="text">* ${senderName} ${processedText}</div>`;
        } else {
            messageEl.innerHTML = `
                <div class="sender">${senderName}<span class="timestamp">${displayTime}</span></div>
                <div class="text">${processedText}</div>`;
        }

        ui.chatMessages.appendChild(messageEl);
        ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight;
    }
});
