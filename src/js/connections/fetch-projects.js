document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // Match this to the same IP used in project-inquiry.js
    const API_BASE_URL = 'http://127.0.0.1:5000'; 

    const grid = document.getElementById('projects-grid');
    const totalCountEl = document.getElementById('total-count');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let allProjects = [];

    // 1. Fetch Data
    async function fetchProjects() {
        try {
            grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-circle-notch fa-spin text-4xl text-primary"></i><p class="mt-4 font-mono text-sm">Accessing Database...</p></div>';

            // Fetch from the unified endpoint
            const response = await fetch(`${API_BASE_URL}/api/projects`);
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            allProjects = await response.json();
            
            if(totalCountEl) totalCountEl.textContent = `Total Records: ${allProjects.length}`;
            
            renderProjects(allProjects);

        } catch (error) {
            console.error('Fetch error:', error);
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 border-2 border-red-500 border-dashed rounded bg-red-50 dark:bg-red-900/20">
                    <i class="fas fa-wifi text-red-500 text-2xl mb-2"></i>
                    <p class="font-mono text-red-500">Connection Lost. Check Backend.</p>
                </div>`;
        }
    }

    // 2. Render Cards
    function renderProjects(projects) {
        grid.innerHTML = '';

        if (projects.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 opacity-50"><p class="font-mono">No active quests found.</p></div>';
        } else {
            projects.forEach(project => {
                grid.insertAdjacentHTML('beforeend', createCardHTML(project));
            });
        }

        // Append "Add New" Card at the end
        grid.insertAdjacentHTML('beforeend', `
            <a href="/src/screens/projects/start-project.html" class="group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-6 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer min-h-[250px] animate-fade-in">
                <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i class="fas fa-plus text-2xl text-gray-400 group-hover:text-primary"></i>
                </div>
                <h3 class="font-display font-bold text-xl text-gray-500 dark:text-gray-400 group-hover:text-primary">Start New Project</h3>
            </a>
        `);
    }

    // 3. Create HTML for a single card
    function createCardHTML(data) {
        const statusLower = (data.status || 'active').toLowerCase();
        
        // Default Style (Green/Active)
        let style = { color: 'bg-neon-lime text-ink', icon: 'fa-bolt', border: 'border-ink' };

        // Pending/Review Style (Yellow)
        if (statusLower.includes('review') || statusLower.includes('pending')) {
            style = { color: 'bg-yellow-400 text-ink', icon: 'fa-hourglass-half', border: 'border-ink' };
        } 
        // Completed Style (Cyan)
        else if (statusLower.includes('completed')) {
            style = { color: 'bg-cyber-cyan text-ink', icon: 'fa-check-circle', border: 'border-ink' };
        }

        const dateStr = data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : 'Unknown Date';

        return `
            <div class="group relative bg-white dark:bg-gray-900 border-2 border-ink dark:border-paper rounded p-6 shadow-manga dark:shadow-manga-white hover:-translate-y-1 hover:shadow-none transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div class="${config.color} text-[10px] font-bold px-2 py-1 border ${config.border} rounded font-mono uppercase">
                        <i class="fas ${config.icon} mr-1"></i> ${data.status}
                    </div>
                    <i class="fas fa-folder-open text-2xl text-gray-400 group-hover:text-primary transition-colors"></i>
                </div>
                <h3 class="font-display font-bold text-2xl mb-2 truncate">${data.title || 'Untitled Project'}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-mono mb-6 line-clamp-3 h-[60px]">
                    ${data.description || 'No details provided.'}
                </p>
                <div class="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                    <span class="text-xs font-mono text-gray-400">${dateStr}</span>
                    <button class="text-ink dark:text-white font-bold text-xs uppercase hover:text-primary">Details <i class="fas fa-arrow-right ml-1"></i></button>
                </div>
            </div>
        `;
    }

    // 4. Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset styles
            filterBtns.forEach(b => {
                b.classList.remove('bg-ink', 'dark:bg-paper', 'text-white', 'dark:text-ink', 'border-ink', 'dark:border-paper', 'shadow-manga-sm');
                b.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-500');
            });
            // Active style
            btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-500');
            btn.classList.add('bg-ink', 'dark:bg-paper', 'text-white', 'dark:text-ink', 'border-ink', 'dark:border-paper', 'shadow-manga-sm');

            const filter = btn.dataset.filter;
            if (filter === 'all') {
                renderProjects(allProjects);
            } else {
                const filtered = allProjects.filter(p => {
                    const s = (p.status || '').toLowerCase();
                    if (filter === 'active') return s.includes('active') || s.includes('review');
                    if (filter === 'completed') return s.includes('completed');
                    return true;
                });
                renderProjects(filtered);
            }
        });
    });

    fetchProjects();
});