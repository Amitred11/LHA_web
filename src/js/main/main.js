// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // --- Main Page Element Selectors ---
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
        heroCtaButton: document.getElementById('hero-cta-button')
    };

    // This object will be populated with the modal's elements after they are loaded.
    let alertModalElements = {};

    // --- Function: Load and Initialize Alert Modal HTML ---
    const loadAlertModal = async () => {
        // Prevent double loading
        if (document.getElementById('alert-modal')) {
            cacheModalElements();
            return;
        }

        try {
            const response = await fetch('/src/components/alert.html');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            
            const placeholder = document.getElementById('alert-modal-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
            } else {
                document.body.insertAdjacentHTML('beforeend', html);
            }

            cacheModalElements();

        } catch (error) {
            console.error("Could not load the alert modal component:", error);
        }
    };

    const cacheModalElements = () => {
        alertModalElements = {
            modal: document.getElementById('alert-modal'),
            dialog: document.getElementById('alert-dialog'),
            iconContainer: document.getElementById('alert-icon-container'),
            title: document.getElementById('alert-title'),
            message: document.getElementById('alert-message'),
            confirmButton: document.getElementById('alert-confirm-button'),
            cancelButton: document.getElementById('alert-cancel-button'),
        };
    };

    // --- Function: Show Custom Alert Modal ---
    const showAlertModal = ({ title, message, iconHTML, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm }) => {
        // Ensure elements are cached
        if (!alertModalElements.modal) cacheModalElements();

        // Fallback if modal still fails or functions from alert.js are missing
        if (!alertModalElements.modal || typeof openAlertModal === 'undefined') {
            if (window.confirm(`${title}\n${message}`)) {
                onConfirm();
            }
            return;
        }

        // Populate Content
        alertModalElements.title.textContent = title;
        alertModalElements.message.textContent = message;
        alertModalElements.iconContainer.innerHTML = iconHTML;

        // Recreate buttons to strip old event listeners
        const newConfirmButton = alertModalElements.confirmButton.cloneNode(true);
        newConfirmButton.textContent = confirmText;
        alertModalElements.confirmButton.parentNode.replaceChild(newConfirmButton, alertModalElements.confirmButton);
        alertModalElements.confirmButton = newConfirmButton;

        const newCancelButton = alertModalElements.cancelButton.cloneNode(true);
        newCancelButton.textContent = cancelText;
        alertModalElements.cancelButton.parentNode.replaceChild(newCancelButton, alertModalElements.cancelButton);
        alertModalElements.cancelButton = newCancelButton;
        
        // Call global function from js/alert.js
        openAlertModal();

        // Assign Actions
        alertModalElements.confirmButton.onclick = () => {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
            closeAlertModal();
        };

        alertModalElements.cancelButton.onclick = closeAlertModal;
    };

    // --- UI Logic ---
    const updateUIForLoginState = () => {
        elements.authVisibilityElements.forEach(el => {
            const authState = el.getAttribute('data-auth');
            el.style.display = isLoggedIn 
                ? (authState === 'logged-in' ? '' : 'none') 
                : (authState === 'logged-out' ? '' : 'none');
        });

        if (elements.heroCtaButton) {
            if (isLoggedIn) {
                elements.heroCtaButton.innerHTML = elements.heroCtaButton.getAttribute('data-logged-in-text') + ' <i class="fas fa-arrow-right ml-2"></i>';
                elements.heroCtaButton.href = elements.heroCtaButton.getAttribute('data-logged-in-href');
            } else {
                elements.heroCtaButton.innerHTML = elements.heroCtaButton.getAttribute('data-logged-out-text') + ' <i class="fas fa-arrow-right ml-2"></i>';
                elements.heroCtaButton.href = elements.heroCtaButton.getAttribute('data-logged-out-href');
            }
        }
    };

    const handleLogout = (event) => {
        event.preventDefault();
        // Updated Icon Style for Neo-Brutalist Theme
        const iconStyle = '<i class="fas fa-sign-out-alt text-3xl text-hot-pink"></i>';
        
        showAlertModal({
            title: 'Logging Out?',
            message: 'Are you sure you want to disconnect from the mainframe?',
            iconHTML: iconStyle,
            confirmText: 'Log Out',
            onConfirm: () => {
                localStorage.removeItem('isLoggedIn');
                window.location.assign('/index.html');
            }
        });
    };

    const handleAuthRedirect = (event) => {
        if (!isLoggedIn) {
            event.preventDefault();
            window.location.href = '/src/screens/auth/signin.html';
        }
    };
    
    const toggleProfileDropdown = (e) => {
        e.stopPropagation(); // Prevent immediate closing
        elements.profileMenuDropdown?.classList.toggle('hidden');
        elements.profileMenuDropdown?.classList.toggle('flex');
    };

    const toggleMobileMenu = () => {
        const isHidden = elements.mobileMenu.classList.contains('hidden');
        
        if (isHidden) {
            elements.mobileMenu.classList.remove('hidden');
            elements.mobileMenu.classList.add('flex');
            elements.body.classList.add('overflow-hidden');
            elements.mobileMenuButton.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            elements.mobileMenu.classList.add('hidden');
            elements.mobileMenu.classList.remove('flex');
            elements.body.classList.remove('overflow-hidden');
            elements.mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    };

    const handleScroll = () => {
        if (!elements.navbar) return;
        // Optional: Add specific class if you want navbar background to change on scroll
        if (window.scrollY > 50) {
            elements.navbar.classList.add('py-2');
        } else {
            elements.navbar.classList.remove('py-2');
        }
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

    // --- Initialization ---
    const initializePage = async () => {
        await loadAlertModal();
        
        elements.logoutButtons.forEach(btn => btn.addEventListener('click', handleLogout));
        elements.authRequiredLinks.forEach(link => link.addEventListener('click', handleAuthRedirect));
        
        if(elements.profileMenuButton) {
            elements.profileMenuButton.addEventListener('click', toggleProfileDropdown);
        }
        
        if(elements.mobileMenuButton) {
            elements.mobileMenuButton.addEventListener('click', toggleMobileMenu);
        }

        // Close mobile menu when clicking a link
        elements.mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!elements.mobileMenu.classList.contains('hidden')) {
                    toggleMobileMenu();
                }
            });
        });

        // Close dropdowns when clicking outside
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
        handleScroll(); 
        setupIntersectionObserver();
    };

    initializePage();
});