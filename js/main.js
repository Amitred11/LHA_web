// js/main.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar Login State Logic ---
    // Desktop Navs
    const navLoggedIn = document.getElementById('nav-logged-in');
    const navLoggedOut = document.getElementById('nav-logged-out');
    // Mobile Navs
    const mobileNavLoggedIn = document.getElementById('mobile-nav-logged-in');
    const mobileNavLoggedOut = document.getElementById('mobile-nav-logged-out');
    
    // All Logout Buttons
    const logoutButtons = document.querySelectorAll('.logout-button');

    // Check if the user is logged in and toggle visibility for BOTH desktop and mobile
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // --- Show LOGGED IN menus ---
        if (navLoggedIn) navLoggedIn.classList.remove('hidden');
        if (navLoggedOut) navLoggedOut.classList.add('hidden');
        
        if (mobileNavLoggedIn) mobileNavLoggedIn.classList.remove('hidden');
        if (mobileNavLoggedOut) mobileNavLoggedOut.classList.add('hidden');

    } else {
        // --- Show LOGGED OUT menus ---
        if (navLoggedIn) navLoggedIn.classList.add('hidden');
        if (navLoggedOut) navLoggedOut.classList.remove('hidden');

        if (mobileNavLoggedIn) mobileNavLoggedIn.classList.add('hidden');
        if (mobileNavLoggedOut) mobileNavLoggedOut.classList.remove('hidden');
    }

    // Add event listener for ALL logout buttons
    logoutButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            // Remove the login flag from localStorage
            localStorage.removeItem('isLoggedIn');
            // Redirect to home page to reflect the change
            window.location.href = 'index.html';
        });
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // --- Consolidated Scroll Event Logic ---
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const handleScroll = () => {
        // Navbar background effect on scroll
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active navigation link highlighting
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 100) { // Adjusted offset for better accuracy
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if the link's href contains the current section's ID
            if (link.getAttribute('href').includes(currentSectionId)) {
                link.classList.add('active');
            }
        });
    };

    // Attach the single scroll listener
    window.addEventListener('scroll', handleScroll);


    // --- Scroll-triggered Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 
    });

    revealElements.forEach(element => {
        observer.observe(element);
    });

});