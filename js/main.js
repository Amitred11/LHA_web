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
        navLinks: document.querySelectorAll('#navbar a.nav-link[href^="#"], #navbar a.nav-link[href^="index.html#"]'),
        mobileNavLinks: document.querySelectorAll('#mobile-menu a'),
        body: document.body,
        heroCtaButton: document.getElementById('hero-cta-button')
    };

    // This object will be populated with the modal's elements after they are loaded.
    let alertModalElements = {};

    // --- Function: Load and Initialize Alert Modal HTML from external file ---
    const loadAlertModal = async () => {
        try {
            const response = await fetch('components/alert.html');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            
            const placeholder = document.getElementById('alert-modal-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
            } else {
                document.body.insertAdjacentHTML('beforeend', html);
            }

            // Now that the modal is in the DOM, select its parts.
            alertModalElements = {
                modal: document.getElementById('alert-modal'),
                dialog: document.getElementById('alert-dialog'),
                iconContainer: document.getElementById('alert-icon-container'),
                title: document.getElementById('alert-title'),
                message: document.getElementById('alert-message'),
                confirmButton: document.getElementById('alert-confirm-button'),
                cancelButton: document.getElementById('alert-cancel-button'),
            };

            // Prepare the modal for animation by adding the initial opacity-0 class
            if (alertModalElements.modal) {
                alertModalElements.modal.classList.add('opacity-0');
            }

        } catch (error) {
            console.error("Could not load the alert modal component:", error);
        }
    };

    // --- Function: Show Custom Alert Modal ---
    const showAlertModal = ({ title, message, iconHTML, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm }) => {
        if (!alertModalElements.modal) {
            console.error('Alert modal is not available. Using fallback.');
            if (window.confirm(`${title}\n${message}`)) {
                onConfirm();
            }
            return;
        }

        alertModalElements.title.textContent = title;
        alertModalElements.message.textContent = message;
        alertModalElements.iconContainer.innerHTML = iconHTML;

        // Clone/replace buttons to remove old event listeners
        const newConfirmButton = alertModalElements.confirmButton.cloneNode(true);
        newConfirmButton.textContent = confirmText;
        alertModalElements.confirmButton.parentNode.replaceChild(newConfirmButton, alertModalElements.confirmButton);
        alertModalElements.confirmButton = newConfirmButton;

        const newCancelButton = alertModalElements.cancelButton.cloneNode(true);
        newCancelButton.textContent = cancelText;
        alertModalElements.cancelButton.parentNode.replaceChild(newCancelButton, alertModalElements.cancelButton);
        alertModalElements.cancelButton = newCancelButton;
        
        // Use the new open function for animation
        openAlertModal();

        // Assign actions to the new buttons
        alertModalElements.confirmButton.onclick = () => {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
            closeAlertModal();
        };

        alertModalElements.cancelButton.onclick = closeAlertModal;
    };

    // --- All other functions (updateUIForLoginState, handleLogout, etc.) remain the same ---
    const updateUIForLoginState = () => {
        elements.authVisibilityElements.forEach(el => {
            const authState = el.getAttribute('data-auth');
            el.style.display = isLoggedIn 
                ? (authState === 'logged-in' ? '' : 'none') 
                : (authState === 'logged-out' ? '' : 'none');
        });

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

    const handleLogout = (event) => {
        event.preventDefault();
        showAlertModal({
            title: 'Confirm Logout',
            message: 'Are you sure you want to sign out of your account?',
            iconHTML: '<i class="fas fa-sign-out-alt text-4xl text-red-400"></i>',
            confirmText: 'Logout',
            onConfirm: () => {
                localStorage.removeItem('isLoggedIn');
                window.location.assign('index.html');
            }
        });
    };

    const handleAuthRedirect = (event) => {
        if (!isLoggedIn) {
            event.preventDefault();
            window.location.href = 'auth.html';
        }
    };
    
    const toggleProfileDropdown = () => {
        elements.profileMenuDropdown?.classList.toggle('hidden');
    };

    const toggleMobileMenu = () => {
        const isMenuOpen = !elements.mobileMenu.classList.contains('hidden');
        elements.mobileMenu.classList.toggle('hidden');
        elements.body.classList.toggle('overflow-hidden', !isMenuOpen);
        const icon = elements.mobileMenuButton.querySelector('i');
        icon.classList.toggle('fa-bars', isMenuOpen);
        icon.classList.toggle('fa-times', !isMenuOpen);
    };

    const handleScroll = () => {
        if (!elements.navbar) return;
        elements.navbar.classList.toggle('scrolled', window.scrollY > 50);

        let currentSectionId = '';
        elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - elements.navbar.clientHeight - 50) { 
                currentSectionId = section.getAttribute('id');
            }
        });

        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSectionId) && currentSectionId) {
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

    // --- Main Initialization Function ---
    const initializePage = async () => {
        await loadAlertModal();
        
        elements.logoutButtons.forEach(btn => btn.addEventListener('click', handleLogout));
        elements.authRequiredLinks.forEach(link => link.addEventListener('click', handleAuthRedirect));
        elements.profileMenuButton?.addEventListener('click', toggleProfileDropdown);
        elements.mobileMenuButton?.addEventListener('click', toggleMobileMenu);

        elements.mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!elements.mobileMenu.classList.contains('hidden')) {
                    toggleMobileMenu();
                }
            });
        });

        document.addEventListener('click', (event) => {
            if (elements.profileMenuButton && !elements.profileMenuButton.contains(event.target) && !elements.profileMenuDropdown.contains(event.target)) {
                elements.profileMenuDropdown?.classList.add('hidden');
            }
        });

        window.addEventListener('scroll', handleScroll);

        updateUIForLoginState();
        handleScroll(); 
        setupIntersectionObserver();
    };

    // --- Start the initialization process ---
    initializePage();
});