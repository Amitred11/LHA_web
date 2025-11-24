document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
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
        sections: document.querySelectorAll('main section[id], header[id], section[id]'),
        navLinks: document.querySelectorAll('.nav-link'),
        mobileNavLinks: document.querySelectorAll('#mobile-menu a'),
        body: document.body,
        heroCtaButton: document.getElementById('hero-cta-button'),
        themeToggle: document.getElementById('theme-toggle'),
        backToTopBtn: document.getElementById('back-to-top'),
        contactForm: document.querySelector('form[action="contact-form"]')
    };

    let alertModalElements = {};

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
                // No need to cache elements here anymore, alert.js handles it
            }
        } catch (error) {
            console.error("Could not load the alert modal component:", error);
        }
    };

    const showAlertModal = (options) => {
        // Check if the external script function exists
        if (typeof openAlertModal === 'function') {
            // PASS THE OPTIONS OBJECT CORRECTLY HERE
            openAlertModal(options); 
        } else {
            // Fallback if alert.js didn't load
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
                localStorage.removeItem('isLoggedIn');
                window.location.assign('/index.html');
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

    // --- 4. Scroll Logic (ScrollSpy & Navbar) ---
    const handleScroll = () => {
        if (elements.backToTopBtn) {
            if (window.scrollY > 300) elements.backToTopBtn.classList.remove('hidden');
            else elements.backToTopBtn.classList.add('hidden');
        }

        // Navbar bg
        if (elements.navbar) {
            if (window.scrollY > 50) elements.navbar.classList.add('py-2');
            else elements.navbar.classList.remove('py-2');
        }

        // ScrollSpy
        let current = '';
        elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    };

    const setupIntersectionObserver = () => {
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
                // Try relative path first, fallback to hardcoded local if needed
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

        // Click outside dropdowns
        document.addEventListener('click', (event) => {
            if (elements.profileMenuDropdown && 
                !elements.profileMenuDropdown.classList.contains('hidden') && 
                !elements.profileMenuButton.contains(event.target)) {
                elements.profileMenuDropdown.classList.add('hidden');
                elements.profileMenuDropdown.classList.remove('flex');
            }
        });

        window.addEventListener('scroll', handleScroll);
        
        updateUIForLoginState();
        handleScroll(); // Initial check
        setupIntersectionObserver();
        initContactForm();
    };

    init();
});