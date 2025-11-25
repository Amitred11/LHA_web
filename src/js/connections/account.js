document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIG & AUTH ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com';
    
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('accessToken'); 

    // Auth Check
    if (!userId || !token) {
        console.error("Auth missing. Redirecting to login.");
        window.location.href = '/src/screens/auth/signin.html';
        return;
    }

    // --- DOM ELEMENT REFERENCES ---
    const elements = {
        // Player Card
        avatar: document.getElementById('player-avatar'),
        level: document.getElementById('player-level'),
        username: document.getElementById('player-username'),
        jobClass: document.getElementById('player-job-class'),
        xpBar: document.getElementById('player-xp-bar'),
        xpText: document.getElementById('player-xp-text'),
        // Inputs
        avatarUploadInput: document.getElementById('avatar-upload-input'),
        displayNameInput: document.getElementById('displayName-input'),
        jobClassSelect: document.getElementById('jobClass-select'),
        bioTextarea: document.getElementById('bio-textarea'),
        githubInput: document.getElementById('github-input'),
        portfolioInput: document.getElementById('portfolio-input'),
        saveProfileBtn: document.getElementById('save-profile-btn'),
        // Attributes
        attrIntText: document.getElementById('attr-int-text'),
        attrIntBar: document.getElementById('attr-int-bar'),
        attrDexText: document.getElementById('attr-dex-text'),
        attrDexBar: document.getElementById('attr-dex-bar'),
        attrChaText: document.getElementById('attr-cha-text'),
        attrChaBar: document.getElementById('attr-cha-bar'),
        // Tabs & Navigation
        navLinks: document.querySelectorAll('.account-nav-link'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        folderLabel: document.getElementById('folder-label'),
        logoutBtn: document.getElementById('logout-btn'), // Added Logout Button
        // Quest Log Grid 
        projectGrid: document.getElementById('account-projects-grid') 
    };

    const tabLabels = { 'overview': 'overview.sys', 'projects': 'quest_log.exe' };

    // ==========================================
    // 1. PROFILE LOGIC
    // ==========================================
    async function fetchAndPopulateProfile() {
        const defaultProfile = {
            avatarUrl: null,
            level: 1,
            jobClass: 'Novice',
            xp: 0,
            xpMax: 1000,
            attributes: { int: 1, dex: 1, cha: 1 },
            displayName: 'New User',
            bio: 'Ready to start the adventure.',
            githubUrl: '',
            portfolioUrl: ''
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${userId}`);
            
            let profile = defaultProfile;
            let username = 'User';

            if (response.ok) {
                const data = await response.json();
                username = data.username || 'User';
                if (data.profile) {
                    profile = { 
                        ...defaultProfile, 
                        ...data.profile,
                        attributes: { ...defaultProfile.attributes, ...(data.profile.attributes || {}) }
                    };
                }
            }

            // Populate UI
            if (profile.avatarUrl) {
                elements.avatar.src = `${API_BASE_URL}${profile.avatarUrl}`;
            } else {
                elements.avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=128`;
            }

            elements.level.innerText = `LVL. ${profile.level}`;
            elements.username.innerText = username;
            elements.jobClass.innerText = profile.jobClass;
            
            const safeXp = profile.xp || 0;
            const safeMax = profile.xpMax || 1000;
            const xpPercentage = (safeXp / safeMax) * 100;
            
            elements.xpBar.style.width = `${xpPercentage}%`;
            elements.xpText.innerText = `${safeXp} / ${safeMax}`;

            elements.attrIntText.innerText = `LVL ${profile.attributes.int}`;
            elements.attrIntBar.style.width = `${profile.attributes.int * 10}%`;
            elements.attrDexText.innerText = `LVL ${profile.attributes.dex}`;
            elements.attrDexBar.style.width = `${profile.attributes.dex * 10}%`;
            elements.attrChaText.innerText = `LVL ${profile.attributes.cha}`;
            elements.attrChaBar.style.width = `${profile.attributes.cha * 10}%`;

            elements.displayNameInput.value = profile.displayName;
            elements.jobClassSelect.value = profile.jobClass; 
            elements.bioTextarea.value = profile.bio;
            elements.githubInput.value = profile.githubUrl;
            elements.portfolioInput.value = profile.portfolioUrl;

        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }
    
    async function handleProfileSave() {
        const originalBtnText = elements.saveProfileBtn.innerHTML;
        elements.saveProfileBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Saving...';
        elements.saveProfileBtn.disabled = true;

        const profileData = {
            displayName: elements.displayNameInput.value,
            jobClass: elements.jobClassSelect.value,
            bio: elements.bioTextarea.value,
            githubUrl: elements.githubInput.value,
            portfolioUrl: elements.portfolioInput.value,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) throw new Error('Failed to save.');

            elements.jobClass.innerText = profileData.jobClass;
            alert('Profile saved successfully!');
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            elements.saveProfileBtn.innerHTML = originalBtnText;
            elements.saveProfileBtn.disabled = false;
        }
    }

    async function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${userId}/avatar`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            elements.avatar.src = `${API_BASE_URL}${result.avatarUrl}`;
            alert(result.message);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    // ==========================================
    // 2. QUEST LOG LOGIC (Projects)
    // ==========================================
    async function fetchPlayerQuests() {
        if (!elements.projectGrid) return; 

        try {
            elements.projectGrid.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-circle-notch fa-spin text-primary"></i> Loading Quests...</div>';

            const response = await fetch(`${API_BASE_URL}/api/projects`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            // Handle Auth Errors (401)
            if (response.status === 401) {
                console.warn("Session expired. Clearing storage.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                window.location.href = '/src/screens/auth/signin.html';
                return;
            }

            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`);
            }

            const projects = await response.json();

            if (!Array.isArray(projects)) {
                console.error("Data received:", projects);
                throw new Error("Invalid data format: Expected a list of projects.");
            }

            renderQuestLog(projects);

        } catch (error) {
            console.error('Quest Log Error:', error);
            elements.projectGrid.innerHTML = `
                <div class="col-span-full text-center text-red-500 border border-red-200 bg-red-50 p-4 rounded-xl">
                    <p class="font-bold">Failed to load quest log.</p>
                    <p class="text-xs mt-1">${error.message}</p>
                </div>`;
        }
    }
    
    function renderQuestLog(projects) {
        elements.projectGrid.innerHTML = '';

        if (projects.length === 0) {
            elements.projectGrid.innerHTML = `
                <div class="col-span-full text-center py-8 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl">
                    <p class="text-gray-500 font-mono mb-4">No active quests in log.</p>
                    <a href="/src/screens/projects/start-project.html" class="text-primary font-bold hover:underline">Start a New Quest</a>
                </div>`;
            return;
        }

        projects.forEach(project => {
            elements.projectGrid.insertAdjacentHTML('beforeend', createQuestCard(project));
        });
    }

    function createQuestCard(data) {
        const statusLower = (data.status || 'active').toLowerCase();
        let config = { color: 'bg-neon-lime text-ink', icon: 'fa-bolt', border: 'border-ink' };

        if (statusLower.includes('review') || statusLower.includes('pending')) {
            config = { color: 'bg-yellow-400 text-ink', icon: 'fa-hourglass-half', border: 'border-yellow-600' };
        } 
        else if (statusLower.includes('completed')) {
            config = { color: 'bg-cyber-cyan text-ink', icon: 'fa-check-circle', border: 'border-cyan-600' };
        }

        const dateStr = data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : 'Active';

        return `
            <div class="bg-white dark:bg-zinc-900 border-2 border-ink dark:border-zinc-700 rounded-xl p-5 shadow-sm hover:border-primary transition-all">
                <div class="flex justify-between items-start mb-3">
                    <div class="${config.color} text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                        <i class="fas ${config.icon} mr-1"></i> ${data.status}
                    </div>
                    <span class="text-[10px] font-mono text-gray-400">${dateStr}</span>
                </div>
                <h3 class="font-display font-bold text-lg leading-tight mb-2">${data.title}</h3>
                <p class="text-xs text-gray-500 line-clamp-2 mb-3">${data.description}</p>
                <div class="text-xs font-bold text-primary uppercase border-t border-gray-100 dark:border-zinc-800 pt-2">
                    ${data.category || 'Project'}
                </div>
            </div>
        `;
    }

    // ==========================================
    // 3. LOGOUT LOGIC
    // ==========================================
    const handleLogout = (e) => {
        e.preventDefault();
        
        // Ensure showAlertModal is available (imported via script tag in HTML)
        if (typeof showAlertModal === 'function') {
            showAlertModal({
                title: 'Logging Out?',
                message: 'Are you sure you want to disconnect from the mainframe?',
                iconHTML: '<i class="fas fa-sign-out-alt text-3xl text-pop-pink"></i>', // Changed to pop-pink to match theme
                confirmText: 'Log Out',
                onConfirm: () => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userId'); 
                    localStorage.removeItem('username');
                    window.location.assign('/src/screens/main/index.html'); // Adjusted path based on your folder structure
                }
            });
        } else {
            // Fallback if modal script isn't loaded
            if(confirm('Disconnect from server?')) {
                localStorage.clear();
                window.location.href = '/src/screens/main/index.html';
            }
        }
    };

    // ==========================================
    // 4. UI INTERACTIONS & LISTENERS
    // ==========================================
    const switchTab = (tabId) => {
        elements.navLinks.forEach(link => link.classList.remove('active'));
        elements.tabPanes.forEach(pane => pane.classList.add('hidden'));
        const activeLink = document.querySelector(`.account-nav-link[data-tab="${tabId}"]`);
        const activePane = document.getElementById(`${tabId}-pane`);
        
        if (activeLink) activeLink.classList.add('active');
        if (activePane) activePane.classList.remove('hidden');
        if (elements.folderLabel && tabLabels[tabId]) {
            elements.folderLabel.innerText = tabLabels[tabId];
        }

        // Lazy load projects when tab is clicked
        if (tabId === 'projects') {
            fetchPlayerQuests();
        }
    };
    
    // Tab Listeners
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const tabId = link.dataset.tab;
            history.pushState(null, null, `#${tabId}`);
            switchTab(tabId);
        });
    });

    // Button Listeners
    if (elements.saveProfileBtn) elements.saveProfileBtn.addEventListener('click', handleProfileSave);
    if (elements.avatar) elements.avatar.addEventListener('click', () => elements.avatarUploadInput.click());
    if (elements.avatarUploadInput) elements.avatarUploadInput.addEventListener('change', handleAvatarUpload);
    
    // Logout Listener
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }

    // Initialization
    const currentHash = window.location.hash.substring(1);
    const initialTab = (currentHash && ['overview', 'projects'].includes(currentHash)) ? currentHash : 'overview';
    
    fetchAndPopulateProfile();
    switchTab(initialTab);
});