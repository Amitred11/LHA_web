document.addEventListener('DOMContentLoaded', () => {
    const loadingSpinner = document.getElementById('loading-spinner');
    const contentArea = document.getElementById('content-area');
    const projectsGrid = document.getElementById('projects-grid');
    
    // API Endpoints
    const apiAuthors = 'http://127.0.0.1:5000/api/authors'; 
    const apiProjects = 'http://127.0.0.1:5000/api/public/projects'; 

    // Helper: Get Initials for Avatar
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    };

    // Helper: Create Project HTML Card
    const createProjectCard = (project) => {
        const tagsHtml = project.tags && project.tags.length 
            ? project.tags.map(tag => `<span class="text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-ink dark:text-white px-2 py-1 rounded">${tag}</span>`).join('')
            : '';

        // Handle missing images
        const imageSrc = project.image || 'https://placehold.co/600x400/1a1a1a/FFF?text=No+Image';

        return `
            <div class="bg-white dark:bg-gray-900 border-2 border-ink dark:border-paper rounded-xl overflow-hidden shadow-manga dark:shadow-manga-white hover:translate-y-[-4px] transition-all flex flex-col h-full group">
                <!-- Image Section -->
                <div class="h-48 border-b-2 border-ink dark:border-paper relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src="${imageSrc}" 
                         class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         alt="${project.title}"
                         onerror="this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center text-gray-400 font-mono text-xs\'>[NO_IMAGE_DATA]</div>'">
                </div>
                
                <!-- Content Section -->
                <div class="p-6 flex-1 flex flex-col">
                    <h3 class="text-2xl font-display font-bold mb-2 leading-tight">${project.title}</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 font-mono line-clamp-3 flex-1">
                        ${project.description}
                    </p>
                    
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${tagsHtml}
                    </div>

                    <!-- Buttons -->
                    <div class="flex gap-3 mt-auto">
                        ${project.liveDemoUrl ? `
                        <a href="${project.liveDemoUrl}" target="_blank" class="flex-1 text-center bg-primary text-white font-bold py-2 rounded border-2 border-transparent hover:bg-primary/90 shadow-sm transition-colors text-xs uppercase">
                            <i class="fas fa-bolt mr-1"></i> Live Demo
                        </a>` : ''}
                        
                        ${project.githubUrl ? `
                        <a href="${project.githubUrl}" target="_blank" class="flex-1 text-center bg-white dark:bg-black text-ink dark:text-white font-bold py-2 rounded border-2 border-ink dark:border-paper hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs uppercase">
                            <i class="fab fa-github mr-1"></i> Code
                        </a>` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    const loadPortfolio = async () => {
        // 1. Get ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const authorId = urlParams.get('id'); 

        if (!authorId) {
            loadingSpinner.innerHTML = `
                <div class="text-center">
                    <p class="font-mono font-bold text-pop-pink text-xl mb-4">ERROR 404: ID MISSING</p>
                    <a href="/src/screens/main/index.html" class="underline hover:text-primary">Return to Base</a>
                </div>`;
            return;
        }

        try {
            // 2. Fetch Author Details (Using list endpoint and filtering client-side)
            const authorRes = await fetch(apiAuthors);
            if (!authorRes.ok) throw new Error("Could not connect to crew database.");
            
            const authors = await authorRes.json();
            const currentAuthor = authors.find(a => a._id === authorId);

            if (!currentAuthor) throw new Error("Crew member not found in registry.");

            // 3. Populate Profile Header
            document.title = `${currentAuthor.name} | LHA Portfolio`;
            document.getElementById('author-name').textContent = currentAuthor.name;
            document.getElementById('author-role').textContent = currentAuthor.title || 'Member';
            document.getElementById('author-bio').textContent = currentAuthor.description || 'No bio data available.';
            document.getElementById('author-avatar').textContent = getInitials(currentAuthor.name);

            if (currentAuthor.portfolioUrl) {
                const linkDiv = document.getElementById('author-external-link');
                linkDiv.querySelector('a').href = currentAuthor.portfolioUrl;
                linkDiv.classList.remove('hidden');
            }

            // 4. Fetch Projects for this Author
            const projectsRes = await fetch(`${apiProjects}?authorId=${authorId}`);
            if (!projectsRes.ok) throw new Error("Failed to fetch project inventory.");
            
            const projects = await projectsRes.json();

            // 5. Render Projects
            if (projects.length === 0) {
                projectsGrid.innerHTML = `
                    <div class="col-span-full py-16 text-center border-2 border-dashed border-ink dark:border-paper rounded-xl opacity-50">
                        <i class="fas fa-box-open text-6xl mb-4 text-gray-300"></i>
                        <p class="font-display font-bold text-2xl uppercase">Inventory Empty</p>
                        <p class="font-mono text-xs">No projects have been assigned to this user yet.</p>
                    </div>
                `;
            } else {
                projectsGrid.innerHTML = projects.map(p => createProjectCard(p)).join('');
            }

            // 6. Reveal Content
            loadingSpinner.classList.add('hidden');
            contentArea.classList.remove('hidden');

        } catch (error) {
            console.error(error);
            loadingSpinner.innerHTML = `
                <div class="text-center border-2 border-pop-pink p-8 rounded bg-pop-pink/10">
                    <i class="fas fa-exclamation-triangle text-4xl text-pop-pink mb-2"></i>
                    <p class="font-bold text-xl mb-2">System Error</p>
                    <p class="font-mono text-sm">${error.message}</p>
                    <a href="/src/screens/main/index.html" class="inline-block mt-4 underline text-sm">Go Back</a>
                </div>
            `;
        }
    };

    loadPortfolio();
});