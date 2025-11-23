document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projects-grid');
    const totalCountEl = document.getElementById('total-count');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let allProjects = [];

    // 1. Fetch Data
    async function fetchProjects() {
        try {
            // Show loading state
            grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-circle-notch fa-spin text-4xl text-primary"></i><p class="mt-4 font-mono">Loading Directory...</p></div>';

            const response = await fetch('http://127.0.0.1:5000/api/public/projects');
            if (!response.ok) throw new Error('Failed to fetch');
            
            allProjects = await response.json();
            
            // Update Header Count
            if(totalCountEl) totalCountEl.textContent = `Total Projects: ${allProjects.length}`;

            renderProjects(allProjects);

        } catch (error) {
            console.error(error);
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 border-2 border-red-500 border-dashed rounded bg-red-50 dark:bg-red-900/20">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
                    <p class="mt-4 font-mono text-red-500">System Error: Could not retrieve project logs.</p>
                </div>`;
        }
    }

    // 2. Render Cards
    function renderProjects(projects) {
        grid.innerHTML = '';

        if (projects.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 opacity-50">
                    <p class="font-mono">No active quests found in database.</p>
                </div>`;
            return;
        }

        projects.forEach(project => {
            const card = createCardHTML(project);
            grid.insertAdjacentHTML('beforeend', card);
        });

        // Always append the "Add New" card at the end
        const addCardHTML = `
            <a href="/src/screens/projects/start-project.html" class="group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-6 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer min-h-[250px]">
                <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i class="fas fa-plus text-2xl text-gray-400 group-hover:text-primary"></i>
                </div>
                <h3 class="font-display font-bold text-xl text-gray-500 dark:text-gray-400 group-hover:text-primary">Start New Project</h3>
                <p class="text-xs font-mono text-gray-400 mt-2">Initiate a new quest protocol</p>
            </a>
        `;
        grid.insertAdjacentHTML('beforeend', addCardHTML);
    }

    // 3. Generate HTML based on Status
    function createCardHTML(data) {
        // Determine Styling based on Status
        let statusConfig = {
            color: 'bg-gray-200 text-gray-700',
            icon: 'fa-circle',
            border: 'border-gray-300'
        };

        const statusLower = (data.status || 'active').toLowerCase();

        if (statusLower.includes('review') || statusLower.includes('pending')) {
            statusConfig = { color: 'bg-yellow-400 text-ink', icon: 'fa-clock', border: 'border-ink' };
        } else if (statusLower.includes('active')) {
            statusConfig = { color: 'bg-neon-lime text-ink', icon: 'fa-bolt', border: 'border-ink' };
        } else if (statusLower.includes('completed')) {
            statusConfig = { color: 'bg-cyber-cyan text-ink', icon: 'fa-check', border: 'border-ink' };
        }

        // Progress Bar (Only show for Active projects)
        let progressHTML = '';
        if (statusLower.includes('active')) {
            // Random progress for demo purposes since backend might not have it yet
            const progress = data.progress || Math.floor(Math.random() * 80) + 10; 
            progressHTML = `
                <div class="mb-6">
                    <div class="flex justify-between text-[10px] font-mono font-bold mb-1">
                        <span>PROGRESS</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden border border-ink dark:border-paper">
                        <div class="bg-pop-pink h-full" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="group relative bg-white dark:bg-gray-900 border-2 border-ink dark:border-paper rounded p-6 shadow-manga dark:shadow-manga-white hover:-translate-y-1 hover:shadow-none transition-all animate-fade-in">
                <div class="flex justify-between items-start mb-4">
                    <div class="${statusConfig.color} text-[10px] font-bold px-2 py-1 border ${statusConfig.border} rounded font-mono uppercase">
                        <i class="fas ${statusConfig.icon} mr-1"></i> ${data.status}
                    </div>
                    <i class="fas fa-folder-open text-2xl text-gray-400 group-hover:text-primary transition-colors"></i>
                </div>
                
                <h3 class="font-display font-bold text-2xl mb-2 truncate">${data.title || 'Untitled Project'}</h3>
                
                <p class="text-sm text-gray-600 dark:text-gray-400 font-mono mb-6 line-clamp-2 min-h-[40px]">
                    ${data.description || 'No details provided.'}
                </p>
                
                ${progressHTML}

                <div class="border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                    <span class="text-xs font-mono text-gray-400">
                        ${data.type === 'inquiry' ? 'Requested' : 'Updated'}: ${new Date(data.submittedAt || Date.now()).toLocaleDateString()}
                    </span>
                    <button class="text-ink dark:text-white font-bold text-xs uppercase hover:text-primary transition-colors">
                        Details <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // 4. Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Button Styles
            filterBtns.forEach(b => {
                b.classList.remove('bg-ink', 'dark:bg-paper', 'text-white', 'dark:text-ink', 'border-ink');
                b.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-500', 'border-gray-300');
            });
            btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-500', 'border-gray-300');
            btn.classList.add('bg-ink', 'dark:bg-paper', 'text-white', 'dark:text-ink', 'border-ink');

            // Filter Data
            const filter = btn.dataset.filter; // 'all', 'active', 'completed'
            
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

    // Initialize
    fetchProjects();
});