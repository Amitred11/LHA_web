document.addEventListener('DOMContentLoaded', () => {
    // Target container
    const container = document.getElementById('crew-showcase-container'); 
    
    if (!container) return;

    const apiEndpoint = 'http://127.0.0.1:5000/api/authors';

    const loadCrew = async () => {
        try {
            // Loading State
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20">
                    <i class="fas fa-circle-notch fa-spin text-4xl text-primary mb-4"></i>
                    <p class="font-mono">Accessing Database...</p>
                </div>`;

            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error('Failed to fetch crew data');
            
            const authors = await response.json();

            if (authors.length === 0) {
                container.innerHTML = `<div class="text-center py-10 font-mono">No crew members found.</div>`;
                return;
            }

            // Build HTML
            const html = authors.map((author, index) => {
                // Determine layout direction (alternating)
                const isEven = index % 2 === 0;
                const featured = author.featuredProject;

                // Card Logic
                const authorCard = `
                    <div class="bg-white dark:bg-gray-900 border-2 border-ink dark:border-paper p-8 rounded shadow-manga dark:shadow-manga-white flex flex-col justify-center h-full relative group">
                        <div class="absolute -top-3 -left-3 bg-neon-lime text-ink font-bold px-2 py-1 text-xs border-2 border-ink shadow-sm transform -rotate-3 group-hover:rotate-0 transition-transform">
                            ${author.title || 'Member'}
                        </div>
                        <h2 class="font-display font-black text-4xl mb-2">${author.name}</h2>
                        <p class="text-gray-600 dark:text-gray-300 font-mono text-sm mb-6">"${author.description}"</p>
                        <a href="project-details.html?id=${author._id}" class="inline-block text-center bg-ink dark:bg-paper text-white dark:text-ink font-bold py-3 rounded border-2 border-transparent hover:bg-primary hover:text-white transition-colors">
                            View Portfolio
                        </a>
                    </div>
                `;

                // Project Preview Logic
                let projectCard = '';
                if (featured) {
                    const tags = featured.tags ? featured.tags.map(t => `<span class="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">${t}</span>`).join('') : '';
                    
                    projectCard = `
                        <div class="bg-gray-100 dark:bg-gray-800 border-2 border-ink dark:border-paper rounded overflow-hidden shadow-manga dark:shadow-manga-white flex flex-col h-full group">
                            <div class="h-48 overflow-hidden bg-gray-300 relative">
                                <img src="${featured.image || 'https://via.placeholder.com/400x300?text=No+Image'}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500">
                                <div class="absolute bottom-0 left-0 bg-ink text-white text-xs px-2 py-1 font-mono">FEATURED_WORK</div>
                            </div>
                            <div class="p-6 flex-1 flex flex-col">
                                <h3 class="font-display font-bold text-xl mb-1">${featured.title}</h3>
                                <div class="flex flex-wrap gap-2 mb-4">${tags}</div>
                                <div class="mt-auto flex gap-3 text-sm">
                                    ${featured.liveDemoUrl ? `<a href="${featured.liveDemoUrl}" target="_blank" class="text-primary hover:underline">Live Demo</a>` : ''}
                                    ${featured.githubUrl ? `<a href="${featured.githubUrl}" target="_blank" class="text-pop-pink hover:underline">Code</a>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    projectCard = `
                        <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded h-full flex items-center justify-center p-8">
                            <p class="text-gray-400 font-mono text-xs">No featured project equipped.</p>
                        </div>
                    `;
                }

                // Render Row
                return `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-stretch">
                        <div class="${isEven ? 'order-1' : 'order-1 lg:order-2'}">${authorCard}</div>
                        <div class="${isEven ? 'order-2' : 'order-2 lg:order-1'}">${projectCard}</div>
                    </div>
                `;
            }).join('');

            // Inject Grid
            container.innerHTML = `<div class="container mx-auto max-w-5xl">${html}</div>`;

        } catch (error) {
            console.error(error);
            container.innerHTML = `
                <div class="bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded text-center font-mono">
                    <strong>Error 500:</strong> Cannot connect to LHA Mainframe.<br>
                    <span class="text-xs">Make sure app.py is running.</span>
                </div>`;
        }
    };

    loadCrew();
});