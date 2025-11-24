document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com'; // Flask Backend

    // --- DOM Elements ---
    const grid = document.getElementById('video-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const filterTabs = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // Modal Elements
    const modal = document.getElementById('video-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeModal = document.getElementById('close-modal');

    // State
    let allArchives = [];
    let currentCategory = 'all';

    // --- 1. UI FUNCTIONS ---

    // Theme Logic
    function initTheme() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    themeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    });

    // Mobile Menu
    const menuBtn = document.getElementById('mobile-menu-button');
    const closeMenuBtn = document.getElementById('close-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    function toggleMenu() {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => mobileMenu.classList.add('flex'), 10);
            document.body.classList.add('overflow-hidden');
        } else {
            mobileMenu.classList.remove('flex');
            setTimeout(() => mobileMenu.classList.add('hidden'), 300);
            document.body.classList.remove('overflow-hidden');
        }
    }

    if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if(closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', toggleMenu));

    // --- 2. DATA FUNCTIONS ---

    // Fetch Data
    const fetchArchives = async () => {
        grid.innerHTML = '';
        loadingState.classList.remove('hidden');
        emptyState.classList.add('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/api/archives`);
            if (!response.ok) throw new Error('Network error');

            allArchives = await response.json();
            renderVideos(allArchives);
        } catch (error) {
            console.error('Error fetching archives:', error);
            grid.innerHTML = `
                <div class="col-span-full text-center p-8 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-mono rounded">
                    <i class="fas fa-wifi mb-2 text-3xl"></i><br>
                    <span class="font-bold">CONNECTION FAILED</span><br>
                    Unable to retrieve Dev Archives.
                </div>`;
        } finally {
            loadingState.classList.add('hidden');
        }
    };

    // Render Videos
    const renderVideos = (videos) => {
        grid.innerHTML = '';

        if (videos.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = "group bg-white dark:bg-gray-900 border-2 border-ink dark:border-paper shadow-manga dark:shadow-manga-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col cursor-pointer";
            
            // Attach Click Event for Modal
            card.onclick = () => openVideoModal(video);

            // Tags
            const tagsHtml = (video.tags || []).map(tag => 
                `<span class="text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">${tag}</span>`
            ).join('');

            // Badge Color Logic
            let badgeColor = 'bg-gray-800';
            if (video.category === 'seminar') badgeColor = 'bg-pop-pink';
            if (video.category === 'tutorial') badgeColor = 'bg-primary';

            // Thumbnail Fallback
            const thumb = video.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop';

            card.innerHTML = `
                <div class="relative w-full h-48 overflow-hidden bg-black group">
                    <img src="${thumb}" class="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500">
                    
                    <!-- Play Button Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div class="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-2 border-white play-btn">
                            <i class="fas fa-play text-white pl-1"></i>
                        </div>
                    </div>
                    
                    <!-- Badges -->
                    <span class="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-mono px-1.5 py-0.5 rounded border border-gray-700">${video.duration || '00:00'}</span>
                    <span class="absolute top-2 left-2 ${badgeColor} text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">${video.category || 'video'}</span>
                </div>

                <div class="p-5 flex flex-col flex-1">
                    <h3 class="font-display font-bold text-xl leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">${video.title}</h3>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${tagsHtml}
                    </div>
                    
                    <div class="mt-auto flex items-center justify-between border-t-2 border-gray-100 dark:border-gray-800 pt-3">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-cyan-400"></div>
                            <span class="text-xs font-mono font-bold text-gray-500 truncate max-w-[100px]">${video.author || 'LHA Admin'}</span>
                        </div>
                        <span class="text-xs font-bold text-primary uppercase group-hover:translate-x-1 transition-transform">Watch <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    // Filter Logic
    const handleFilter = () => {
        const query = searchInput.value.toLowerCase();
        
        const filtered = allArchives.filter(video => {
            const videoCategory = (video.category || '').toLowerCase();
            const matchesCategory = currentCategory === 'all' || videoCategory === currentCategory;
            
            const matchesSearch = (video.title || '').toLowerCase().includes(query) || 
                                  (video.tags || []).some(tag => tag.toLowerCase().includes(query));
            
            return matchesCategory && matchesSearch;
        });

        renderVideos(filtered);
    };

    filterTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update
            filterTabs.forEach(b => {
                b.classList.remove('bg-ink', 'text-white', 'dark:bg-paper', 'dark:text-ink', 'active');
                b.classList.add('hover:bg-ink', 'hover:text-white', 'dark:hover:bg-paper', 'dark:hover:text-ink');
            });
            btn.classList.add('bg-ink', 'text-white', 'dark:bg-paper', 'dark:text-ink', 'active');
            btn.classList.remove('hover:bg-ink', 'hover:text-white');

            currentCategory = btn.dataset.category;
            handleFilter();
        });
    });

    searchInput.addEventListener('keyup', handleFilter);

    // Modal Logic
    function openVideoModal(video) {
        if(modalTitle) modalTitle.innerText = video.title;
        if(modalDesc) modalDesc.innerText = video.description || 'No description available.';
        
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }

    if(closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        });
    }
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });

    // Init
    initTheme();
    fetchArchives();
});