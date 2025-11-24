document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com'; // Flask Backend URL
    
    // --- DOM Elements ---
    const grid = document.getElementById('artist-grid');
    const loader = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const searchBtn = document.getElementById('search-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // --- STATE ---
    let allMembers = [];

    // --- 1. UI FUNCTIONS (Theme & Menu) ---
    
    // Theme Logic
    function initTheme() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    themeToggle.addEventListener('click', function() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    });

    // Mobile Menu Logic
    const menuBtn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('close-menu-button');
    const menu = document.getElementById('mobile-menu');
    const body = document.body;

    function toggleMenu() {
        const isHidden = menu.classList.contains('hidden');
        if(isHidden) {
            menu.classList.remove('hidden');
            setTimeout(() => menu.classList.add('flex'), 10);
            body.classList.add('overflow-hidden');
        } else {
            menu.classList.remove('flex');
            setTimeout(() => menu.classList.add('hidden'), 300);
            body.classList.remove('overflow-hidden');
        }
    }

    if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if(closeBtn) closeBtn.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', toggleMenu));

    // --- 2. DATA FUNCTIONS ---

    // Fetch Authors
    const fetchArtists = async () => {
        grid.innerHTML = '';
        loader.classList.remove('hidden');
        emptyState.classList.add('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/api/guild-members`);
            if (!response.ok) throw new Error('Network error');
            
            allMembers = await response.json();
            
            // We can optionally filter purely for "Artists" here if needed, 
            // but for now, we render everyone and let the dropdown filter.
            renderCards(allMembers);
        } catch (error) {
            console.error('Error fetching artists:', error);
            grid.innerHTML = `
                <div class="col-span-full text-center p-8 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-mono rounded">
                    <i class="fas fa-wifi mb-2 text-3xl"></i><br>
                    <span class="font-bold">CONNECTION FAILED</span><br>
                    Unable to retrieve guild data. Is the backend running?
                </div>`;
        } finally {
            loader.classList.add('hidden');
        }
    };

    // Render Cards
    const renderCards = (members) => {
        grid.innerHTML = '';

        if (members.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        members.forEach(member => {
            // Get Featured Project Data or use defaults
            const project = member.featuredProject || {};
            const projectImg = project.image || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop'; 
            
            // Generate Tags HTML
            let tagsHtml = '';
            if (project.tags && Array.isArray(project.tags)) {
                tagsHtml = project.tags.slice(0, 3).map(tag => 
                    `<span class="text-[10px] uppercase font-bold border border-ink dark:border-paper px-2 py-1 rounded-sm bg-white dark:bg-gray-800 text-ink dark:text-paper shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">${tag}</span>`
                ).join('');
            }

            // Create Card Element
            const card = document.createElement('div');
            card.className = "group relative bg-white dark:bg-gray-900 border-2 border-ink dark:border-paper shadow-manga dark:shadow-manga-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col h-full overflow-hidden";
            
            card.innerHTML = `
                <!-- Image Header -->
                <div class="relative w-full h-64 overflow-hidden border-b-2 border-ink dark:border-paper bg-gray-200 dark:bg-gray-800">
                    <img src="${projectImg}" alt="${member.name}" class="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500">
                    
                    <!-- Title Badge -->
                    <div class="absolute top-3 right-3 bg-pop-pink text-white border-2 border-ink dark:border-paper text-xs font-bold px-3 py-1 transform rotate-3 shadow-sm z-10">
                        ${member.title || 'MEMBER'}
                    </div>
                </div>

                <!-- Card Body -->
                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-display font-bold text-2xl leading-none uppercase truncate pr-2">${member.name}</h3>
                        ${member.portfolioUrl ? `<a href="${member.portfolioUrl}" target="_blank" class="text-gray-400 hover:text-pop-pink transition-colors" title="Portfolio"><i class="fas fa-globe"></i></a>` : ''}
                    </div>
                    
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-mono mb-4 line-clamp-2 min-h-[2.5rem]">
                        ${member.description || 'A mysterious creative entity yet to share their lore.'}
                    </p>

                    <div class="flex flex-wrap gap-2 mb-6 mt-auto">
                        ${tagsHtml || '<span class="text-[10px] text-gray-400 italic">No tags</span>'}
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        ${project.liveDemoUrl ? 
                            `<a href="${project.liveDemoUrl}" target="_blank" class="text-center text-xs font-bold uppercase py-2.5 border-2 border-ink dark:border-paper hover:bg-ink hover:text-white dark:hover:bg-paper dark:hover:text-ink transition-colors">
                                View Work
                            </a>` : 
                            `<button disabled class="opacity-40 cursor-not-allowed text-center text-xs font-bold uppercase py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-400">
                                No Link
                            </button>`
                        }
                        
                        <!-- Link to a future detail page, or generic profile -->
                        <button class="text-center text-xs font-bold uppercase py-2.5 bg-ink dark:bg-paper text-white dark:text-ink border-2 border-transparent hover:bg-pop-pink hover:border-ink hover:text-white transition-all">
                            Profile
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    // Filter Logic
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        const specFilter = filterSelect.value;

        const filtered = allMembers.filter(member => {
            const matchesName = member.name.toLowerCase().includes(query);
            const matchesDesc = (member.description || '').toLowerCase().includes(query);
            const matchesTitle = (member.title || '').toLowerCase().includes(query);
            
            // Filter by Dropdown (Title must contain the selected string, or 'all')
            const memberTitle = member.title || '';
            const matchesSpec = specFilter === 'all' || memberTitle.includes(specFilter);

            return (matchesName || matchesDesc || matchesTitle) && matchesSpec;
        });

        renderCards(filtered);
    };

    // Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') handleSearch();
    });
    filterSelect.addEventListener('change', handleSearch);

    // Initialization
    initTheme();
    fetchArtists();
});