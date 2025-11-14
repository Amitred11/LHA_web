document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // --- Element Selectors ---
    const elements = {
        logoutButtons: document.querySelectorAll('.logout-button'),
        authRequiredLinks: document.querySelectorAll('.requires-auth'),
        authVisibilityElements: document.querySelectorAll('[data-auth]'),
        profileMenuButton: document.getElementById('profile-menu-button'),
        profileMenuDropdown: document.getElementById('profile-menu-dropdown'),
        mobileMenuButton: document.getElementById('mobile-menu-button'),
        mobileMenu: document.getElementById('mobile-menu'),
        navbar: document.getElementById('navbar'),
        sections: document.querySelectorAll('main section[id]'),
        navLinks: document.querySelectorAll('#navbar a.nav-link'),
        mobileNavLinks: document.querySelectorAll('#mobile-menu a'),
        body: document.body,
        heroCtaButton: document.getElementById('hero-cta-button') // New selector
    };

    // --- Function: Toggle UI based on Login State ---
    const updateUIForLoginState = () => {
        // This handles showing/hiding elements in the nav/mobile menu
        elements.authVisibilityElements.forEach(el => {
            const authState = el.getAttribute('data-auth');
            if (isLoggedIn) {
                el.style.display = authState === 'logged-in' ? '' : 'none';
            } else {
                el.style.display = authState === 'logged-out' ? '' : 'none';
            }
        });

        // This new logic updates the hero button's text and link
        if (elements.heroCtaButton) {
            if (isLoggedIn) {
                elements.heroCtaButton.textContent = elements.heroCtaButton.getAttribute('data-logged-in-text');
                elements.heroCtaButton.href = elements.heroCtaButton.getAttribute('data-logged-in-href');
            } else {
                elements.heroCtaButton.textContent = elements.heroCtaButton.getAttribute('data-logged-out-text');
                elements.heroCtaButton.href = elements.heroCtaButton.getAttribute('data-logged-out-href');
            }
        }
    };

    // --- Function: Handle Logout ---
    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    };

    // --- Function: Handle Auth-Required Links ---
    const handleAuthRedirect = (event) => {
        if (!isLoggedIn) {
            event.preventDefault();
            window.location.href = 'auth.html';
        }
    };
    
    // --- Function: Toggle Profile Dropdown ---
    const toggleProfileDropdown = () => {
        elements.profileMenuDropdown?.classList.toggle('hidden');
    };

    // --- Function: Toggle Mobile Menu ---
    const toggleMobileMenu = () => {
        const isMenuOpen = !elements.mobileMenu.classList.contains('hidden');
        elements.mobileMenu.classList.toggle('hidden');
        elements.body.classList.toggle('overflow-hidden', !isMenuOpen);
        const icon = elements.mobileMenuButton.querySelector('i');
        icon.classList.toggle('fa-bars', isMenuOpen);
        icon.classList.toggle('fa-times', !isMenuOpen);
    };

    // --- Event Listeners ---
    elements.logoutButtons.forEach(btn => btn.addEventListener('click', handleLogout));
    elements.authRequiredLinks.forEach(link => link.addEventListener('click', handleAuthRedirect));
    elements.profileMenuButton?.addEventListener('click', toggleProfileDropdown);
    elements.mobileMenuButton?.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when a link is clicked
    elements.mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!elements.mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        });
    });

    // Close profile dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (elements.profileMenuButton && !elements.profileMenuButton.contains(event.target) && !elements.profileMenuDropdown.contains(event.target)) {
            elements.profileMenuDropdown.classList.add('hidden');
        }
    });

    // --- Scroll and Animation Logic ---
    const handleScroll = () => {
        if (!elements.navbar) return;
        // Navbar background effect
        elements.navbar.classList.toggle('scrolled', window.scrollY > 50);

        // Active nav link highlighting
        let currentSectionId = '';
        elements.sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 100) {
                currentSectionId = section.getAttribute('id');
            }
        });

        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('href').includes(currentSectionId)) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    
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

    // --- Initial Setup ---
    updateUIForLoginState();
    handleScroll(); 
});