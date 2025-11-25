document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIG & DOM ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com'; // Update if needed
    
    const feedContainer = document.getElementById('clips-feed');
    const loadingClips = document.getElementById('loading-clips');
    const emptyClips = document.getElementById('empty-clips');
    
    const rosterContainer = document.getElementById('roster-list');
    const loadingStreamers = document.getElementById('loading-streamers');
    
    // Modal Elements
    const playerModal = document.getElementById('video-player-modal');
    const closePlayerBtn = document.getElementById('close-player-btn');
    const modalThumb = document.getElementById('modal-video-thumb');
    const modalTitle = document.getElementById('modal-video-title');
    const modalAuthor = document.getElementById('modal-video-author');
    const modalLikeBtn = document.getElementById('modal-like-btn');
    const modalPlayBtn = document.getElementById('modal-play-btn');

    // Alert Helper
    let alertModalElements = {};

    // --- DATA FUNCTIONS ---

    const fetchData = async () => {
        // Reset States
        feedContainer.innerHTML = '';
        rosterContainer.innerHTML = '';
        loadingClips.classList.remove('hidden');
        loadingStreamers.classList.remove('hidden');
        emptyClips.classList.add('hidden');

        try {
            // Fetch in Parallel
            const [clipsRes, streamersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/gamers/clips`),
                fetch(`${API_BASE_URL}/api/gamers/streamers`)
            ]);

            const clipsData = await clipsRes.json();
            const streamersData = await streamersRes.json();

            renderFeed(clipsData);
            renderSidebar(streamersData);

        } catch (error) {
            console.error("Data Fetch Error:", error);
            feedContainer.innerHTML = `
                <div class="text-center p-8 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
                    <p class="font-bold text-red-500">Signal Lost. Check Connection.</p>
                </div>
            `;
            rosterContainer.innerHTML = `<div class="p-4 text-center text-gray-500 text-xs font-mono">Offline</div>`;
        } finally {
            loadingClips.classList.add('hidden');
            loadingStreamers.classList.add('hidden');
        }
    };

    // --- RENDER FUNCTIONS ---

    const renderFeed = (clips) => {
        if (!clips || clips.length === 0) {
            emptyClips.classList.remove('hidden');
            return;
        }

        clips.forEach(clip => {
            const thumbnail = clip.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';
            const avatar = clip.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${clip.author}`;

            const card = document.createElement('div');
            card.className = "bg-white dark:bg-gray-900 border-2 border-ink dark:border-paper shadow-sm group hover:shadow-manga dark:hover:shadow-manga-white transition-all duration-300";
            
            card.innerHTML = `
                <div class="relative h-56 md:h-80 bg-black overflow-hidden cursor-pointer thumb-trigger">
                    <img src="${thumbnail}" class="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-2xl border-2 border-white group-hover:scale-110 transition-transform shadow-lg"><i class="fas fa-play ml-1"></i></div>
                    </div>
                    <div class="absolute top-4 left-4"><span class="bg-ink text-white text-xs font-bold uppercase px-2 py-1 shadow-md">${clip.game || 'Game'}</span></div>
                </div>
                <div class="p-5 flex gap-4">
                    <img src="${avatar}" class="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 p-0.5 bg-white">
                    <div class="flex-1 min-w-0">
                        <h3 class="font-display font-bold text-xl md:text-2xl leading-tight mb-1 group-hover:text-primary transition-colors truncate pr-4">${clip.title}</h3>
                        <div class="flex justify-between items-center text-xs font-mono text-gray-500 mt-2">
                            <span>Uploaded by <span class="text-ink dark:text-white font-bold hover:underline cursor-pointer">${clip.author}</span></span>
                            <span class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded"><i class="fas fa-eye text-gray-400"></i> ${clip.views || '0'}</span>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-100 dark:border-gray-700 px-5 py-3 flex justify-between items-center">
                    <div class="flex gap-6 text-gray-400 text-lg">
                        <button class="hover:text-pop-pink hover:scale-110 transition-all like-trigger"><i class="far fa-heart"></i></button>
                        <button class="hover:text-cyber-cyan hover:scale-110 transition-all promo-trigger"><i class="far fa-comment-alt"></i></button>
                        <button class="hover:text-primary hover:scale-110 transition-all promo-trigger"><i class="fas fa-share"></i></button>
                    </div>
                    <span class="text-[10px] font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1"><i class="fas fa-lock text-xs"></i> App Only</span>
                </div>
            `;

            // Events
            card.querySelector('.thumb-trigger').onclick = () => openPlayer(clip);
            card.querySelectorAll('.promo-trigger').forEach(btn => btn.onclick = window.triggerAppPromo);
            
            // Local Like Logic
            const likeBtn = card.querySelector('.like-trigger');
            likeBtn.onclick = function() {
                const icon = this.querySelector('i');
                if(icon.classList.contains('far')) {
                    icon.classList.replace('far', 'fas');
                    this.classList.add('text-pop-pink');
                } else {
                    icon.classList.replace('fas', 'far');
                    this.classList.remove('text-pop-pink');
                }
            };

            feedContainer.appendChild(card);
        });
    };

    const renderSidebar = (streamers) => {
        if (!streamers || streamers.length === 0) {
            rosterContainer.innerHTML = '<div class="p-4 text-center text-sm font-mono text-gray-500">No active streamers</div>';
            return;
        }

        streamers.forEach(streamer => {
            const avatar = streamer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamer.name}`;
            const html = `
                <div class="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group border-l-4 border-transparent hover:border-cyber-cyan">
                    <div class="font-display font-black text-xl text-gray-300 w-6 text-center italic">#${streamer.rank || '-'}</div>
                    <div class="relative">
                        <img src="${avatar}" class="w-10 h-10 rounded border border-gray-300 bg-white">
                        <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-0.5">
                            <h4 class="font-bold text-sm truncate text-ink dark:text-gray-200 group-hover:text-cyber-cyan transition-colors">${streamer.name}</h4>
                        </div>
                        <div class="text-xs font-mono text-gray-500 truncate flex items-center gap-1.5">
                            <span class="text-red-500 font-bold">${streamer.viewers || '0'}</span> watching
                        </div>
                    </div>
                    <button class="promo-trigger text-xs bg-ink dark:bg-paper text-white dark:text-ink px-3 py-1.5 font-bold rounded opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 shadow-sm">
                        Watch
                    </button>
                </div>`;
            rosterContainer.insertAdjacentHTML('beforeend', html);
        });
        
        rosterContainer.querySelectorAll('.promo-trigger').forEach(btn => btn.onclick = window.triggerAppPromo);
        rosterContainer.querySelectorAll('.group').forEach(row => row.onclick = window.triggerAppPromo);
    };

    // --- VIDEO PLAYER LOGIC ---

    const openPlayer = (clip) => {
        modalThumb.src = clip.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';
        modalTitle.textContent = clip.title;
        modalAuthor.textContent = clip.author;
        
        // Reset Like button state
        modalLikeBtn.className = "bg-pop-pink hover:bg-pink-600 text-white px-6 py-2 rounded font-bold uppercase text-xs shadow-lg transition-transform active:scale-95";
        modalLikeBtn.innerHTML = '<i class="fas fa-thumbs-up mr-1"></i> Like';
        
        // Hide Play button initially
        modalPlayBtn.style.display = 'flex';
        
        playerModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    };

    const closePlayer = () => {
        playerModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    closePlayerBtn.onclick = closePlayer;
    playerModal.onclick = (e) => { if(e.target === playerModal) closePlayer(); };

    // Simulate Playing
    modalPlayBtn.onclick = function() {
        this.style.display = 'none'; // Hide play button to simulate playing
    };

    // Modal Like
    modalLikeBtn.onclick = function() {
        if (this.classList.contains('bg-pop-pink')) {
            this.classList.replace('bg-pop-pink', 'bg-green-500');
            this.classList.replace('hover:bg-pink-600', 'hover:bg-green-600');
            this.innerHTML = '<i class="fas fa-check mr-1"></i> Liked';
        }
    };


    // --- APP PROMO MODAL LOGIC (Reused) ---
    
    const cacheModalElements = () => {
        alertModalElements = {
            modal: document.getElementById('alert-modal'),
            title: document.getElementById('alert-title'),
            message: document.getElementById('alert-message'),
            iconContainer: document.getElementById('alert-icon-container'),
            confirmButton: document.getElementById('alert-confirm-button'),
            cancelButton: document.getElementById('alert-cancel-button'),
        };
    };

    const loadAlertModal = async () => {
        if (document.getElementById('alert-modal')) {
            cacheModalElements();
            return;
        }
        try {
            const response = await fetch('/src/components/alert.html');
            if (response.ok) {
                const html = await response.text();
                document.getElementById('alert-modal-placeholder').innerHTML = html;
                cacheModalElements();
            }
        } catch (error) { console.error(error); }
    };

    window.triggerAppPromo = async () => {
        if (!document.getElementById('alert-modal')) await loadAlertModal();
        cacheModalElements();

        if (typeof openAlertModal === 'function') {
            openAlertModal({
                title: 'RESTRICTED AREA',
                message: 'This feature is exclusive to the LHA Mobile App. Squad up and chat there.',
                iconHTML: '<i class="fas fa-mobile-alt text-4xl text-pop-pink mb-2 animate-bounce"></i>',
                confirmText: 'Get App',
                cancelText: 'Later',
                onConfirm: () => { fetch('/src/screens/main/qr.html')
  .then(r => console.log("FOUND:", r.ok));  }
            });
        }
    };

    // --- UI HELPERS ---
    const initTheme = () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark'); localStorage.theme = 'light';
                } else {
                    document.documentElement.classList.add('dark'); localStorage.theme = 'dark';
                }
            });
        }
    };

    const initMobileMenu = () => {
        const menuBtn = document.getElementById('mobile-menu-button');
        const closeBtn = document.getElementById('close-menu-button');
        const menu = document.getElementById('mobile-menu');
        const toggleMenu = () => {
            const isHidden = menu.classList.contains('hidden');
            if(isHidden) { menu.classList.remove('hidden'); setTimeout(() => menu.classList.add('flex'), 10); document.body.classList.add('overflow-hidden'); }
            else { menu.classList.remove('flex'); setTimeout(() => menu.classList.add('hidden'), 300); document.body.classList.remove('overflow-hidden'); }
        };
        if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
        if(closeBtn) closeBtn.addEventListener('click', toggleMenu);
        document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', toggleMenu));
    };

    // --- START ---
    initTheme();
    initMobileMenu();
    loadAlertModal().then(fetchData);
});