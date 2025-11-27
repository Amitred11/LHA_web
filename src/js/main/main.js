// Helper to decode JWT (Put this at the top of main.js)
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        return Date.now() > expiry;
    } catch (e) {
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com';
    
    // 1. CHECK TOKEN VALIDITY ON LOAD
    const token = localStorage.getItem('accessToken');
    if (token && isTokenExpired(token)) {
        console.log("Session expired. Logging out.");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
    }

    // Now set the state based on the cleaned storage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // --- DOM Elements Cache ---
    const elements = {
        logoutButtons: document.querySelectorAll('.logout-button'),
        authRequiredLinks: document.querySelectorAll('.requires-auth'),
        authVisibilityElements: document.querySelectorAll('[data-auth]'),
        profileMenuButton: document.getElementById('profile-menu-button'),
        profileMenuDropdown: document.getElementById('profile-menu-dropdown'),
        mobileMenuButton: document.getElementById('mobile-menu-button'),
        mobileMenu: document.getElementById('mobile-menu'),
        navbar: document.getElementById('navbar'),
        // Select all sections that are navigation targets
        sections: document.querySelectorAll('header[id], section[id]'),
        // Select desktop nav links
        navLinks: document.querySelectorAll('.nav-link'), 
        mobileNavLinks: document.querySelectorAll('#mobile-menu a'),
        body: document.body,
        heroCtaButton: document.getElementById('hero-cta-button'),
        themeToggle: document.getElementById('theme-toggle'),
        backToTopBtn: document.getElementById('back-to-top'),
        contactForm: document.querySelector('form[action="contact-form"]')
    };

    // --- 1. Theme Logic ---
    const initTheme = () => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', () => {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    localStorage.theme = 'light';
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.theme = 'dark';
                }
            });
        }
    };

    // --- 2. Modal Logic (Alerts) ---
    const loadAlertModal = async () => {
        if (document.getElementById('alert-modal')) return;

        try {
            const response = await fetch('/src/components/alert.html');
            if (response.ok) {
                const html = await response.text();
                const placeholder = document.getElementById('alert-modal-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = html;
                } else {
                    document.body.insertAdjacentHTML('beforeend', html);
                }
            }
        } catch (error) {
            console.error("Could not load the alert modal component:", error);
        }
    };

    const showAlertModal = (options) => {
        if (typeof openAlertModal === 'function') {
            openAlertModal(options); 
        } else {
            if (confirm(`${options.title}\n${options.message}`)) {
                if(options.onConfirm) options.onConfirm();
            }
        }
    };

    // --- 3. UI Interactions ---
    const updateUIForLoginState = () => {
        elements.authVisibilityElements.forEach(el => {
            const authState = el.getAttribute('data-auth');
            el.style.display = isLoggedIn 
                ? (authState === 'logged-in' ? '' : 'none') 
                : (authState === 'logged-out' ? '' : 'none');
        });

        if (elements.heroCtaButton) {
            const prefix = isLoggedIn ? 'logged-in' : 'logged-out';
            elements.heroCtaButton.innerHTML = elements.heroCtaButton.getAttribute(`data-${prefix}-text`) + ' <i class="fas fa-arrow-right ml-2"></i>';
            elements.heroCtaButton.href = elements.heroCtaButton.getAttribute(`data-${prefix}-href`);
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        showAlertModal({
            title: 'Logging Out?',
            message: 'Are you sure you want to disconnect from the mainframe?',
            iconHTML: '<i class="fas fa-sign-out-alt text-3xl text-hot-pink"></i>',
            confirmText: 'Log Out',
            onConfirm: () => {
                Loader.shutdown(() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userId'); 
                    localStorage.removeItem('username');
                    window.location.assign('/index.html');
                });
            }
        });
    };

    const toggleMobileMenu = () => {
        const isHidden = elements.mobileMenu.classList.contains('hidden');
        if (isHidden) {
            elements.mobileMenu.classList.remove('hidden');
            elements.body.classList.add('overflow-hidden');
            elements.mobileMenuButton.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            elements.mobileMenu.classList.add('hidden');
            elements.body.classList.remove('overflow-hidden');
            elements.mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    };

    const updateNavbarProfile = async () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('accessToken');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        // 1. Safety Check
        if (!isLoggedIn || !userId || !token) return;

        // 2. DOM Elements
        const navAvatar = document.getElementById('navbar-avatar');
        const navName = document.getElementById('navbar-username');
        const navLevel = document.getElementById('navbar-level');
        
        const mobileAvatar = document.getElementById('mobile-menu-avatar');
        const mobileName = document.getElementById('mobile-menu-username');
        const mobileLevel = document.getElementById('mobile-menu-level');

        try {
            // 3. API Call
            const response = await fetch(`${API_BASE_URL}/api/account/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // 4. Data Extraction
                const profile = data.profile || {};
                const accountUsername = data.username || "User";
                
                // Logic: Use Display Name if available, otherwise User ID/Username
                const displayName = profile.displayName || accountUsername;
                const level = profile.level || 1;
                
                // Logic: Construct Avatar URL
                let avatarSrc = `https://ui-avatars.com/api/?name=${displayName}&background=random`;
                if (profile.avatarUrl) {
                    const cleanPath = profile.avatarUrl.startsWith('/') ? profile.avatarUrl : `/${profile.avatarUrl}`;
                    // We add a timestamp (?t=...) to force the browser to reload the image if it just changed
                    avatarSrc = `${API_BASE_URL}${cleanPath}?t=${Date.now()}`;
                }

                // 5. Update Desktop Navbar
                if (navAvatar) navAvatar.src = avatarSrc;
                if (navName) navName.innerText = displayName;
                if (navLevel) navLevel.innerText = `LVL. ${level}`;

                // 6. Update Mobile Menu
                if (mobileAvatar) mobileAvatar.src = avatarSrc;
                if (mobileName) mobileName.innerText = displayName;
                if (mobileLevel) mobileLevel.innerText = `LVL. ${level}`;
            }
        } catch (error) {
            console.error("Failed to load navbar profile stats", error);
        }
    };

    // --- 4. Scroll Logic ---
    
    // A. Visual Logic (Back to top / Navbar bg)
    const handleScroll = () => {
        if (elements.backToTopBtn) {
            if (window.scrollY > 300) elements.backToTopBtn.classList.remove('hidden');
            else elements.backToTopBtn.classList.add('hidden');
        }

        if (elements.navbar) {
            if (window.scrollY > 50) elements.navbar.classList.add('py-2');
            else elements.navbar.classList.remove('py-2');
        }
    };

    // B. ScrollSpy / Indicator Logic (Intersection Observer)
    const initScrollSpy = () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5 // Trigger when 50% of section is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.getAttribute('id');

                    elements.navLinks.forEach(link => {
                        // The underline is the last span inside the anchor tag based on your HTML
                        const underline = link.querySelector('span:last-child');
                        if (!underline) return; 

                        if (link.getAttribute('href') === `#${activeId}`) {
                            // Active: Show underline
                            underline.classList.remove('w-0');
                            underline.classList.add('w-full');
                            link.classList.add('text-primary'); // Optional: keep text color active
                        } else {
                            // Inactive: Hide underline
                            underline.classList.add('w-0');
                            underline.classList.remove('w-full');
                            link.classList.remove('text-primary');
                        }
                    });
                }
            });
        }, observerOptions);

        elements.sections.forEach(section => {
            observer.observe(section);
        });
    };

    // C. Reveal on Scroll Animation
    const setupRevealObserver = () => {
        const revealElements = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(element => observer.observe(element));
    };

    // --- 5. Contact Form Logic ---
    const initContactForm = () => {
        if (!elements.contactForm) return;

        elements.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-satellite-dish fa-spin"></i> Sending...';

            const formData = new FormData(elements.contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const apiUrl = 'https://backendkostudy.onrender.com/api/contact'; 
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showAlertModal({
                        title: 'Transmission Successful',
                        message: 'Your message has been logged in the mainframe.',
                        iconHTML: '<i class="fas fa-check-circle text-3xl text-green-500"></i>',
                        confirmText: 'Awesome',
                        onConfirm: () => {}
                    });
                    elements.contactForm.reset();
                } else {
                    throw new Error(result.message || 'Server rejected message.');
                }
            } catch (error) {
                console.error(error);
                showAlertModal({
                    title: 'Transmission Failed',
                    message: 'Could not reach the server. Check your connection.',
                    iconHTML: '<i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>',
                    confirmText: 'Retry',
                    onConfirm: () => {}
                });
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    };

    // --- 6. Dynamic Event Widget Logic ---
    const loadUpcomingEvent = async () => {
        const widgetContainer = document.getElementById('upcoming-event-widget');
        if (!widgetContainer) return;

        try {
            // 1. Attempt to fetch from your backend
            // Replace '/api/events/latest' with your actual endpoint
            const response = await fetch(`${API_BASE_URL}/api/events/latest`);
            
            let eventData = null;
            if (response.ok) {
                const data = await response.json();
                // Assume backend returns { event: { ... } } or just { ... }
                eventData = data.event || data; 
            }

            // 2. Define HTML Templates
            
            // A. HTML for when an event EXISTS
            if (eventData && eventData.title) {
                const dateObj = new Date(eventData.date); // Ensure backend sends a date string
                const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                const day = dateObj.getDate();

                widgetContainer.innerHTML = `
                    <div class="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                    
                    <div class="bg-white dark:bg-zinc-800 border-2 border-ink dark:border-zinc-600 p-5 -rotate-3 group-hover:rotate-0 transition-transform shadow-manga-sm dark:shadow-lg rounded-lg z-10">
                        <div class="text-center font-mono font-bold leading-none">
                            <span class="text-pop-pink text-sm block mb-1">${month}</span>
                            <span class="text-4xl">${day}</span>
                        </div>
                    </div>
                    <div class="flex-1 text-center md:text-left z-10">
                        <div class="inline-block bg-pop-pink text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2">UPCOMING RAID</div>
                        <h4 class="font-display font-bold text-2xl uppercase mb-1">${eventData.title}</h4>
                        <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">${eventData.description || 'Join the party.'}</p>
                    </div>
                    <a href="/src/screens/events/summit.html?id=${eventData._id}" class="protected-route bg-ink dark:bg-white text-white dark:text-ink px-8 py-3 rounded-lg font-bold uppercase text-xs hover:scale-105 transition-transform shadow-lg z-10 w-full md:w-auto text-center">
                        RSVP Now
                    </a>
                `;
            } else {
                // B. HTML for NO EVENTS (Fallback)
                throw new Error("No active events found");
            }

        } catch (error) {
            // Fallback Design: "No Events Yet" -> Link to History/Summit
            console.log("Rendering default event state:", error);

            widgetContainer.innerHTML = `
                <div class="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                
                <div class="bg-gray-200 dark:bg-zinc-800 border-2 border-gray-400 dark:border-zinc-600 p-5 rotate-3 group-hover:rotate-0 transition-transform rounded-lg z-10 grayscale opacity-70">
                    <div class="text-center font-mono font-bold leading-none">
                        <span class="text-gray-500 dark:text-gray-400 text-sm block mb-1">ERR</span>
                        <span class="text-4xl text-gray-400">404</span>
                    </div>
                </div>
                <div class="flex-1 text-center md:text-left z-10">
                    <div class="inline-block bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase">System Idle</div>
                    <h4 class="font-display font-bold text-2xl uppercase mb-1 text-gray-500 dark:text-gray-400">No Active Raids</h4>
                    <p class="text-gray-500 dark:text-gray-500 text-sm">The servers are quiet. Check the archives for past mission reports.</p>
                </div>
                <a href="/src/screens/events/summit.html" class="protected-route bg-transparent border-2 border-ink dark:border-white text-ink dark:text-white px-8 py-3 rounded-lg font-bold uppercase text-xs hover:bg-ink hover:text-white dark:hover:bg-white dark:hover:text-ink transition-colors z-10 w-full md:w-auto text-center">
                    View History
                </a>
            `;
        }
    };

    // --- 7. Protected Route Logic (New) ---
    const handleProtectedRoutes = () => {
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            
            if (!link || !link.classList.contains('protected-route')) return;

            const currentlyLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (!currentlyLoggedIn) {
                e.preventDefault();
                
                showAlertModal({
                    title: 'Access Denied',
                    message: 'This area is for Guild Members only. Please sign in to proceed.',
                    iconHTML: '<i class="fas fa-lock text-3xl text-pop-pink"></i>',
                    confirmText: 'Sign In',
                    onConfirm: () => {
                        window.location.href = '/src/screens/auth/signin.html';
                    }
                });
            }
        });
    };


    // --- Initialization ---
    const init = async () => {
        initTheme();
        await loadAlertModal();
        
        // Event Listeners
        if(elements.profileMenuButton) {
            elements.profileMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.profileMenuDropdown?.classList.toggle('hidden');
                elements.profileMenuDropdown?.classList.toggle('flex');
            });
        }

        if(elements.mobileMenuButton) {
            elements.mobileMenuButton.addEventListener('click', toggleMobileMenu);
        }

        elements.logoutButtons.forEach(btn => btn.addEventListener('click', handleLogout));
        
        elements.mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!elements.mobileMenu.classList.contains('hidden')) toggleMobileMenu();
            });
        });

        if(elements.backToTopBtn) {
            elements.backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        document.addEventListener('click', (event) => {
            if (elements.profileMenuDropdown && 
                !elements.profileMenuDropdown.classList.contains('hidden') && 
                !elements.profileMenuButton.contains(event.target)) {
                elements.profileMenuDropdown.classList.add('hidden');
                elements.profileMenuDropdown.classList.remove('flex');
            }
        });

        window.addEventListener('scroll', handleScroll);
        handleProtectedRoutes();
        updateUIForLoginState();
        handleScroll(); 
        setupRevealObserver();
        initScrollSpy();
        initContactForm();
        loadUpcomingEvent(); 
        updateNavbarProfile(); 
    };

    init();
});