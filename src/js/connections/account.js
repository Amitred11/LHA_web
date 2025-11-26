document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // Ensure this matches your live backend URL or localhost
    const API_BASE_URL = 'https://backendkostudy.onrender.com';
    const USER_ID = localStorage.getItem('userId');
    const TOKEN = localStorage.getItem('accessToken');

    // --- DOM REFERENCES ---
    const dom = {
        inputs: {
            displayName: document.getElementById('input-displayName'),
            jobClass: document.getElementById('input-jobClass'),
            bio: document.getElementById('input-bio'),
            github: document.getElementById('input-github'),
            portfolio: document.getElementById('input-portfolio'),
            avatar: document.getElementById('avatar-upload-input')
        },
        buttons: {
            save: document.getElementById('save-profile-btn'),
            avatarTrigger: document.getElementById('avatar-trigger'),
            logoutDesktop: document.getElementById('logout-btn-desktop'),
            logoutMobile: document.getElementById('logout-btn-mobile'),
            themeToggle: document.getElementById('theme-toggle')
        },
        containers: {
            projectsGrid: document.getElementById('projects-grid'),
            folderLabel: document.getElementById('folder-label')
        }
    };

    // --- AUTH CHECK ---
    if (!USER_ID || !TOKEN) {
        console.warn("No credentials found, redirecting...");
        window.location.href = '/src/screens/auth/signin.html';
        return;
    }

    // --- INITIALIZATION ---
    initTheme();
    loadProfile();
    setupEventListeners();

    // --- CORE FUNCTIONS ---

    // 1. Theme Management
    function initTheme() {
        const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
        
        if(dom.buttons.themeToggle) {
            dom.buttons.themeToggle.addEventListener('click', () => {
                const isNowDark = document.documentElement.classList.toggle('dark');
                localStorage.theme = isNowDark ? 'dark' : 'light';
            });
        }
    }

    // 2. Profile Loading & Data Binding
    async function loadProfile() {
        try {
            // Note: Updated URL to match Blueprint prefix in __init__.py
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${USER_ID}`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });

            if (response.status === 401) handleLogout(false); // Token expired
            if (!response.ok) throw new Error('Failed to fetch profile');
            
            const data = await response.json();
            const profile = data.profile || {};
            const user = data.username || 'User';
            
            // Populate Inputs
            if(dom.inputs.displayName) dom.inputs.displayName.value = profile.displayName || '';
            if(dom.inputs.jobClass) dom.inputs.jobClass.value = profile.jobClass || 'Novice';
            if(dom.inputs.bio) dom.inputs.bio.value = profile.bio || '';
            if(dom.inputs.github) dom.inputs.github.value = profile.githubUrl || '';
            if(dom.inputs.portfolio) dom.inputs.portfolio.value = profile.portfolioUrl || '';

            // Update UI Elements
            updateBoundElements('username', profile.displayName || user);
            updateBoundElements('job', profile.jobClass || 'Novice');
            updateBoundElements('level', `LVL. ${profile.level || 1}`);
            
            // Avatar Handling
            let avatarUrl = `https://ui-avatars.com/api/?name=${user}&background=random&size=128`;
            if (profile.avatarUrl) {
                // Remove leading slash if present to avoid double slashes
                const cleanPath = profile.avatarUrl.startsWith('/') ? profile.avatarUrl : `/${profile.avatarUrl}`;
                avatarUrl = `${API_BASE_URL}${cleanPath}`;
            }
            
            document.querySelectorAll('[data-bind="avatar"]').forEach(img => {
                img.src = avatarUrl;
                // Fallback if image 404s
                img.onerror = function() { 
                    this.src = `https://ui-avatars.com/api/?name=${user}&background=random&size=128`; 
                };
            });

            // XP Logic
            const xp = profile.xp || 0;
            const max = profile.xpMax || 1000;
            const percent = Math.min((xp / max) * 100, 100);
            
            updateBoundElements('xp-text', `${xp} / ${max}`);
            updateBoundElements('xp-bar', null, `${percent}%`);

            // Attributes
            const attrs = profile.attributes || { int: 1, dex: 1, cha: 1 };
            updateBoundElements('attr-int', `LVL ${attrs.int}`);
            updateBoundElements('bar-int', null, `${attrs.int * 10}%`);
            updateBoundElements('attr-dex', `LVL ${attrs.dex}`);
            updateBoundElements('bar-dex', null, `${attrs.dex * 10}%`);
            updateBoundElements('attr-cha', `LVL ${attrs.cha}`);
            updateBoundElements('bar-cha', null, `${attrs.cha * 10}%`);

        } catch (error) {
            console.error('Profile Load Error:', error);
        }
    }

    // Helper: Updates elements via data-bind
    function updateBoundElements(key, textContent, widthStyle) {
        document.querySelectorAll(`[data-bind="${key}"]`).forEach(el => {
            if (textContent) el.innerText = textContent;
            if (widthStyle) el.style.width = widthStyle;
        });
    }

    // 3. Profile Saving
    async function saveProfile() {
        const btn = dom.buttons.save;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saving...';
        btn.disabled = true;

        const payload = {
            displayName: dom.inputs.displayName.value,
            jobClass: dom.inputs.jobClass.value,
            bio: dom.inputs.bio.value,
            githubUrl: dom.inputs.github.value,
            portfolioUrl: dom.inputs.portfolio.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${USER_ID}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Save failed');

            // Reflect changes immediately
            updateBoundElements('username', payload.displayName);
            updateBoundElements('job', payload.jobClass);
            
            alert('Profile updated successfully!'); 

        } catch (error) {
            alert('Error saving profile: ' + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // 4. Avatar Upload
    async function uploadAvatar(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${USER_ID}/avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${TOKEN}` },
                body: formData
            });

            if (response.ok) {
                const res = await response.json();
                // Force cache bypass with timestamp
                const newSrc = `${API_BASE_URL}${res.avatarUrl}?t=${new Date().getTime()}`;
                document.querySelectorAll('[data-bind="avatar"]').forEach(img => img.src = newSrc);
            } else {
                alert("Upload failed.");
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    }

    // 5. Project/Quest Log
    async function loadProjects() {
        const grid = dom.containers.projectsGrid;
        
        try {
            // Note: Matches API route
            const response = await fetch(`${API_BASE_URL}/api/projects`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });

            if (!response.ok) throw new Error('Failed to load quests');
            
            const projects = await response.json();
            
            grid.innerHTML = ''; 

            if (!Array.isArray(projects) || projects.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-8 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl">
                        <p class="text-gray-500 mb-2">Quest log empty.</p>
                        <p class="text-xs text-primary font-bold">Accept a quest to begin.</p>
                    </div>`;
                return;
            }

            projects.forEach(p => {
                const statusColors = {
                    'pending': 'bg-yellow-400 text-black border-yellow-500',
                    'completed': 'bg-cyber-cyan text-black border-cyan-500',
                    'active': 'bg-neon-lime text-black border-lime-500'
                };
                // Safety check for status
                const sLower = (p.status || 'active').toLowerCase();
                const badgeClass = statusColors[sLower] || statusColors['active'];

                const card = `
                    <div class="bg-white dark:bg-zinc-900 border-2 border-ink dark:border-zinc-700 rounded-xl p-5 hover:border-primary transition-all shadow-sm group">
                        <div class="flex justify-between items-start mb-3">
                            <span class="${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border">
                                ${p.status || 'Active'}
                            </span>
                            <span class="text-[10px] font-mono text-gray-400">${new Date(p.submittedAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <h3 class="font-display font-bold text-lg leading-tight mb-2 truncate group-hover:text-primary transition-colors">${p.title}</h3>
                        <p class="text-xs text-gray-500 line-clamp-2 mb-3 h-8">${p.description}</p>
                        <div class="text-xs font-bold text-gray-400 uppercase border-t border-gray-100 dark:border-zinc-800 pt-2 flex items-center gap-2">
                            <i class="fas fa-tag text-[10px]"></i> ${p.category || 'General'}
                        </div>
                    </div>
                `;
                grid.insertAdjacentHTML('beforeend', card);
            });

        } catch (error) {
            grid.innerHTML = `<div class="col-span-full text-red-500 text-sm text-center font-mono">System Error: Could not retrieve quests.</div>`;
        }
    }

    // 6. Navigation / Events
    function setupEventListeners() {
        const tabButtons = document.querySelectorAll('[data-tab]');
        const tabPanes = document.querySelectorAll('.tab-pane');

        // Tabs
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                
                // Update Buttons
                tabButtons.forEach(b => {
                    if (b.dataset.tab === target) b.classList.add('active');
                    else b.classList.remove('active');
                });

                // Update Pane
                tabPanes.forEach(pane => pane.classList.add('hidden'));
                const activePane = document.getElementById(`${target}-pane`);
                if(activePane) activePane.classList.remove('hidden');

                // Update Label
                if(dom.containers.folderLabel) {
                    dom.containers.folderLabel.innerText = target === 'overview' ? 'overview.sys' : 'quest_log.exe';
                }

                if (target === 'projects') loadProjects();
            });
        });

        // Inputs
        if(dom.buttons.save) dom.buttons.save.addEventListener('click', saveProfile);
        if(dom.buttons.avatarTrigger) dom.buttons.avatarTrigger.addEventListener('click', () => dom.inputs.avatar.click());
        if(dom.inputs.avatar) dom.inputs.avatar.addEventListener('change', uploadAvatar);

        // Logout logic
        const handleLogoutClick = (e) => {
            e.preventDefault();
            handleLogout(true);
        };

        if(dom.buttons.logoutDesktop) dom.buttons.logoutDesktop.addEventListener('click', handleLogoutClick);
        if(dom.buttons.logoutMobile) dom.buttons.logoutMobile.addEventListener('click', handleLogoutClick);
    }

    function handleLogout(confirmAction = true) {
        if (!confirmAction || confirm('Disconnect from server?')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            window.location.href = '/src/screens/main/index.html';
        }
    }
});