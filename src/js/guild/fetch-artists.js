document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com';
    
    // --- DOM Elements ---
    const grid = document.getElementById('artist-grid');
    const loader = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    
    // Search & Filter Elements
    const desktopSearchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const filterSelect = document.getElementById('filter-select');
    const searchBtn = document.getElementById('search-btn');
    const mobileFilterPills = document.querySelectorAll('.filter-pill');
    
    // Theme Elements
    const themeToggleDesktop = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');

    // --- STATE ---
    let allMembers = [];
    let searchTimeout = null;

    // --- 1. THEME LOGIC ---
    function initTheme() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    function toggleTheme() {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            html.classList.add('dark');
            localStorage.theme = 'dark';
        }
    }

    if (themeToggleDesktop) themeToggleDesktop.addEventListener('click', toggleTheme);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

    // --- 2. DATA FETCHING ---
    const fetchArtists = async () => {
        if (!grid) return;
        
        grid.innerHTML = '';
        if (loader) loader.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/api/guild-members`);
            if (!response.ok) throw new Error('Network error');
            
            allMembers = await response.json();
            
            // Initial Render
            renderCards(allMembers);
        } catch (error) {
            console.error('Error fetching artists:', error);
            if (grid) {
                grid.innerHTML = `
                    <div class="col-span-full text-center p-8 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-mono rounded">
                        <i class="fas fa-exclamation-triangle mb-2 text-3xl"></i><br>
                        <span class="font-bold">SYSTEM ERROR</span><br>
                        Unable to retrieve artist roster.
                    </div>`;
            }
        } finally {
            if (loader) loader.classList.add('hidden');
        }
    };

    // --- 3. RENDER LOGIC ---
    const renderCards = (members) => {
        if (!grid) return;
        grid.innerHTML = '';

        if (members.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        if (emptyState) emptyState.classList.add('hidden');

        members.forEach(member => {
            // Data Fallbacks
            const project = member.featuredProject || {};
            const projectImg = project.image || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop';
            const title = member.title || 'Artist';
            
            // Generate Tags (Max 3)
            let tagsHtml = '';
            if (project.tags && Array.isArray(project.tags)) {
                tagsHtml = project.tags.slice(0, 3).map(tag => 
                    `<span class="text-[10px] uppercase font-bold border border-ink dark:border-white/20 px-2 py-1 rounded bg-white dark:bg-zinc-800 text-ink dark:text-gray-300">${tag}</span>`
                ).join('');
            }

            // Create Card Element
            const card = document.createElement('div');
            // Updated classes to match the Pink/Art theme
            card.className = "group relative bg-white dark:bg-zinc-900 border-2 border-ink dark:border-zinc-700 shadow-manga dark:shadow-none hover:shadow-neon transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden flex flex-col h-full";
            
            card.innerHTML = `
                <!-- Image Section -->
                <div class="relative w-full h-56 overflow-hidden border-b-2 border-ink dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800">
                    <img src="${projectImg}" alt="${member.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    
                    <!-- Floating Badge -->
                    <div class="absolute top-3 right-3 bg-pop-pink text-white border-2 border-ink dark:border-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider shadow-sm rotate-2 group-hover:rotate-0 transition-transform">
                        ${title}
                    </div>
                </div>

                <!-- Content Section -->
                <div class="p-5 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-display font-bold text-xl leading-tight uppercase text-ink dark:text-white group-hover:text-pop-pink transition-colors truncate pr-2">
                            ${member.name}
                        </h3>
                        ${member.portfolioUrl ? `
                            <a href="${member.portfolioUrl}" target="_blank" class="text-gray-400 hover:text-pop-pink transition-colors">
                                <i class="fas fa-external-link-alt text-sm"></i>
                            </a>
                        ` : ''}
                    </div>
                    
                    <p class="text-xs text-gray-600 dark:text-gray-400 font-mono mb-4 line-clamp-2 leading-relaxed">
                        ${member.description || 'Digital artisan crafting visual experiences.'}
                    </p>

                    <div class="flex flex-wrap gap-2 mb-6 mt-auto">
                        ${tagsHtml || '<span class="text-[10px] text-gray-400 font-mono italic">No tags</span>'}
                    </div>

                    <!-- Action Buttons -->
                    <div class="grid grid-cols-2 gap-3 mt-auto">
                        ${project.liveDemoUrl ? 
                            `<a href="${project.liveDemoUrl}" target="_blank" class="text-center text-[10px] font-bold uppercase py-2.5 border-2 border-ink dark:border-zinc-600 hover:border-pop-pink hover:text-pop-pink transition-colors rounded-lg flex items-center justify-center gap-2">
                                <i class="fas fa-eye"></i> View
                            </a>` : 
                            `<button disabled class="opacity-50 cursor-not-allowed text-center text-[10px] font-bold uppercase py-2.5 border-2 border-gray-200 dark:border-zinc-800 text-gray-400 rounded-lg">
                                WIP
                            </button>`
                        }
                        
                        <button class="text-center text-[10px] font-bold uppercase py-2.5 bg-ink dark:bg-white text-white dark:text-ink rounded-lg shadow-lg hover:bg-pop-pink hover:text-white dark:hover:bg-pop-pink dark:hover:text-white transition-all flex items-center justify-center gap-2">
                            Profile <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    // --- 4. SEARCH & FILTER LOGIC ---
    const handleSearch = () => {
        const query = desktopSearchInput ? desktopSearchInput.value.toLowerCase() : '';
        const specFilter = filterSelect ? filterSelect.value : 'all';

        const filtered = allMembers.filter(member => {
            const matchesName = member.name.toLowerCase().includes(query);
            const matchesDesc = (member.description || '').toLowerCase().includes(query);
            const matchesTitle = (member.title || '').toLowerCase().includes(query);
            
            // Filter by Dropdown (Title must contain string, or 'all')
            const memberTitle = member.title || '';
            const matchesSpec = specFilter === 'all' || memberTitle.includes(specFilter);

            return (matchesName || matchesDesc || matchesTitle) && matchesSpec;
        });

        renderCards(filtered);
    };

    // Desktop Listeners
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (desktopSearchInput) {
        desktopSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
    if (filterSelect) filterSelect.addEventListener('change', handleSearch);

    // --- 5. MOBILE SYNCHRONIZATION ---
    
    // Sync Mobile Input -> Desktop Input
    if (mobileSearchInput && desktopSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            desktopSearchInput.value = e.target.value;
            
            // Debounce search for smoother mobile experience
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch();
            }, 500);
        });
    }

    // Sync Mobile Filter Pills -> Desktop Select
    if (mobileFilterPills.length > 0 && filterSelect) {
        mobileFilterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                // 1. Update Mobile UI (Active State)
                mobileFilterPills.forEach(p => {
                    p.classList.remove('bg-ink', 'text-white', 'border-ink');
                    p.classList.add('bg-white', 'dark:bg-zinc-800', 'text-gray-500', 'border-gray-300');
                });
                pill.classList.remove('bg-white', 'dark:bg-zinc-800', 'text-gray-500', 'border-gray-300');
                pill.classList.add('bg-ink', 'text-white', 'border-ink');

                // 2. Update Desktop Logic
                const value = pill.dataset.value;
                filterSelect.value = value;
                
                // 3. Trigger Search
                handleSearch();
            });
        });
    }

    // --- INITIALIZATION ---
    initTheme();
    fetchArtists();
});