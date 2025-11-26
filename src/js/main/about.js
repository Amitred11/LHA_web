       // --- 1. Theme Logic ---
        function initTheme() {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
        function toggleTheme() {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            } else {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            }
        }
        document.getElementById('theme-toggle-desktop').addEventListener('click', toggleTheme);
        document.getElementById('theme-toggle-mobile').addEventListener('click', toggleTheme);
        initTheme();

        // --- 2. Dynamic Scroll Indicator Logic ---
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('crew-scroll-container');
            const indicator = document.getElementById('scroll-indicator');
            const cards = container.querySelectorAll('.crew-card, .snap-center'); // Catch profiles + placeholder

            // Generate Dots
            cards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot', 'w-1.5', 'h-1.5', 'rounded-full', 'bg-gray-300', 'dark:bg-zinc-700');
                if (index === 0) dot.classList.add('active', 'bg-primary');
                indicator.appendChild(dot);
            });

            // Update on Scroll
            container.addEventListener('scroll', () => {
                const scrollLeft = container.scrollLeft;
                const cardWidth = cards[0].offsetWidth + 24; // Width + Gap (approx)
                
                // Calculate which card is mostly visible
                const activeIndex = Math.round(scrollLeft / cardWidth);

                const dots = indicator.querySelectorAll('.dot');
                dots.forEach((dot, index) => {
                    if (index === activeIndex) {
                        dot.classList.add('active', 'bg-primary');
                        dot.classList.remove('bg-gray-300', 'dark:bg-zinc-700');
                    } else {
                        dot.classList.remove('active', 'bg-primary');
                        dot.classList.add('bg-gray-300', 'dark:bg-zinc-700');
                    }
                });
            });
        });
