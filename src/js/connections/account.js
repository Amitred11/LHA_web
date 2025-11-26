document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
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
        links: {
            github: document.getElementById('link-github'),
            portfolio: document.getElementById('link-portfolio')
        },
        containers: {
            projectsGrid: document.getElementById('projects-grid'),
            folderLabel: document.getElementById('folder-label'),
            tabPanes: document.querySelectorAll('.tab-pane'),
            navBtns: document.querySelectorAll('.nav-btn, .mobile-nav-btn'),
            bioContent: document.getElementById('bio-content'),
            bioEmpty: document.getElementById('bio-empty')
        },
        buttons: {
            saveProfile: document.getElementById('save-profile-btn'),
            avatarTrigger: document.getElementById('avatar-trigger'),
            logoutTop: document.getElementById('logout-btn-top'),
            themeToggle: document.getElementById('theme-toggle'),
            filters: document.querySelectorAll('.filter-btn')
        }
    };

    // --- INITIALIZATION ---
    if (!USER_ID || !TOKEN) {
        window.location.href = '/src/screens/auth/signin.html';
        return;
    }
    
    initTheme();
    loadProfile();
    setupEventListeners();

    // --- FUNCTIONS: THEME ---
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

    // --- FUNCTIONS: NAVIGATION ---
    function switchTab(targetId) {
        dom.containers.navBtns.forEach(btn => {
            if (btn.dataset.tab === targetId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        dom.containers.tabPanes.forEach(pane => {
            pane.classList.toggle('hidden', pane.id !== `${targetId}-pane`);
            pane.classList.toggle('block', pane.id === `${targetId}-pane`);
        });
        
        const labels = { 'status': 'STATUS.EXE', 'projects': 'QUEST_LOG.BAT', 'config': 'CONFIG.SYS' };
        if(dom.containers.folderLabel) {
            dom.containers.folderLabel.innerText = labels[targetId] || 'SYSTEM';
        }

        if (targetId === 'projects') loadProjects();
    }

    // --- FUNCTIONS: PROFILE DATA ---
    async function loadProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${USER_ID}`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });
            
            if (response.status === 401) return handleLogout();
            
            const data = await response.json();
            const profile = data.profile || {};
            const user = data.username || 'User';

            // 1. Text Data
            updateText('username', profile.displayName || user);
            updateText('job', profile.jobClass || 'Novice');
            updateText('user-id', `#${USER_ID.substring(0, 4)}`.toUpperCase());
            updateText('level', `LVL. ${profile.level || 1}`);

            // 2. Bio Handling
            if (profile.bio && profile.bio.trim() !== "") {
                dom.containers.bioContent.classList.remove('hidden');
                dom.containers.bioEmpty.classList.add('hidden');
                updateText('bio', profile.bio);
            } else {
                dom.containers.bioContent.classList.add('hidden');
                dom.containers.bioEmpty.classList.remove('hidden');
            }

            // 3. Stats
            const xp = profile.xp || 0;
            const max = profile.xpMax || 1000;
            updateText('xp-text', `${xp} / ${max}`);
            document.querySelectorAll('[data-bind="xp-bar"]').forEach(el => el.style.width = `${Math.min((xp/max)*100, 100)}%`);

            const attrs = profile.attributes || { int: 1, dex: 1, cha: 1 };
            updateText('attr-int', `LVL ${attrs.int}`);
            document.querySelectorAll('[data-bind="bar-int"]').forEach(el => el.style.width = `${attrs.int * 10}%`);
            
            updateText('attr-dex', `LVL ${attrs.dex}`);
            document.querySelectorAll('[data-bind="bar-dex"]').forEach(el => el.style.width = `${attrs.dex * 10}%`);
            
            updateText('attr-cha', `LVL ${attrs.cha}`);
            document.querySelectorAll('[data-bind="bar-cha"]').forEach(el => el.style.width = `${attrs.cha * 10}%`);

            // 4. Form Inputs
            if(dom.inputs.displayName) dom.inputs.displayName.value = profile.displayName || user;
            if(dom.inputs.jobClass) dom.inputs.jobClass.value = profile.jobClass || 'Novice';
            if(dom.inputs.bio) dom.inputs.bio.value = profile.bio || '';
            if(dom.inputs.github) dom.inputs.github.value = profile.githubUrl || '';
            if(dom.inputs.portfolio) dom.inputs.portfolio.value = profile.portfolioUrl || '';

            // 5. Links
            updateLink(dom.links.github, profile.githubUrl);
            updateLink(dom.links.portfolio, profile.portfolioUrl);

            // 6. Avatar
            updateAvatarImages(profile.avatarUrl, user);

        } catch (error) { console.error('Load Error:', error); }
    }

    // --- FUNCTIONS: AVATAR UPLOAD ---
    async function uploadAvatar(file) {
        const spinner = document.getElementById('avatar-upload-spinner');
        const loadingOverlay = document.getElementById('avatar-loading');
        const statusText = document.getElementById('upload-status-text');
        
        if(spinner) spinner.classList.remove('hidden');
        if(loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.classList.add('flex');
        }
        
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            // Note: Content-Type header is omitted so browser sets boundary automatically
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${USER_ID}/avatar`, {
                method: 'POST', 
                headers: { 
                    'Authorization': `Bearer ${TOKEN}` 
                }, 
                body: formData
            });

            if(response.ok) {
                const data = await response.json();
                updateAvatarImages(data.avatarUrl || data.path, null, true);
                if(statusText) {
                    statusText.innerText = "Upload Complete";
                    statusText.className = "text-[10px] font-mono text-green-500 mt-1 block";
                }
            } else {
                throw new Error("Server rejected image");
            }
        } catch (err) {
            console.error("Upload error", err);
            if(statusText) {
                statusText.innerText = "Upload Failed";
                statusText.className = "text-[10px] font-mono text-red-500 mt-1 block";
            }
            alert("Failed to upload. Try a smaller image (max 2MB).");
        } finally {
            if(spinner) spinner.classList.add('hidden');
            if(loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                loadingOverlay.classList.remove('flex');
            }
            if(statusText) setTimeout(() => statusText.classList.add('hidden'), 3000);
        }
    }

    function updateAvatarImages(url, fallbackName, forceRefresh = false) {
        let src = `https://ui-avatars.com/api/?name=${fallbackName || 'User'}&background=random&size=128`;
        
        if (url) {
            const cleanPath = url.startsWith('/') ? url : `/${url}`;
            const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
            src = `${API_BASE_URL}${cleanPath}${timestamp}`;
        }

        document.querySelectorAll('[data-bind="avatar"]').forEach(img => {
            img.src = src;
        });
    }

    // --- FUNCTIONS: PROJECTS ---
    async function loadProjects() {
        const grid = dom.containers.projectsGrid;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/projects`, { 
                headers: { 'Authorization': `Bearer ${TOKEN}` } 
            });
            const projects = await response.json();
            
            grid.innerHTML = ''; // Clear loading
            window.currentProjects = projects;

            if (!projects || projects.length === 0) {
                const tmpl = document.getElementById('projects-empty-template');
                if(tmpl) grid.appendChild(tmpl.content.cloneNode(true));
                const addBtn = document.getElementById('add-quest-container');
                if(addBtn) addBtn.classList.add('hidden');
            } else {
                renderProjects(projects);
                const addBtn = document.getElementById('add-quest-container');
                if(addBtn) addBtn.classList.remove('hidden');
            }

        } catch (e) { 
            grid.innerHTML = `<div class="col-span-full text-center text-red-500 font-mono text-xs">Connection Error.</div>`;
        }
    }

    function renderProjects(projects) {
        const grid = dom.containers.projectsGrid;
        grid.innerHTML = '';
        
        projects.forEach(p => {
            const status = (p.status || 'active').toLowerCase();
            const colorClass = status === 'completed' ? 'text-cyber-cyan border-cyber-cyan' : 'text-neon-lime border-neon-lime';
            
            grid.insertAdjacentHTML('beforeend', `
                <div class="bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 hover:border-primary transition-all group relative overflow-hidden">
                    <div class="flex justify-between items-start mb-2 relative z-10">
                        <span class="font-display font-bold text-sm truncate pr-4 dark:text-gray-200">${p.title}</span>
                        <span class="text-[9px] font-mono uppercase border px-1.5 rounded ${colorClass}">${status}</span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">${p.description}</p>
                </div>
            `);
        });
    }

    // --- HELPERS ---
    function updateText(key, val) {
        document.querySelectorAll(`[data-bind="${key}"]`).forEach(el => el.innerText = val);
    }
    
    function updateLink(el, url) {
        if(!el) return;
        if(url) {
            el.href = `https://${url.replace(/^https?:\/\//, '')}`;
            el.classList.remove('opacity-50', 'pointer-events-none');
        } else {
            el.href = '#';
            el.classList.add('opacity-50', 'pointer-events-none');
        }
    }
    
    function handleLogout() {
        if (confirm('Disconnect from system?')) {
            localStorage.clear();
            window.location.href = '/src/screens/main/index.html';
        }
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // Tab Navigation
        dom.containers.navBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
        
        // Avatar Upload
        if(dom.buttons.avatarTrigger) {
            dom.buttons.avatarTrigger.addEventListener('click', () => dom.inputs.avatar.click());
        }
        if(dom.inputs.avatar) {
            dom.inputs.avatar.addEventListener('change', (e) => {
                if(e.target.files[0]) uploadAvatar(e.target.files[0]);
            });
        }

        // Logout
        if(dom.buttons.logoutTop) {
            dom.buttons.logoutTop.addEventListener('click', handleLogout);
        }

        // Save Profile
        if(dom.buttons.saveProfile) {
            dom.buttons.saveProfile.addEventListener('click', async function() {
                const btn = this;
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving';
                
                const payload = {
                    displayName: dom.inputs.displayName.value,
                    jobClass: dom.inputs.jobClass.value,
                    bio: dom.inputs.bio.value,
                    githubUrl: dom.inputs.github.value,
                    portfolioUrl: dom.inputs.portfolio.value
                };

                try {
                    const res = await fetch(`${API_BASE_URL}/api/account/profile/${USER_ID}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
                        body: JSON.stringify(payload)
                    });
                    
                    if(res.ok) {
                        loadProfile();
                        btn.innerHTML = '<i class="fas fa-check"></i> Saved';
                        setTimeout(() => btn.innerHTML = originalText, 2000);
                    } else {
                        throw new Error('Save failed');
                    }
                } catch(e) {
                    btn.innerHTML = '<i class="fas fa-times"></i> Error';
                    setTimeout(() => btn.innerHTML = originalText, 2000);
                }
            });
        }

        // Project Filters
        dom.buttons.filters.forEach(btn => {
            btn.addEventListener('click', () => {
                dom.buttons.filters.forEach(b => {
                    b.classList.remove('bg-ink', 'text-white');
                    b.classList.add('bg-gray-100', 'text-gray-500', 'dark:bg-zinc-800');
                });
                btn.classList.remove('bg-gray-100', 'text-gray-500', 'dark:bg-zinc-800');
                btn.classList.add('bg-ink', 'text-white');
                
                const filter = btn.dataset.filter;
                if(window.currentProjects) {
                    if(filter === 'all') renderProjects(window.currentProjects);
                    else renderProjects(window.currentProjects.filter(p => (p.status||'').toLowerCase() === filter));
                }
            });
        });
    }
});