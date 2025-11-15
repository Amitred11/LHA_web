// src/js/hub.js - FINAL, COMPLETE, AND CORRECTLY STRUCTURED
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INITIAL SETUP & CONSTANTS ---
    const SERVER_URL = 'https://portfolio-server-8zei.onrender.com';
    const token = localStorage.getItem('friends-token');
    const displayName = localStorage.getItem('friends-displayName');
    let userRole = localStorage.getItem('friends-role') || 'Agent';
    let userAchievements = JSON.parse(localStorage.getItem('friends-achievements')) || [];
    const sessionStartTime = new Date();
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

    if (!token) {
        window.location.href = 'friends.html';
        return;
    }
    
    // --- 2. SOCKET.IO INITIALIZATION ---
    const socket = io(SERVER_URL, { auth: { token } });

    // --- 3. UI & AUDIO ELEMENT CACHE ---
    const ui = {
        userDisplayName: document.getElementById('user-display-name'),
        logoutButton: document.getElementById('logout-button'),
        chatForm: document.getElementById('chat-form'),
        chatInput: document.getElementById('chat-input'),
        chatMessages: document.getElementById('chat-messages'),
        typingIndicator: document.getElementById('typing-indicator'),
        selfDestructBtn: document.getElementById('self-destruct-btn'),
        activeUsersList: document.getElementById('active-users-list'),
        systemLog: document.getElementById('system-log'),
        gameBoard: document.getElementById('tic-tac-toe-board'),
        gameStatus: document.getElementById('game-status'),
        cells: document.querySelectorAll('.cell'),
        resetButton: document.getElementById('reset-game-button'),
        shutdownOverlay: document.getElementById('shutdown-overlay'),
        shutdownText: document.getElementById('shutdown-text'),
        motdText: document.getElementById('motd-text'),
        statusForm: document.getElementById('status-form'),
        statusInput: document.getElementById('status-input'),
        purgeCommsBtn: document.getElementById('purge-comms-btn'),
        pingOverlay: document.getElementById('ping-overlay'),
        cmatrixCanvas: document.getElementById('cmatrix-canvas'),
        lockdownOverlay: document.getElementById('lockdown-overlay'),
        lockdownBanner: document.getElementById('lockdown-banner'),
        achievementToast: document.getElementById('achievement-toast'),
        networkStatusModule: document.getElementById('network-status-module'),
        uplinkBar: document.getElementById('uplink-bar'),
        integrityBar: document.getElementById('integrity-bar'),
        firewallBar: document.getElementById('firewall-bar'),
        dossierModal: document.getElementById('dossier-modal'),
        dossierBody: document.getElementById('dossier-body'),
        dossierCloseBtn: document.getElementById('dossier-close-btn'),
        terminalContainer: document.getElementById('terminal-container'),
        terminalToggleBtn: document.getElementById('terminal-toggle-btn'),
        terminalCloseBtn: document.getElementById('terminal-close-btn'),
        terminalOutput: document.getElementById('terminal-output'),
        terminalInput: document.getElementById('terminal-input'),
        logFilters: document.getElementById('log-filters'),
        intelTicker: document.getElementById('intel-ticker'),
        fileTransferArea: document.getElementById('file-transfer-area'),
        fileUploadInput: document.getElementById('file-upload-input'),
        fileDestinationModal: document.getElementById('file-destination-modal'),
        filePreviewArea: document.getElementById('file-preview-area'),
        fileDestinationForm: document.getElementById('file-destination-form'),
        fileDestinationSelect: document.getElementById('file-destination-select'),
        fileDestinationCancelBtn: document.getElementById('file-destination-cancel'),
        muteButton: document.getElementById('mute-button'),
        volumeSlider: document.getElementById('volume-slider'),

    };
    const audio = {
        connect: new Audio('../../assets/sounds/connect.mp3'),
        disconnect: new Audio('../../assets/sounds/disconnect.mp3'),
        message: new Audio('../../assets/sounds/message.mp3'),
        whisper: new Audio('../../assets/sounds/whisper.mp3'),
        ping: new Audio('../../assets/sounds/ping.mp3'),
        typing: new Audio('../../assets/sounds/typing.mp3'),
        alarm: new Audio('../../assets/sounds/alarm.mp3'),
        achievement: new Audio('../../assets/sounds/achievement.mp3'),
    };
    audio.typing.loop = true;

    // --- 4. STATE MANAGEMENT ---
    let typingTimeout, isTyping = false, gameState = {};
    let commandHistory = [], historyIndex = -1;
    let networkInterval, cmatrixInterval = null;
    let messageCount = 0, gamesWon = 0, commandsUsed = new Set();
    let isLogPaused = false;
    let isReady = false;
    let fileToSend = null;

    // --- 5. FUNCTION DEFINITIONS ---

    // --- CORE & INITIALIZATION FUNCTIONS ---
    function applyVolumeSettings() {
        const volume = parseFloat(localStorage.getItem('friends-volume') || '1.0');
        const isMuted = localStorage.getItem('friends-isMuted') === 'true';

        for (const sound in audio) {
            audio[sound].volume = volume;
            audio[sound].muted = isMuted;
        }

        ui.volumeSlider.value = volume;
        const muteIcon = ui.muteButton.querySelector('i');
        if (isMuted) {
            muteIcon.className = 'bx bxs-volume-mute';
            ui.volumeSlider.disabled = true;
        } else {
            muteIcon.className = 'bx bxs-volume-full';
            ui.volumeSlider.disabled = false;
        }
    }
    function onConnect() {
        isReady = false;
        addLogEntry('System', 'Secure connection established. Synchronizing...', 'connect');
        socket.emit('agent:identify', { displayName, role: userRole, achievements: userAchievements });
        startNetworkAnimation();
        initializeIntelFeed();
    }
    function init() {
        ui.userDisplayName.textContent = displayName;
        applyVolumeSettings();
        bindEventListeners();
        
    }

    // --- UI HELPER & DISPLAY FUNCTIONS ---
    const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    function addLogEntry(source, text, type) {
        if (isLogPaused) return;
        const logEl = document.createElement('div');
        const fullTimestamp = new Date().toISOString();
        const displayTime = new Date(fullTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let filterCategory = 'system';
        if (['connect', 'disconnect', 'action'].includes(type)) filterCategory = 'system';
        if (source === 'Chat' || source === 'FileSend') filterCategory = 'chat';
        if (source === 'Strat-Sim') filterCategory = 'game';
        
        logEl.className = 'log-entry';
        logEl.dataset.filter = filterCategory;
        const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        logEl.innerHTML = `<span class="log-time" title="${fullTimestamp}">[${displayTime}]</span> <span class="log-source">${source}:</span> <span class="log-event log-event--${type}">${safeText}</span>`;
        const activeFilter = ui.logFilters.querySelector('.active')?.dataset.filter || 'all';
        if (activeFilter !== 'all' && activeFilter !== filterCategory) {
            logEl.classList.add('hidden-log');
        }
        ui.systemLog.appendChild(logEl);
        ui.systemLog.scrollTop = ui.systemLog.scrollHeight;
    }

    function appendChatMessage({ senderName, text, isSelfDestruct, isWhisper, timestamp, isAction, isFile, fileName, fileType }) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message');
        if (senderName === displayName) messageEl.classList.add('mine');
        if (isSelfDestruct) messageEl.classList.add('self-destruct');
        if (isWhisper) messageEl.classList.add('whisper');
        if (['SYS_ADMIN', 'SYSTEM'].includes(senderName)) messageEl.classList.add('system-message');
        if (isAction) messageEl.classList.add('action-message');
        if (isFile) messageEl.classList.add('file-message');

        const displayTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : getTimestamp();
        
        let messageContent;
        if (isFile) {
            if (fileType.startsWith('image/')) {
                messageContent = `<img src="${text}" alt="${fileName}" class="chat-image">`;
            } else {
                messageContent = `<a href="${text}" download="${fileName}" class="file-download-link"><i class='bx bxs-file'></i> ${fileName}</a>`;
            }
             messageEl.innerHTML = `
                <div class="sender">${senderName}<span class="timestamp">${displayTime}</span></div>
                <div class="text">${messageContent}</div>`;
        } else {
             let processedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
             const urlRegex = /(https?:\/\/[^\s]+)/g;
             processedText = processedText.replace(urlRegex, (url) => {
                 if (/\.(jpg|jpeg|png|gif)$/i.test(url)) {
                     return `<a href="${url}" target="_blank" title="Open image in new tab"><img src="${url}" class="chat-image" alt="User image"></a>`;
                 }
                 return `<a href="${url}" target="_blank">${url}</a>`;
             });

            if (isAction) {
                messageEl.innerHTML = `<div class="text">* ${senderName} ${processedText}</div>`;
                addLogEntry('Chat', `* ${senderName} ${text}`, 'action');
            } else {
                messageEl.innerHTML = `
                    <div class="sender">${senderName}<span class="timestamp">${displayTime}</span></div>
                    <div class="text">${processedText}</div>`;
            }
        }
        
        ui.chatMessages.appendChild(messageEl);
        ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight;
    }

    function populateChannelList(channels) {
        const listEl = document.getElementById('chat-channels-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        channels.forEach(channel => {
            const itemEl = document.createElement('li');
            const icon = channel.protected ? 'bxs-lock-alt' : 'bxs-group';
            itemEl.innerHTML = `<a href="group.html?channel=${channel.id}&name=${encodeURIComponent(channel.name)}"><i class='bx ${icon}'></i><span>${channel.name}</span></a>`;
            listEl.appendChild(itemEl);
        });
    }

    function goDarkSequence() {
        const steps = [
            { text: "INITIATING SHUTDOWN PROTOCOL...", duration: 1500 },
            { text: "SCRUBBING SESSION TOKEN...", duration: 1500 },
            { text: "ERASING COMMUNICATION TRACES...", duration: 1000 },
            { text: "SYSTEM GOING DARK.", duration: 1000 }
        ];
        ui.shutdownOverlay.classList.remove('hidden');
        setTimeout(() => ui.shutdownOverlay.style.opacity = '1', 10);
        let i = 0;
        function nextStep() {
            if (i < steps.length) {
                ui.shutdownText.textContent = steps[i].text;
                setTimeout(nextStep, steps[i].duration);
                i++;
            } else {
                localStorage.clear();
                socket.disconnect();
                window.location.href = 'friends.html'; 
            }
        }
        nextStep();
    }
    
    function showTypingIndicator(user, isTyping) {
        const userEl = ui.activeUsersList.querySelector(`li[data-user="${user}"]`);
        if (userEl) userEl.classList.toggle('is-typing', isTyping);
        const activeTypers = Array.from(ui.activeUsersList.querySelectorAll('.is-typing')).map(el => el.dataset.user);
        ui.typingIndicator.textContent = activeTypers.length > 0 ? `${activeTypers.join(', ')} is transmitting...` : '';
    }

    function updateMOTD(message) { ui.motdText.textContent = message; }
    
    function updateAgentStatus({ displayName: user, status }) {
        const agentEl = ui.activeUsersList.querySelector(`li[data-user="${user}"] .agent-status`);
        if (agentEl) agentEl.textContent = `// ${status}`;
    }

    function displayPing(senderName) {
        audio.ping.play();
        ui.pingOverlay.classList.remove('hidden');
        addLogEntry('System', `You have been pinged by agent ${senderName}.`, 'game');
        setTimeout(() => ui.pingOverlay.classList.add('hidden'), 700);
    }
    
    function updateActiveUsersList(users) {
        ui.activeUsersList.innerHTML = '';
        users.sort((a, b) => a.displayName.localeCompare(b.displayName)).sort((a, b) => a.displayName === displayName ? -1 : b.displayName === displayName ? 1 : 0);
        users.forEach(user => {
            const userEl = document.createElement('li');
            userEl.dataset.user = user.displayName;
            const isMe = user.displayName === displayName;
            if (isMe) { userEl.classList.add('me'); }
            userEl.innerHTML = `
                <div><span class="clickable-agent" title="View Dossier">${user.displayName}${isMe ? ' <span class="you-indicator">(You)</span>' : ''}</span><span class="agent-status">// ${user.status || 'Online'}</span></div>
                ${!isMe ? `<div class="agent-actions"><i class='bx bxs-bell-ring' title="Ping Agent"></i><a href="private.html?recipient=${user.displayName}" title="Open Private Comms"><i class='bx bxs-message-dots'></i></a></div>` : ''}`;
            ui.activeUsersList.appendChild(userEl);
        });
    }

    function showDossier(agent) {
        const bios = ["Specializes in digital infiltration and data exfiltration.", "A field operative known for exceptional problem-solving under pressure.", "Lead analyst for Operation Nightingale. Finds patterns in chaos.", "Former black-hat, now a key asset in our cyber-defense division."];
        const ranks = ["Field Agent", "Specialist", "Senior Analyst", "Operator", "Commander"];
        const seed = agent.displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        ui.dossierBody.innerHTML = `
            <div class="dossier-header"><div class="dossier-avatar">${agent.displayName.substring(0, 2).toUpperCase()}</div><div class="dossier-title"><h3>${agent.displayName}</h3><p>Rank: ${ranks[seed % ranks.length]} | Role: ${agent.role}</p></div></div>
            <div class="dossier-section"><h4>Agent Status</h4><p>${agent.status}</p></div>
            <div class="dossier-section"><h4>Psychological Profile</h4><p class="dossier-bio">${bios[seed % bios.length]}</p></div>
            <div class="dossier-section"><h4>Recognitions & Achievements</h4><ul class="dossier-achievements-list">${agent.achievements.length > 0 ? agent.achievements.map(ach => `<li>${ach}</li>`).join('') : '<li>No recognitions on record.</li>'}</ul></div>`;
        ui.dossierModal.classList.remove('hidden');
    }
    
    function startNetworkAnimation() {
        if (networkInterval) clearInterval(networkInterval);
        networkInterval = setInterval(() => {
            if (ui.uplinkBar) ui.uplinkBar.style.width = `${Math.random() * 40 + 60}%`;
            if (ui.integrityBar) ui.integrityBar.style.width = `${Math.random() * 10 + 90}%`;
            if (ui.firewallBar) ui.firewallBar.style.width = `${Math.random() * 20 + 75}%`;
        }, 1500);
    }
    
    async function initializeIntelFeed() {
        let intelData = []; let currentIndex = 0; const MAX_VISIBLE_ITEMS = 5;
        function addIntelItem(itemData) {
            if (!ui.intelTicker) return;
            const intelItem = document.createElement('div');
            intelItem.className = 'intel-item';
            intelItem.style.opacity = '0'; intelItem.style.transform = 'translateY(20px)';
            intelItem.innerHTML = `<span class="intel-tag ${itemData.type}">${itemData.tag}</span><p class="intel-text">${itemData.text}</p>`;
            ui.intelTicker.appendChild(intelItem);
            setTimeout(() => { intelItem.style.opacity = '1'; intelItem.style.transform = 'translateY(0)'; }, 100);
            if (ui.intelTicker.children.length > MAX_VISIBLE_ITEMS) {
                const oldestItem = ui.intelTicker.firstElementChild;
                oldestItem.style.opacity = '0'; setTimeout(() => oldestItem.remove(), 500);
            }
        }
        async function fetchIntel() {
            try {
                // --- FIX: ADDED Authorization header to fetch call ---
                const response = await fetch(`${SERVER_URL}/api/intel-feed`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) { addIntelItem({ tag: 'ALERT', type: 'alert', text: 'Intel feed servers unresponsive. Retrying...' }); return; }
                const data = await response.json();
                if (data && data.length > 0) { intelData = data.sort(() => 0.5 - Math.random()); currentIndex = 0; }
            } catch (error) { console.error("Could not fetch intel feed:", error); addIntelItem({ tag: 'ERROR', type: 'alert', text: 'Local connection to intel feed severed.' }); }
        }
        function cycleIntel() {
            if (intelData.length === 0) return;
            if (currentIndex >= intelData.length) currentIndex = 0;
            addIntelItem(intelData[currentIndex]); currentIndex++;
        }
        addIntelItem({ tag: 'SYSTEM', type: 'system', text: 'Connecting to global intel network...' });
        await fetchIntel(); setInterval(cycleIntel, 4000); setInterval(fetchIntel, 300000);
    }

    function showAchievementToast(achievement) {
        if(!userAchievements.includes(achievement)){
            userAchievements.push(achievement);
            localStorage.setItem('friends-achievements', JSON.stringify(userAchievements));
        }
        ui.achievementToast.textContent = `🏆 Achievement Unlocked: ${achievement}`;
        ui.achievementToast.className = 'hidden'; void ui.achievementToast.offsetWidth;
        ui.achievementToast.classList.remove('hidden'); audio.achievement.play();
    }

    function checkAchievements(action, commandName = '') {
        if (action === 'sendMessage') {
            messageCount++;
            if (messageCount === 1 && !userAchievements.includes('First Transmission')) socket.emit('achievement:trigger', 'First Transmission');
            if (messageCount === 50 && !userAchievements.includes('Chatterbox')) socket.emit('achievement:trigger', 'Chatterbox');
        }
        if (action === 'winGame') {
            gamesWon++;
            if (gamesWon === 1 && !userAchievements.includes('Strategist')) socket.emit('achievement:trigger', 'Strategist');
            if (gamesWon === 5 && !userAchievements.includes('Grandmaster')) socket.emit('achievement:trigger', 'Grandmaster');
        }
        if(action === 'useCommand') {
            commandsUsed.add(commandName);
            const totalCommands = Object.keys(commands).filter(c => !c.includes(' ') && !['motd', 'kick'].includes(c)).length;
            if (commandsUsed.size >= totalCommands && !userAchievements.includes('System Admin')) { socket.emit('achievement:trigger', 'System Admin'); }
        }
        if (action === 'hackerman' && !userAchievements.includes('Script Kiddie')) {
             socket.emit('achievement:trigger', 'Script Kiddie');
        }
    }
    
    function updateGameUI(newState) {
        if (!newState || !newState.board) return;
        gameState = newState;
        const myMark = gameState.players.X === displayName ? 'X' : (gameState.players.O === displayName ? 'O' : null);
        const isMyTurn = gameState.currentPlayer === myMark && !gameState.winner;
        ui.gameBoard.classList.toggle('my-turn', isMyTurn); ui.gameBoard.classList.toggle('opponent-turn', !isMyTurn);
        ui.cells.forEach((cell, i) => { cell.textContent = gameState.board[i] || ''; cell.className = 'cell'; if (gameState.board[i]) cell.classList.add(gameState.board[i]); });
        if (gameState.winner) {
            const winnerName = gameState.players[gameState.winner] || 'Unknown';
            ui.gameStatus.textContent = `SIMULATION OVER. VICTOR: ${winnerName}`;
            addLogEntry('Strat-Sim', `Victor: ${winnerName}`, 'game');
            if (winnerName === displayName) { checkAchievements('winGame'); }
        } else if (gameState.isDraw) {
            ui.gameStatus.textContent = "STALEMATE DETECTED."; addLogEntry('Strat-Sim', 'Stalemate reached.', 'game');
        } else {
            const currentPlayerName = gameState.players[gameState.currentPlayer] || 'Unassigned';
            ui.gameStatus.textContent = `Awaiting move from: ${currentPlayerName}`;
        }
    }

    function sendMessage(isDestruct) {
        if (!isReady) { addLogEntry('System', 'Connection not synchronized. Please wait.', 'disconnect'); return; }
        const text = ui.chatInput.value.trim();
        if (!text) return;
        if (text.startsWith('/me ')) {
            const actionText = text.substring(4);
            socket.emit('chat:message', { sender: displayName, text: actionText, isAction: true, channel: 'public' });
        } else {
            socket.emit('chat:message', { sender: displayName, text, selfDestruct: isDestruct, channel: 'public' });
            checkAchievements('sendMessage');
        }
        socket.emit('chat:stopped_typing', displayName);
        isTyping = false; clearTimeout(typingTimeout); ui.chatInput.value = '';
    }
    
    function handleTyping() {
        if (!isTyping) { isTyping = true; socket.emit('chat:typing', displayName); }
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => { isTyping = false; socket.emit('chat:stopped_typing', displayName); }, 2000);
    }

    function handleGameClick(e) {
        if (e.target.classList.contains('cell')) {
            const index = parseInt(e.target.dataset.index);
            socket.emit('game:make_move', { index, player: displayName });
        }
    }

    function handleAgentActions(e) {
        const targetUserEl = e.target.closest('li');
        if (!targetUserEl) return;
        const targetUser = targetUserEl.dataset.user;
        if (e.target.matches('.bxs-bell-ring')) {
            socket.emit('agent:ping', targetUser);
            addLogEntry('System', `Ping sent to ${targetUser}.`, 'connect');
        } else if (e.target.matches('.clickable-agent')) {
            socket.emit('user:get_details', targetUser, (details) => {
                 if (details) showDossier(details);
                 else addLogEntry('System', `Could not retrieve dossier for ${targetUser}.`, 'disconnect');
            });
        }
    }
    
    function handleLogFilter(e) {
        if (!e.target.matches('.log-filter-btn')) return;
        const filter = e.target.dataset.filter;
        ui.logFilters.querySelectorAll('.log-filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        ui.systemLog.querySelectorAll('.log-entry').forEach(entry => {
            if (filter === 'all' || entry.dataset.filter === filter) { entry.classList.remove('hidden-log'); } 
            else { entry.classList.add('hidden-log'); }
        });
    }
    
    function runLockdownSequence() {
        printToTerminal("INITIATING SYSTEM LOCKDOWN...", "error");
        ui.lockdownOverlay.classList.remove('hidden');
        ui.lockdownBanner.classList.remove('hidden');
        audio.alarm.play();
        setTimeout(() => {
            ui.lockdownOverlay.classList.add('hidden');
            ui.lockdownBanner.classList.add('hidden');
            audio.alarm.pause();
            audio.alarm.currentTime = 0;
            printToTerminal("Lockdown lifted. System returning to normal operations.", "success");
        }, 5000);
    }

    // --- TERMINAL LOGIC ---
    const printToTerminal = (message, className = '') => {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = message;
        line.innerHTML = tempDiv.innerHTML.replace(/ /g, '&nbsp;');
        ui.terminalOutput.appendChild(line);
        ui.terminalOutput.scrollTop = ui.terminalOutput.scrollHeight;
    };

    const commands = {
        help: {
            description: "Lists all available shell commands.",
            execute: () => {
                printToTerminal("COVERT_OPS_HUB Shell - Available Commands:", "system");
                Object.keys(commands).forEach(cmd => {
                    if (cmd.includes(' ')) return;
                    const command = commands[cmd];
                    printToTerminal(`<span class="help-command">${cmd}</span> <span class="help-description">${command.description}</span>`);
                });
            }
        },
        clear: { description: "Clears the terminal screen.", execute: () => { ui.terminalOutput.innerHTML = ''; } },
        setprop: {
            description: "[Admin] Views or changes a UI color property. Use aliases for simplicity.",
            execute: (args) => {
                if (userRole !== 'Admin') return printToTerminal("Error: Access denied. Requires Admin clearance.", "error");
                const propAliases = {'primary': '--glitch-color-1','secondary': '--glitch-color-2','system': '--system-color','background': '--bg-color','text': '--text-color','card': '--card-bg','border': '--border-color','error': '--error-color'};
                if (args.length === 0) {
                    printToTerminal("Available UI properties and their current values:", "system");
                    printToTerminal("Usage: setprop &lt;alias&gt; &lt;new_value&gt;");
                    const rootStyles = getComputedStyle(document.documentElement);
                    for (const alias in propAliases) {
                        const cssVar = propAliases[alias];
                        const currentValue = rootStyles.getPropertyValue(cssVar).trim();
                        printToTerminal(`<span class="help-command">${alias}</span> <span class="help-description">(${cssVar}) = ${currentValue}</span>`);
                    }
                    return;
                }
                const alias = args[0].toLowerCase(), cssVarToSet = propAliases[alias];
                if (!cssVarToSet) return printToTerminal(`Error: '${alias}' is not a valid alias.`, 'error');
                if (args.length < 2) return printToTerminal(`Error: Please provide a value for '${alias}'.`, 'error');
                const value = args.slice(1).join(' ');
                document.documentElement.style.setProperty(cssVarToSet, value);
                printToTerminal(`Set ${alias} (${cssVarToSet}) to ${value}`, "success");
            }
        },
        resetui: {
            description: "[Admin] Resets any custom UI changes made with 'setprop'.",
            execute: () => {
                if (userRole !== 'Admin') return printToTerminal("Error: Access denied. Requires Admin clearance.", "error");
                document.documentElement.removeAttribute('style');
                printToTerminal("UI properties reset to default.", "success");
            }
        },
        scan: {
            description: "Scans for active agents on the network.",
            execute: () => {
                printToTerminal("Scanning for active agents...", "system");
                const users = Array.from(ui.activeUsersList.querySelectorAll('li')).map(li => li.querySelector('div > span').textContent.replace(/ \/\/.*$/, '').replace(' (You)', '').trim());
                setTimeout(() => {
                    printToTerminal(`Scan complete. Found ${users.length} agent(s):`, "success");
                    users.forEach(user => printToTerminal(`- ${user}`));
                }, 1000);
            }
        },
        broadcast: {
            description: "[Admin] Sends a system-wide broadcast. Usage: broadcast &lt;message&gt;",
            execute: (args) => {
                if (userRole !== 'Admin') return printToTerminal("Error: Access denied. Requires Admin clearance.", "error");
                if (args.length === 0) return printToTerminal("Error: Message cannot be empty.", "error");
                const text = `// BROADCAST // ${args.join(' ')}`;
                socket.emit('chat:message', { sender: 'SYS_ADMIN', text, selfDestruct: false, channel: 'public' });
                printToTerminal("Broadcast transmitted.", "success");
            }
        },
        purge: {
            description: "[Admin] Initiates the public communications purge protocol.",
            execute: () => {
                if (userRole !== 'Admin') return printToTerminal("Error: Access denied. Requires Admin clearance.", "error");
                printToTerminal("WARNING: This will permanently delete public chat logs.", "error");
                printToTerminal("Type 'purge confirm' to proceed.");
            }
        },
        'purge confirm': {
            description: "Confirms and executes the purge. (Internal)",
            execute: () => {
                if (userRole !== 'Admin') return printToTerminal("Error: Access denied. Requires Admin clearance.", "error");
                socket.emit('system:purge_chat');
                printToTerminal("Purge protocol initiated.", "success");
            }
        },
        whoami: {
            description: "Displays your agent information.",
            execute: () => {
                printToTerminal(`Agent Codename: ${displayName}`, "system");
                printToTerminal(`Clearance Level: ${userRole}`);
                printToTerminal(`Session Start: ${sessionStartTime.toLocaleString()}`);
            }
        },
        cmatrix: {
            description: "Engages digital rain. Usage: cmatrix [on|off]",
            execute: (args) => {
                if (args[0] === 'on') { startCMatrix(); printToTerminal("Engaging the matrix...", "success"); }
                else if (args[0] === 'off') { stopCMatrix(); printToTerminal("Disengaging.", "success"); }
                else printToTerminal("Usage: cmatrix [on|off]", "error");
            }
        },
        lockdown: {
            description: "[Admin] Initiates a system-wide lockdown alert.",
            execute: () => {
                if (userRole !== 'Admin') return printToTerminal("Error: Access denied. Requires Admin clearance.", "error");
                runLockdownSequence();
            }
        },
        // --- FIX: ADDED revshell command ---
        revshell: {
            description: "Establishes a reverse shell to a target IP. [REDACTED]",
            execute: (args) => {
                printToTerminal(`Attempting to establish reverse shell to ${args[0] || '127.0.0.1'}...`, "system");
                setTimeout(() => {
                    printToTerminal("ALERT: Outbound connection on port 4444 detected.", "error");
                    printToTerminal("FIREWALL: Malicious activity signature matched: 'REVERSE_SHELL_PAYLOAD'", "error");
                    printToTerminal("SYSTEM: Connection terminated. Anomaly logged. Engaging lockdown.", "error");
                    runLockdownSequence();
                    checkAchievements('hackerman');
                }, 1500);
            }
        },
        theme: {
            description: "Save, load, list, or delete UI themes. Usage: theme &lt;action&gt; [name]",
            execute: (args) => {
                const action = args[0], themeName = args[1];
                let themes = JSON.parse(localStorage.getItem('hub-themes')) || {};
                if (action === 'save' && themeName) {
                    themes[themeName] = document.documentElement.style.cssText;
                    localStorage.setItem('hub-themes', JSON.stringify(themes));
                    printToTerminal(`Theme '${themeName}' saved.`, 'success');
                } else if (action === 'load' && themeName) {
                    if (themes[themeName]) {
                        document.documentElement.style.cssText = themes[themeName];
                        printToTerminal(`Theme '${themeName}' loaded.`, 'success');
                    } else printToTerminal(`Error: Theme '${themeName}' not found.`, 'error');
                } else if (action === 'list') {
                    printToTerminal("Saved themes:", 'system');
                    Object.keys(themes).length > 0 ? Object.keys(themes).forEach(t => printToTerminal(`- ${t}`)) : printToTerminal("No themes saved.");
                } else if (action === 'delete' && themeName) {
                    delete themes[themeName];
                    localStorage.setItem('hub-themes', JSON.stringify(themes));
                    printToTerminal(`Theme '${themeName}' deleted.`, 'success');
                } else printToTerminal("Usage: theme &lt;save|load|list|delete&gt; [name]", 'error');
            }
        },
        motd: {
            description: "[Admin] Sets the Message of the Day. Usage: motd &lt;message&gt;",
            execute: (args) => {
                if (userRole !== 'Admin') return printToTerminal("Error: Access denied. Requires Admin clearance.", "error");
                if (args.length === 0) return printToTerminal("Error: Message cannot be empty.", "error");
                socket.emit('admin:set_motd', args.join(' '));
            }
        },
        kick: {
            description: "[Admin] Disconnects an agent. Usage: kick &lt;codename&gt;",
            execute: (args) => {
                if (userRole !== 'Admin') return printToTerminal("Error: Access denied. Requires Admin clearance.", "error");
                if (args.length === 0) return printToTerminal("Error: Must specify an agent codename.", "error");
                socket.emit('admin:kick_user', args[0]);
                printToTerminal(`Kick command issued for agent ${args[0]}.`, "system");
            }
        },
        create_channel: {
            description: "Creates a new chat channel. Usage: create_channel &lt;name&gt; [password]",
            execute: (args) => {
                if (args.length === 0) return printToTerminal("Usage: create_channel &lt;name&gt; [password]", "error");
                socket.emit('channel:create', { channelName: args[0], password: args[1] || null });
                printToTerminal(`Requesting creation of channel '${args[0]}'...`, "system");
            }
        },
        exit: { description: "Closes the system shell.", execute: () => toggleTerminal(false) }
    };

    function handleTerminalInput(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                ui.terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                ui.terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                ui.terminalInput.value = '';
            }
        } else if (e.key === 'Enter') {
            audio.typing.pause();
            const fullInput = ui.terminalInput.value.trim();
            if (fullInput) {
                const sanitizedInput = fullInput.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                printToTerminal(`<span class="terminal-prompt">AGENT@COVERT_HUB:~$</span> ${sanitizedInput}`, 'command');
                commandHistory.unshift(fullInput);
                historyIndex = -1;
                const [command, ...args] = fullInput.split(/\s+/);
                const cmdToExecute = commands[fullInput.toLowerCase()] || commands[command.toLowerCase()];
                if (cmdToExecute) {
                    cmdToExecute.execute(args);
                    checkAchievements('useCommand', command.toLowerCase());
                } else {
                    printToTerminal(`shell: command not found: ${command}`, "error");
                }
            }
            ui.terminalInput.value = '';
        } else {
            if (ui.terminalInput.value.length > 0) audio.typing.play().catch(()=>{});
            else audio.typing.pause();
        }
    }

    function toggleTerminal(show) {
        if (show) {
            ui.terminalContainer.classList.remove('hidden');
            ui.terminalInput.focus();
            if(ui.terminalOutput.innerHTML.trim() === '') {
                 printToTerminal("COVERT_OPS_HUB Shell [Version 2.0]", "system");
                 printToTerminal("Type 'help' for a list of commands.");
            }
        } else {
            ui.terminalContainer.classList.add('hidden');
            audio.typing.pause();
        }
    }
    
    function startCMatrix() {
        ui.cmatrixCanvas.style.display = 'block';
        const ctx = ui.cmatrixCanvas.getContext('2d');
        ui.cmatrixCanvas.width = window.innerWidth;
        ui.cmatrixCanvas.height = window.innerHeight;
        const matrixColor = getComputedStyle(document.documentElement).getPropertyValue('--glitch-color-1').trim();
        const alphabet = 'アァカサタナハマヤャラワガザダバパイキシチニヒミリヰギジヂビピウゥクスツヌフムユュルABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 16, columns = ui.cmatrixCanvas.width / fontSize;
        const rainDrops = Array.from({ length: columns }).fill(1);
        const draw = () => {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.05)';
            ctx.fillRect(0, 0, ui.cmatrixCanvas.width, ui.cmatrixCanvas.height);
            ctx.fillStyle = matrixColor;
            ctx.font = `${fontSize}px monospace`;
            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
                if (rainDrops[i] * fontSize > ui.cmatrixCanvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        };
        if (cmatrixInterval) clearInterval(cmatrixInterval);
        cmatrixInterval = setInterval(draw, 33);
    }

    function stopCMatrix() {
        if (cmatrixInterval) clearInterval(cmatrixInterval);
        cmatrixInterval = null;
        ui.cmatrixCanvas.style.display = 'none';
    }

    // --- FILE HANDLING LOGIC ---
    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    function formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];
        if (file.size > MAX_FILE_SIZE) {
            addLogEntry('FileSend', `Transmission failed: ${file.name} exceeds 5MB limit.`, 'disconnect');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            fileToSend = { file: file, dataUrl: e.target.result };
            showPreviewModal(fileToSend);
        };
        reader.onerror = () => {
             addLogEntry('FileSend', `Transmission failed: Could not read ${file.name}.`, 'disconnect');
        };
        reader.readAsDataURL(file);
    }

    function showPreviewModal({ file, dataUrl }) {
        const previewArea = ui.filePreviewArea;
        previewArea.innerHTML = ''; 
        let previewElement;
        
        if (file.type.startsWith('image/')) {
            previewElement = `<img src="${dataUrl}" alt="File preview" class="preview-image">`;
        } else {
            previewElement = `<i class='bx bxs-file-blank preview-icon'></i>`;
        }

        previewArea.innerHTML = `
            ${previewElement}
            <div class="file-preview-info">
                <div class="filename">${file.name}</div>
                <div class="filetype">${file.type || 'Unknown type'}</div>
                <div class="filesize">${formatFileSize(file.size)}</div>
            </div>
        `;

        const select = ui.fileDestinationSelect;
        select.innerHTML = ''; 
        const publicOpt = document.createElement('option');
        publicOpt.value = 'public'; publicOpt.textContent = 'Public Comms'; publicOpt.dataset.type = 'public';
        select.appendChild(publicOpt);
        
        const agentGroup = document.createElement('optgroup');
        agentGroup.label = 'Private Message To Agent';
        ui.activeUsersList.querySelectorAll('li:not(.me)').forEach(li => {
            const agentName = li.dataset.user;
            const agentOpt = document.createElement('option');
            agentOpt.value = agentName; agentOpt.textContent = agentName; agentOpt.dataset.type = 'private';
            agentGroup.appendChild(agentOpt);
        });
        select.appendChild(agentGroup);
        
        const channelGroup = document.createElement('optgroup');
        channelGroup.label = 'Group Channels';
        document.querySelectorAll('#chat-channels-list li a').forEach(a => {
            const urlParams = new URLSearchParams(a.search);
            const channelId = urlParams.get('channel');
            const channelName = urlParams.get('name');
            const channelOpt = document.createElement('option');
            channelOpt.value = channelId; channelOpt.textContent = channelName; channelOpt.dataset.type = 'group';
            channelGroup.appendChild(channelOpt);
        });
        select.appendChild(channelGroup);
        ui.fileDestinationModal.classList.remove('hidden');
    }
    function sendFile({ file, dataUrl }, channel, destinationName) {
        addLogEntry('FileSend', `Transmitting ${file.name} to ${destinationName}...`, 'system');
        socket.emit('chat:file_message', {
            sender: displayName,
            fileName: file.name,
            fileType: file.type,
            fileData: dataUrl,
            channel: channel
        });
        addLogEntry('FileSend', `Transmission of ${file.name} complete.`, 'connect');
    }

    function handleDrop(e) {
        preventDefaults(e);
        handleFiles(e.dataTransfer.files);
    }

    // --- 6. BIND EVENT LISTENERS & INITIALIZE ---
    function bindEventListeners() {
        // Core UI
        ui.logoutButton.addEventListener('click', goDarkSequence);
        ui.chatForm.addEventListener('submit', (e) => { e.preventDefault(); sendMessage(false); });
        ui.selfDestructBtn.addEventListener('click', () => sendMessage(true));
        ui.chatInput.addEventListener('input', handleTyping);
        ui.activeUsersList.addEventListener('click', handleAgentActions);
        ui.gameBoard.addEventListener('click', handleGameClick);
        ui.resetButton.addEventListener('click', () => socket.emit('game:reset'));
        ui.statusForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newStatus = ui.statusInput.value.trim();
            if (newStatus) socket.emit('agent:set_status', newStatus);
            ui.statusInput.value = '';
        });
        ui.purgeCommsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to permanently purge all public communications?')) {
                socket.emit('system:purge_chat');
            }
        });
        ui.dossierCloseBtn.addEventListener('click', () => ui.dossierModal.classList.add('hidden'));
        ui.logFilters.addEventListener('click', handleLogFilter);
        ui.volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            localStorage.setItem('friends-volume', volume);
            applyVolumeSettings();
        });

        ui.muteButton.addEventListener('click', () => {
            const isMuted = localStorage.getItem('friends-isMuted') === 'true';
            localStorage.setItem('friends-isMuted', !isMuted); 
            applyVolumeSettings();
        });
        
        // File Send Listeners
        ui.fileTransferArea.addEventListener('click', () => ui.fileUploadInput.click());
        ui.fileUploadInput.addEventListener('change', (e) => handleFiles(e.target.files));
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            ui.fileTransferArea.addEventListener(eventName, preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            ui.fileTransferArea.addEventListener(eventName, () => ui.fileTransferArea.classList.add('dragover'), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            ui.fileTransferArea.addEventListener(eventName, () => ui.fileTransferArea.classList.remove('dragover'), false);
        });
        ui.fileTransferArea.addEventListener('drop', handleDrop, false);
        
        ui.fileDestinationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!fileToSend) return;
            const selectedOption = ui.fileDestinationSelect.options[ui.fileDestinationSelect.selectedIndex];
            const type = selectedOption.dataset.type;
            const value = selectedOption.value;
            const destinationName = selectedOption.textContent;
            let channel;

            if (type === 'public') { channel = 'public'; } 
            else if (type === 'group') { channel = value; } 
            else if (type === 'private') { channel = [displayName, value].sort().join('-'); }

            if (channel) {
                sendFile(fileToSend, channel, destinationName);
            }
            
            ui.fileDestinationModal.classList.add('hidden');
            fileToSend = null;
        });
        ui.fileDestinationCancelBtn.addEventListener('click', () => {
            ui.fileDestinationModal.classList.add('hidden');
            fileToSend = null;
        });
        
        // Terminal UI
        ui.terminalToggleBtn.addEventListener('click', () => toggleTerminal(true));
        ui.terminalCloseBtn.addEventListener('click', () => toggleTerminal(false));
        ui.terminalInput.addEventListener('keydown', handleTerminalInput);
        ui.terminalContainer.addEventListener('click', () => ui.terminalInput.focus());
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                toggleTerminal(!ui.terminalContainer.classList.contains('hidden'));
            }
        });

        // Socket Event Listeners
        socket.on('connect', onConnect);
        socket.on('system:ready', () => {
            isReady = true; addLogEntry('System', 'Network link synchronized.', 'connect');
            socket.emit('chat:get_history'); socket.emit('game:get_state');
        });
        socket.on('chat:history', (history) => { ui.chatMessages.innerHTML = ''; history.forEach(appendChatMessage); });
        socket.on('chat:message', appendChatMessage);
        socket.on('update:active_users', updateActiveUsersList);
        socket.on('system:channels_list', populateChannelList);
        socket.on('broadcast:user_connected', (user) => addLogEntry('System', `Agent ${user} is online.`, 'connect'));
        socket.on('broadcast:user_disconnected', (user) => addLogEntry('System', `Agent ${user} went dark.`, 'disconnect'));
        socket.on('chat:typing', (user) => showTypingIndicator(user, true));
        socket.on('chat:stopped_typing', (user) => showTypingIndicator(user, false));
        socket.on('game:update', updateGameUI);
        socket.on('audio:play', (sound) => { if (audio[sound]) audio[sound].play().catch(e => {}); });
        socket.on('broadcast:motd_update', updateMOTD);
        socket.on('broadcast:status_update', updateAgentStatus);
        socket.on('notification:ping', displayPing);
        socket.on('broadcast:chat_purged', () => {
            ui.chatMessages.innerHTML = '';
            addLogEntry('System', 'Public comms log has been purged remotely.', 'disconnect');
        });
        socket.on('notification:achievement_unlocked', showAchievementToast);
        socket.on('system:kick', (reason) => { alert(reason); goDarkSequence(); });
        socket.on('system:error', (message) => printToTerminal(message, 'error'));
        socket.on('system:success', (message) => printToTerminal(message, 'success'));
    }

    // --- 7. START THE APPLICATION ---
    init();
});
