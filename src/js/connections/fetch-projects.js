document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://backendkostudy.onrender.com'; // Your Backend URL
    const grid = document.getElementById('projects-grid');
    const totalCountEl = document.getElementById('total-count');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let allProjects = [];

    // 1. Fetch Data
    async function fetchProjects() {
        // --- AUTH CHECK ---
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.warn("No access token found. Redirecting to login.");
            window.location.href = '/src/screens/auth/signin.html';
            return;
        }

        try {
            // Show Loading Spinner
            if(grid) {
                grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-circle-notch fa-spin text-4xl text-primary"></i><p class="mt-4 font-mono text-sm">Accessing Mainframe...</p></div>';
            }

            // --- FETCH WITH HEADERS ---
            const response = await fetch(`${API_BASE_URL}/api/projects`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <--- THIS IS THE KEY FIX
                }
            });

            // Handle Session Expiry (401 Unauthorized)
            if (response.status === 401) {
                alert("Your session has expired. Please log in again.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/src/screens/auth/signin.html';
                return;
            }

            if (!response.ok) throw new Error('Failed to connect to backend');
            
            allProjects = await response.json();
            
            // Update UI Counters
            if(totalCountEl) totalCountEl.textContent = `Total Records: ${allProjects.length}`;
            
            // Render
            if(grid) renderProjects(allProjects);

        } catch (error) {
            console.error('Fetch error:', error);
            if(grid) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12 border-2 border-red-500 border-dashed rounded bg-red-50 dark:bg-red-900/20">
                        <i class="fas fa-wifi text-red-500 text-2xl mb-2"></i>
                        <p class="font-mono text-red-500">Connection Failed. Is Flask running?</p>
                    </div>`;
            }
        }
    }

    // 2. Render Cards
    function renderProjects(projects) {
        grid.innerHTML = '';

        if (projects.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 opacity-50"><p class="font-mono">No active quests found in your log.</p></div>';
        } else {
            projects.forEach(project => {
                grid.insertAdjacentHTML('beforeend', createCardHTML(project));
            });
        }
        
        // Add the "New Quest" button at the end
        addStartProjectCard();
    }

    function addStartProjectCard() {
        const html = `
            <a href="/src/screens/projects/start-project.html" class="group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-6 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer min-h-[250px] animate-fade-in">
                <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i class="fas fa-plus text-2xl text-gray-400 group-hover:text-primary"></i>
                </div>
                <h3 class="font-display font-bold text-xl text-gray-500 dark:text-gray-400 group-hover:text-primary">New Quest</h3>
            </a>
        `;
        grid.insertAdjacentHTML('beforeend', html);
    }

    // 3. Create HTML for a single card
    function createCardHTML(data) {
        const statusLower = (data.status || 'active').toLowerCase();
        
        // Determine Styles based on Status
        let config = { color: 'bg-neon-lime text-ink', icon: 'fa-bolt', border: 'border-ink' };

        if (statusLower.includes('review') || statusLower.includes('pending')) {
            config = { color: 'bg-yellow-400 text-ink', icon: 'fa-hourglass-half', border: 'border-yellow-600' };
        } 
        else if (statusLower.includes('completed')) {
            config = { color: 'bg-cyber-cyan text-ink', icon: 'fa-check-circle', border: 'border-cyan-600' };
        }

        const dateStr = data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : 'Active';

        return `
            <div class="group relative bg-white dark:bg-gray-900 border-2 border-ink dark:border-paper rounded-lg p-6 shadow-manga dark:shadow-manga-white hover:-translate-y-1 hover:shadow-none transition-all flex flex-col justify-between h-full min-h-[280px]">
                <div>
                    <div class="flex justify-between items-start mb-4">
                        <div class="${config.color} text-[10px] font-bold px-2 py-1 border-2 border-ink rounded font-mono uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <i class="fas ${config.icon} mr-1"></i> ${data.status}
                        </div>
                        <i class="fas fa-code text-xl text-gray-300"></i>
                    </div>
                    <h3 class="font-display font-black text-2xl mb-2 leading-tight uppercase">${data.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-mono line-clamp-3 mb-4">
                        ${data.description}
                    </p>
                </div>
                
                <div class="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center mt-auto">
                    <span class="text-xs font-mono text-gray-400">${dateStr}</span>
                    <span class="text-xs font-bold text-primary uppercase">${data.category || 'Project'}</span>
                </div>
            </div>
        `;
    }

    // 4. Filtering
    if(filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // UI Update
                filterBtns.forEach(b => {
                    b.classList.remove('bg-ink', 'dark:bg-paper', 'text-white', 'dark:text-ink', 'shadow-manga-sm');
                    b.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-500');
                });
                btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-500');
                btn.classList.add('bg-ink', 'dark:bg-paper', 'text-white', 'dark:text-ink', 'shadow-manga-sm');

                // Logic
                const filter = btn.dataset.filter;
                if (filter === 'all') {
                    renderProjects(allProjects);
                } else {
                    const filtered = allProjects.filter(p => {
                        const s = (p.status || '').toLowerCase();
                        if (filter === 'active') return s.includes('active') || s.includes('pending') || s.includes('review');
                        if (filter === 'completed') return s.includes('completed');
                        return true;
                    });
                    renderProjects(filtered);
                }
            });
        });
    }

    // Only run fetch if we are on the page with the grid
    if(grid) {
        fetchProjects();
    }
});