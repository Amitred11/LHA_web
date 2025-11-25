document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIG ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com'; 
    
    // --- 1. Theme Logic ---
    function toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    }

    // Desktop Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Mobile Toggle
    const mobileThemeToggle = document.getElementById('theme-toggle-mobile');
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

    // Initial Load Check
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    // --- 2. Mobile Menu Logic ---
    const menuBtn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('close-menu-button');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-link');
    const body = document.body;

    function toggleMenu() {
        // Check if menu is currently hidden
        const isHidden = menu.classList.contains('hidden');

        if (isHidden) {
            // OPEN MENU
            menu.classList.remove('hidden');
            // Small delay to allow display:flex to apply before opacity transition
            setTimeout(() => {
                menu.classList.add('flex');
                menu.classList.remove('opacity-0', 'scale-110'); // Ensure transition classes are active
            }, 10);
            body.style.overflow = 'hidden'; // Stop background scrolling
        } else {
            // CLOSE MENU
            menu.classList.remove('flex');
            menu.classList.add('hidden');
            body.style.overflow = 'auto'; // Restore background scrolling
        }
    }

    if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if(closeBtn) closeBtn.addEventListener('click', toggleMenu);
    
    // Close menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('flex');
            menu.classList.add('hidden');
            body.style.overflow = 'auto';
        });
    });

    // --- 3. Mobile FAB (Floating Action Button) Scroll Logic ---
    const fab = document.getElementById('mobile-fab');
    if(fab) {
        // Initial state
        fab.classList.add('translate-y-24', 'transition-transform', 'duration-300');
        
        window.addEventListener('scroll', () => {
            if(window.scrollY > 300) {
                fab.classList.remove('translate-y-24');
            } else {
                fab.classList.add('translate-y-24');
            }
        });
    }

    // --- 4. Countdown Timer ---
    const countDownDate = new Date("Nov 29, 2025 09:00:00").getTime();
    const timerInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const d = document.getElementById("d");
        const h = document.getElementById("h");
        const m = document.getElementById("m");
        const s = document.getElementById("s");

        if(d) d.innerHTML = days < 10 ? '0'+days : days;
        if(h) h.innerHTML = hours < 10 ? '0'+hours : hours;
        if(m) m.innerHTML = minutes < 10 ? '0'+minutes : minutes;
        if(s) s.innerHTML = seconds < 10 ? '0'+seconds : seconds;

        if (distance < 0) {
            clearInterval(timerInterval);
            if(d) document.getElementById("d").innerHTML = "00";
        }
    }, 1000);

    // --- 5. Alert Helper (Loading Reuse) ---
    let alertModalElements = {};
    const cacheModalElements = () => {
        alertModalElements = {
            modal: document.getElementById('alert-modal'),
            title: document.getElementById('alert-title'),
            message: document.getElementById('alert-message'),
            iconContainer: document.getElementById('alert-icon-container'),
            confirmButton: document.getElementById('alert-confirm-button'),
            cancelButton: document.getElementById('alert-cancel-button'),
        };
    };

    const loadAlertModal = async () => {
        if (document.getElementById('alert-modal')) {
            cacheModalElements();
            return;
        }
        try {
            const response = await fetch('/src/components/alert.html');
            if (response.ok) {
                const html = await response.text();
                const placeholder = document.getElementById('alert-modal-placeholder');
                if(placeholder) placeholder.innerHTML = html;
                cacheModalElements();
            }
        } catch (error) { console.error(error); }
    };

    // --- 6. Registration Form Logic ---
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            await loadAlertModal();
            cacheModalElements();

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/api/events/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    if (typeof openAlertModal === 'function') {
                        openAlertModal({
                            title: 'ACCESS GRANTED',
                            message: result.message,
                            iconHTML: '<i class="fas fa-ticket-alt text-4xl text-neon-lime mb-2 animate-bounce"></i>',
                            confirmText: 'Awesome',
                            cancelText: 'Close',
                            onConfirm: () => { window.location.reload(); }
                        });
                    } else {
                        alert(result.message);
                        window.location.reload();
                    }
                    form.reset();
                } else {
                    throw new Error(result.message || 'Registration failed.');
                }

            } catch (error) {
                if (typeof openAlertModal === 'function') {
                    openAlertModal({
                        title: 'ERROR',
                        message: error.message,
                        iconHTML: '<i class="fas fa-exclamation-triangle text-4xl text-pop-pink mb-2"></i>',
                        confirmText: 'Retry',
                        cancelText: 'Close'
                    });
                } else {
                    alert('Error: ' + error.message);
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});