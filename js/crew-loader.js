document.addEventListener('DOMContentLoaded', () => {
    const showcaseContainer = document.getElementById('crew-showcase-container')?.querySelector('.container');
    const apiEndpoint = 'http://127.0.0.1:5000/api/authors'; 

    if (!showcaseContainer) {
        console.error('Error: Container not found.');
        return;
    }

    // --- Helper: Tech Tags (Solid Badges) ---
    const createTechPills = (tags) => {
        if (!tags || tags.length === 0) return '<span class="text-gray-400 text-xs italic">No tags</span>';
        return tags.map(tag => 
            `<span class="px-2 py-1 text-xs font-bold border-2 border-ink dark:border-cream bg-white dark:bg-gray-700 text-ink dark:text-white rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#FFF]">${tag}</span>`
        ).join('');
    };

    const createProjectLinks = (liveDemoUrl, githubUrl) => {
        let linksHtml = '';
        const btnClass = "text-sm font-bold underline decoration-2 underline-offset-4 hover:text-hot-pink transition-colors";
        
        if (liveDemoUrl) {
            linksHtml += `<a href="${liveDemoUrl}" target="_blank" class="${btnClass}"><i class="fas fa-external-link-alt"></i> Live Demo</a>`;
        }
        if (githubUrl) {
            linksHtml += `<a href="${githubUrl}" target="_blank" class="${btnClass}"><i class="fab fa-github"></i> Code</a>`;
        }
        return linksHtml;
    };

    const loadCrewShowcase = async () => {
        try {
            const response = await fetch(apiEndpoint);
            // Mock data if fetch fails (Remove in production)
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const authors = await response.json();

            if (authors.length === 0) {
                showcaseContainer.innerHTML = `
                    <div class="p-8 border-3 border-ink dark:border-cream rounded-xl text-center">
                        <p class="font-header font-bold text-xl">No crew members found.</p>
                    </div>`;
                return;
            }

            const htmlContent = authors.map((author, index) => {
                const project = author.featuredProject;
                const isEven = index % 2 === 0;
                
                // 1. Author Card (Sticky/Profile Style)
                const authorSection = `
                    <div class="flex flex-col h-full justify-center">
                        <div class="bg-white dark:bg-gray-800 border-3 border-ink dark:border-cream p-6 rounded-xl shadow-hard dark:shadow-hard-white relative ${isEven ? 'rotate-1' : '-rotate-1'}">
                            <div class="absolute -top-3 -left-3 w-8 h-8 bg-electric-purple border-2 border-ink dark:border-cream rounded-full"></div>
                            
                            <h2 class="text-4xl font-header font-bold mb-1">${author.name}</h2>
                            <p class="text-hot-pink font-bold uppercase tracking-wider text-sm mb-4">${author.title}</p>
                            <p class="text-gray-600 dark:text-gray-300 text-lg mb-6 font-medium">
                                "${author.description}"
                            </p>
                            
                            <a href="project-details.html?id=${author._id}" class="inline-block w-full text-center bg-ink dark:bg-cream text-white dark:text-ink border-2 border-transparent hover:border-ink hover:bg-white hover:text-ink dark:hover:bg-gray-900 dark:hover:text-cream py-3 rounded-lg font-bold transition-all shadow-hard-sm hover:translate-y-[-2px]">
                               View Full Portfolio
                            </a>
                        </div>
                    </div>
                `;

                // 2. Featured Project Card (Window/File Style)
                let projectCard = '';
                
                if (project) {
                    projectCard = `
                        <div class="flex flex-col h-full">
                            <div class="bg-cream dark:bg-gray-900 border-3 border-ink dark:border-cream rounded-xl overflow-hidden shadow-hard dark:shadow-hard-white transition-transform hover:-translate-y-1 h-full flex flex-col">
                                <!-- Fake Browser/Window Header -->
                                <div class="bg-ink dark:bg-cream px-4 py-2 flex items-center gap-2 border-b-3 border-ink dark:border-cream">
                                    <div class="w-3 h-3 rounded-full bg-hot-pink border border-white dark:border-ink"></div>
                                    <div class="w-3 h-3 rounded-full bg-acid-green border border-white dark:border-ink"></div>
                                    <span class="ml-auto text-white dark:text-ink font-mono text-xs font-bold truncate">featured_project.exe</span>
                                </div>

                                <a href="project-details.html?id=${author._id}" class="block h-64 overflow-hidden border-b-3 border-ink dark:border-cream relative group">
                                    <img src="${project.image}" 
                                         class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                         alt="${project.title}"
                                         onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-gray-200 flex items-center justify-center font-bold text-gray-400\'>IMG NOT FOUND</div>'">
                                    <div class="absolute inset-0 bg-acid-green/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </a>

                                <div class="p-6 flex-1 flex flex-col">
                                    <h3 class="text-2xl font-header font-bold mb-2">${project.title}</h3>
                                    <div class="flex flex-wrap gap-2 mb-4">
                                        ${createTechPills(project.tags)}
                                    </div>
                                    <div class="mt-auto flex gap-4 pt-4 border-t-2 border-ink/10 dark:border-cream/20">
                                        ${createProjectLinks(project.liveDemoUrl, project.githubUrl)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    projectCard = `
                        <div class="h-full flex items-center justify-center border-3 border-dashed border-ink dark:border-cream rounded-xl bg-gray-50 dark:bg-gray-800/50 p-8">
                            <div class="text-center text-gray-400">
                                <i class="fas fa-ghost text-4xl mb-2"></i>
                                <p class="font-bold">No Featured Project</p>
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                        ${isEven ? authorSection + projectCard : projectCard + authorSection}
                    </div>
                `;
            }).join('');

            showcaseContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error(error);
            showcaseContainer.innerHTML = `
                <div class="bg-red-100 border-3 border-red-500 text-red-700 p-4 rounded-xl font-bold text-center">
                    Failed to load crew data. Is the backend running?
                </div>`;
        }
    };

    loadCrewShowcase();
});