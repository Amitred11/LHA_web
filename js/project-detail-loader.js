document.addEventListener('DOMContentLoaded', () => {
    const loadingSpinner = document.getElementById('loading-spinner');
    const contentArea = document.getElementById('content-area');
    
    // API Endpoints
    const apiAuthors = 'http://127.0.0.1:5000/api/authors'; 
    const apiProjects = 'http://127.0.0.1:5000/api/public/projects'; 

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const createProjectCard = (project) => {
        const tagsHtml = project.tags && project.tags.length 
            ? project.tags.map(tag => `<span class="text-xs font-bold bg-acid-green text-ink border-2 border-ink px-2 py-1 rounded">${tag}</span>`).join('')
            : '';

        return `
            <div class="bg-white dark:bg-gray-800 border-3 border-ink dark:border-cream rounded-xl overflow-hidden shadow-hard dark:shadow-hard-white hover:shadow-hard-hover transition-all hover:-translate-y-2 flex flex-col h-full">
                <!-- Image Section -->
                <div class="h-48 border-b-3 border-ink dark:border-cream relative group overflow-hidden bg-gray-100">
                    <img src="${project.image}" 
                         class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         alt="${project.title}"
                         onerror="this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-gray-200 font-bold text-gray-400\'>NO IMG</div>'">
                </div>
                
                <!-- Content Section -->
                <div class="p-6 flex-1 flex flex-col">
                    <h3 class="text-2xl font-header font-bold mb-2 leading-tight">${project.title}</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
                        ${project.description}
                    </p>
                    
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${tagsHtml}
                    </div>

                    <!-- Buttons -->
                    <div class="flex gap-3 mt-auto">
                        ${project.liveDemoUrl ? `
                        <a href="${project.liveDemoUrl}" target="_blank" class="flex-1 text-center bg-ink dark:bg-cream text-white dark:text-ink font-bold py-2 rounded border-2 border-transparent hover:bg-hot-pink hover:text-white hover:border-ink transition-colors text-sm">
                            Live Demo
                        </a>` : ''}
                        
                        ${project.githubUrl ? `
                        <a href="${project.githubUrl}" target="_blank" class="flex-1 text-center bg-white dark:bg-gray-700 text-ink dark:text-white font-bold py-2 rounded border-2 border-ink dark:border-cream hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm">
                            Code
                        </a>` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    const loadPortfolio = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const authorId = urlParams.get('id'); 

        if (!authorId) {
            loadingSpinner.innerHTML = '<p class="font-header font-bold text-red-500 text-xl">Error: ID Missing</p>';
            return;
        }

        try {
            // 1. Fetch Author
            const authorRes = await fetch(apiAuthors);
            const authors = await authorRes.json();
            const currentAuthor = authors.find(a => a._id === authorId);

            if (!currentAuthor) throw new Error("Crew member not found.");

            // 2. Populate Header
            document.title = `${currentAuthor.name} | Portfolio`;
            document.getElementById('author-name').textContent = currentAuthor.name;
            document.getElementById('author-role').textContent = currentAuthor.title;
            document.getElementById('author-bio').textContent = currentAuthor.description;
            document.getElementById('author-avatar').textContent = getInitials(currentAuthor.name);

            if (currentAuthor.portfolioUrl) {
                const linkDiv = document.getElementById('author-external-link');
                linkDiv.querySelector('a').href = currentAuthor.portfolioUrl;
                linkDiv.classList.remove('hidden');
            }

            // 3. Fetch Projects
            const projectsRes = await fetch(`${apiProjects}?authorId=${authorId}`);
            if (!projectsRes.ok) throw new Error("Failed to fetch projects");
            
            const projects = await projectsRes.json();
            const projectsGrid = document.getElementById('projects-grid');

            if (projects.length === 0) {
                projectsGrid.innerHTML = `
                    <div class="col-span-full py-16 text-center border-3 border-dashed border-ink dark:border-cream rounded-xl opacity-50">
                        <i class="fas fa-box-open text-6xl mb-4"></i>
                        <p class="font-header font-bold text-2xl">Nothing here yet.</p>
                    </div>
                `;
            } else {
                projectsGrid.innerHTML = projects.map(p => createProjectCard(p)).join('');
            }

            // 4. Show Content
            loadingSpinner.classList.add('hidden');
            contentArea.classList.remove('hidden');

        } catch (error) {
            console.error(error);
            loadingSpinner.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-bug text-4xl text-red-500 mb-2"></i>
                    <p class="font-bold text-xl">Error: ${error.message}</p>
                </div>
            `;
        }
    };

    loadPortfolio();
});